# D-016 — Política de precios por presentación y margen objetivo

**Fecha:** 2026-10-09  
**Estado:** diseño implementado localmente; no aprobado como política comercial/fiscal final.

## Contexto
El usuario requiere cálculo automático y porcentaje de margen editable independientemente para cada producto. El prototipo de interfaz ya lo hace en memoria, pero eso no basta para operar: los objetivos necesitan persistencia, versionado, auditoría y precios reproducibles.

## Decisión provisional
- La regla de precio pertenece a la presentación vendible (product_format_id), no solo al nombre general del producto; por ejemplo, un yogurt de 200 g y otro de 500 g pueden tener objetivos distintos.
- El margen objetivo se define sobre ingreso neto antes de impuestos trasladados al cliente, no como recargo sobre costo.
- La tasa de comisión porcentual se aplica provisionalmente al precio neto. Los cargos variables fijos se expresan por unidad.
- Impuesto se modela solo como tasa añadida al precio neto y queda fuera de la contribución. Esto es un supuesto matemático, NO una determinación fiscal. Debe revisarse por jurisdicción, producto y canal.
- El redondeo es configurable por incremento de precio y usa ROUND_HALF_UP en la referencia Python. No fijar quantum monetario final hasta decidir moneda y reglas comerciales.
- Las políticas activas no se editan ni borran; se retiran sin alterar otros campos y se crea una nueva versión. Los snapshots de precio son append-only y tienen clave de idempotencia.
- El motor Python usa Decimal; el contrato D1 almacena tasas como texto decimal y montos como enteros micro-unidad. El API debe validar rangos, escalas y overflow, y demostrar paridad con Python.

## Fórmula
Con costo unitario C, costo variable fijo por unidad F, margen objetivo m y comisión porcentual r aplicada al precio neto:

precio neto sin redondear = (C + F) / (1 - m - r)

Se requiere 0 ≤ m < 1, 0 ≤ r < 1 y m + r < 1. El precio neto se redondea al incremento configurado. La contribución realizada después del redondeo se vuelve a calcular usando el precio ya redondeado. Precio al cliente = precio neto + impuesto añadido conforme al supuesto configurado; no aplicar automáticamente en producción hasta validar la regla fiscal.

## Esquema implementado
Las migraciones 0004_product_pricing_policies.sql y 0005_pricing_policy_retirement_guard.sql crean y endurecen:
- product_pricing_policies: versión, presentación, moneda, margen, comisión, cargo fijo, tasa fiscal configurada, incremento/redondeo, base de costo, razón, autor, aprobación y fecha efectiva.
- product_price_snapshots: costo usado, política, precios, contribución, calidad/completitud del costo, versión de cálculo, fecha, actor e idempotencia.
- Índice para una única política activa por presentación y triggers para proteger historial.

## Pruebas
app/core/pricing.py y tests/test_pricing.py cubren margen, comisión, cargos fijos, impuesto separado, redondeo, valores inválidos y resultados inmutables. tests/test_schema.py cubre unicidad de política activa, aprobación, retiro seguro e inmutabilidad de snapshots. Las migraciones 0004 y 0005 se aplican solo al D1 local. 0005 actualiza de forma segura los triggers de retiro para instalaciones que ya aplicaron 0004.

## Riesgos y no objetivos
- No existe aún endpoint/API que lea o escriba políticas; el Worker no debe exponer mutaciones antes de diseñar autenticación/autorización.
- No se conecta aún el costo de receta/lote real. Un costo marcado parcial no debe presentarse como costo completo ni dar falsa certeza sobre rentabilidad.
- No hay moneda, impuestos, política de redondeo ni canales comerciales aprobados.
- No usar los costos demo del dashboard para vender o comprar.
- Esta decisión no habilita despliegue remoto ni implica que la plataforma esté lista para producción.

## Siguiente puerta de salida
1. Definir moneda base y cómo se guardan cotizaciones/tasa histórica.
2. Definir costo completo por presentación: CPP de insumos, receta aprobada, rendimiento vendible, empaque y costos variables.
3. Especificar auth, permisos y recuperación de cuenta antes de endpoints mutables.
4. Crear API transaccional idempotente, auditoría y pruebas de paridad Python ↔ Worker.
5. Conectar UI solo cuando API y almacenamiento estén protegidos.


## Endurecimiento adicional — versiones retiradas (2026-10-09)

La migración `0008_no_policy_reactivation.sql` impide que una política de precio ya retirada vuelva a estado `active`. Una política retirada es un registro histórico terminal; cualquier cambio de margen, comisión, impuestos modelados, costo fijo o redondeo requiere una nueva versión, nueva aprobación y un snapshot nuevo. La regla se valida con `test_retired_pricing_policy_cannot_be_reactivated` en `tests/test_schema.py`. Aplicación realizada solo en D1 local; sin políticas comerciales sembradas.
