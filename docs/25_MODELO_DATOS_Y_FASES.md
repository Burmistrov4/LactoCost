# Modelo conceptual de datos y secuencia de implementación

**Versión:** 0.2 · **Fecha:** 2026-10-09 · **Estado:** modelo conceptual + migración fundacional 0002; no es todavía el esquema final de la aplicación.

## 1. Principios

- D1/SQLite relacional, migraciones SQL ordenadas y revisadas.
- Todas las entidades de negocio tienen ID estable, timestamps y trazabilidad cuando aplique.
- Cantidad siempre incluye unidad base normalizada; registrar cantidad/unidad original de factura.
- Precio conserva moneda, fecha de cotización/compra y tasa aplicada como dato histórico.
- No almacenar importes como números binarios de punto flotante. Definir estrategia de enteros en unidad monetaria mínima o decimal de precisión fija, documentar redondeo y probar paridad con Python Decimal.
- No modificar movimientos históricos para corregir un error: generar reverso/ajuste enlazado, con motivo y actor.
- Borrado lógico solo cuando la norma de negocio lo permita; nunca borrar movimientos de inventario/costos auditables.
- Ninguna recomendación de compra debe crear una orden automáticamente.
- Separar datos maestros, eventos inmutables, snapshots calculados y vistas del dashboard.

## 2. Dominios propuestos

### Implementación inicial existente — migración 0002
`spikes/cloudflare-d1/migrations/0002_business_foundation.sql` crea tablas fundacionales de unidades/conversiones, insumos, proveedores, cotizaciones/líneas, ubicaciones, lotes, movimientos de inventario, snapshots CPP y auditoría. Añade índices, restricciones básicas e invariancia de movimientos/auditoría mediante triggers de SQLite.

Importes y cantidades usan enteros con escala de micro-unidades (1 unidad monetaria o unidad base = 1.000.000 micro-unidades) en esta primera propuesta. `app/core/storage_units.py` valida conversión estricta, pérdida de precisión explícita y límites int64; `extended_cost_micro()` evita el producto intermedio INTEGER potencialmente desbordado. La API debe replicar estos controles, no usar Number/float para el motor financiero y demostrar paridad. La escala sigue provisional hasta aprobar moneda/unidades y reglas de redondeo. Ver `docs/decisiones/D-017_MICRO_UNIDADES_Y_OVERFLOW.md`.

La migración 0002 NO implementa login, autorización, CRUD ni transacciones de negocio. La migración 0003 añade el esquema de productos terminados/formatos, versiones de recetas/líneas, lotes de producción, consumos, salidas, pérdidas, movimientos de inventario de producto terminado y snapshots de costo terminado. La migración 0004 añade políticas de precios versionadas por presentación y snapshots de precio inmutables; la 0005 endurece el retiro de políticas activas sin alterar sus campos históricos. Tampoco implementan servicios API ni flujos operativos. No introducir datos reales.

### Migración 0004 — precios y márgenes versionados
`spikes/cloudflare-d1/migrations/0004_product_pricing_policies.sql` crea políticas de precio por presentación vendible (`product_format_id`) y snapshots inmutables. Cada política conserva margen objetivo, comisión porcentual supuesta sobre precio neto, cargo variable fijo, tasa de impuesto configurada, moneda, incremento de redondeo, base de costo, razón, autor/aprobación y fecha efectiva. Solo una política puede estar activa por presentación. Las políticas activas no se editan; pueden retirarse sin alterar campos históricos. Los snapshots guardan el costo usado, precio neto, precio al cliente, contribución, completitud del costo, versión de cálculo e idempotencia.

Motor de referencia: `app/core/pricing.py`, con `Decimal`. La tasa fiscal es solo un parámetro matemático de impuesto añadido al precio; no es asesoría ni determinación fiscal. Comisión se aplica provisionalmente sobre precio neto. Antes de producción deben aprobarse moneda, unidades, reglas fiscales, costos variables por canal, quantum de redondeo y validación de overflow de enteros micro-unidad. Las migraciones 0004 y 0005 están aplicadas exclusivamente en D1 local y probadas con SQLite; no hay endpoints ni políticas comerciales sembradas.

### Migración 0003 — productos y producción
`spikes/cloudflare-d1/migrations/0003_products_recipes_production.sql` añade productos y formatos, recetas versionadas, lotes de producción, consumos de insumos, outputs, pérdidas, ledger de producto terminado y snapshots CPP de producto terminado. Bloquea UPDATE/DELETE de movimientos de producto terminado y eventos de consumo/salida; las correcciones deberán modelarse con eventos correctivos. Pruebas SQLite verifican tablas, aprobación de receta y triggers; Wrangler aplicó 29 comandos SQL en D1 local. Aún falta validar flujos transaccionales completos y reglas de costeo por lote.

### Identidad y auditoría
- `users`, `sessions` o mecanismo equivalente aprobado, `roles`, `user_roles`.
- `audit_events`: actor, acción, entidad, ID, fecha, motivo, correlación, datos no secretos antes/después según política.
- No implementar login improvisado; evaluar proveedor/mecanismo compatible con el nivel gratuito y diseñar recuperación segura.

### Catálogo y unidades
- `units`, `unit_conversions`, `ingredients`, `finished_products`, `product_formats`.
- Conversión solo entre dimensiones compatibles; densidades/conversiones masa-volumen requieren factor medido o fuente explícita.
- Desactivar un insumo no debe borrar su historia.

### Proveedores y cotizaciones
- `suppliers`, `supplier_products`, `quotes`, `quote_lines`.
- Guardar moneda, precio unitario, unidad, MOQ, vigencia, transporte, impuesto, método de pago, evidencia/fuente y estado de verificación.
- Precio publicado en web no es cotización directa; no asumir precio vigente.

### Compras y recepción
- `purchase_orders`, `purchase_order_lines`, `receipts`, `receipt_lines`, `supplier_invoices`.
- Separar pedido, recepción física y factura; permitir recepción parcial y discrepancias.
- Los cargos atribuibles y descuentos deben repartirse con regla declarada y reproducible.

### Inventario y CPP
- `inventory_lots`, `inventory_movements`, `inventory_balances` como proyección/reconstruible, `stock_counts`, `stock_count_lines`.
- Movimiento: tipo, cantidad firmada/base, unidad original, costo unitario/total, moneda, lote, documento fuente, actor, timestamp, idempotency key, reverso de movimiento y motivo.
- CPP móvil por insumo y almacén/ubicación según alcance; recepción recalcula CPP dentro de transacción.
- Salida valora al CPP vigente de la secuencia de movimientos; correcciones retroactivas requieren política formal y recálculo auditable.
- Lotes perecederos requieren fecha de recepción, apertura si aplica, vencimiento declarado, estado y ubicación. No inferir vida útil.

### Recetas y producción
- `recipes`, `recipe_versions`, `recipe_lines`, `production_batches`, `batch_consumptions`, `batch_outputs`, `batch_losses`.
- Versionar receta: una producción histórica conserva versión y cantidades realmente usadas.
- Rendimiento bruto, merma y unidades vendibles deben registrarse por lote.
- El costo terminado suma consumos valorados, cargos atribuibles y costos de conversión aprobados; el costo unitario usa unidades vendibles, no rendimiento teórico.
- Si faltan datos de mano de obra/energía/limpieza/frío, el costo se etiqueta parcial.

### Ventas y precio
- `sales`, `sale_lines`, `sales_channels`, `price_scenarios`, `price_history`, `returns`.
- Separar precio publicado, descuento, ingreso neto, comisión, entrega, impuestos y devoluciones.
- No inferir rentabilidad por margen bruto cuando el canal agrega costos variables.

### Compras sugeridas e informes
- `demand_forecasts` o resumen de consumo observado, `purchase_suggestions`, `exports_log`.
- La sugerencia guarda los datos/fecha usados, fórmula, stock disponible, reservado, en tránsito, plazo, stock de seguridad, MOQ, presupuesto y estado de aprobación.
- El pronóstico debe indicar periodo de observación y calidad; al no haber histórico, mostrar “datos insuficientes”.

## 3. Transacciones y seguridad

Las operaciones críticas son transaccionales:
- Recepción: validar documento/idempotencia → insertar recepción y líneas → movimientos de entrada → recalcular CPP → auditar → confirmar.
- Consumo de producción: validar stock y receta → movimientos de salida → calcular costo → registrar salida/rendimiento/merma → auditar → confirmar.
- Ajuste de conteo: guardar conteo y diferencia → movimiento de ajuste → motivo/actor → auditar.
- Reverso: crear movimiento inverso relacionado, no editar/borrar original.

Cada operación debe fallar por completo si una parte falla. Probar reintentos, doble envío, conflictos, stock negativo y concurrencia.

## 4. Secuencia de implementación

1. **A0 — contrato de datos:** revisar modelo con usuario; unidades/monedas, almacén único o múltiple, permisos y política de movimientos.
2. **A1 — migraciones base:** tablas maestras, unidades y auditoría; restricciones/índices y datos de prueba sintéticos.
3. **A2 — capa de repositorio y transacciones:** CRUD seguro de catálogos y pruebas de integridad.
4. **A3 — CPP:** portar fórmula con Decimal/precisión fija y pruebas de paridad frente a Python.
5. **A4 — recepción/consumo/ajuste:** movimientos append-only, idempotencia y saldos reconstruibles.
6. **A5 — recetas/producción:** recetas versionadas, lotes, rendimiento, merma y costo.
7. **A6 — precios versionados:** integrar `pricing.py`, políticas por presentación, snapshots inmutables, reglas por canal y aprobación humana.
8. **A7 — compras sugeridas:** reglas visibles, evidencia y aprobación humana.
9. **A8 — API y dashboard real:** auth primero; después sustituir mock data por API, estados de carga/error/sin datos y detalle de evidencia.
10. **A9 — exportación/restauración:** comprobar exportar, importar y conciliar cantidades/costos.
11. **A10 — seguridad, responsive y revisión:** auth, permisos, auditoría, pruebas móviles, seguridad y cuotas.
12. **A11 — evaluación de despliegue:** solo tras pruebas, autorización explícita y sin datos reales durante el piloto.

## 5. Preguntas que bloquean la especificación definitiva

No adivinar:
- ¿Moneda principal de captura: Bs., USD o ambas? ¿Qué moneda se usa para reportes?
- ¿Solo una persona/negocio o varios usuarios/roles?
- ¿Un almacén o varios puntos de stock?
- ¿Se registrará inventario inicial con costo documentado o costo pendiente?
- ¿Las ventas se registrarán dentro de la app o solo se calcularán precios?
- ¿Qué regla contable de CPP se necesita para entradas retroactivas/devoluciones?
- ¿Qué costos indirectos se asignan al lote y con qué driver?
- ¿La compra sugerida debe considerar presupuesto y MOQ desde la primera versión?

Mientras no se respondan, construir solamente pruebas, UI demo y modelos que no congelen una decisión equivocada.

## Tasas de cambio y aplicación histórica (migración 0006)

`exchange_rate_observations` guarda cada observación de proveedor, par de monedas, dirección P2P, método, cantidad de anuncios, fuente, fecha de publicación y consulta, frescura y rango de la muestra. `exchange_rate_policies` separa `cost_conversion` de `sale_pricing` y permite ámbito global o `product:<id>`; una política activa por finalidad/ámbito y aprobación obligatoria. `exchange_rate_applications` conserva tasa y montos originales/convertidos con regla de redondeo e idempotencia. Observaciones y aplicaciones son inmutables.

El código `src/exchange-rates.js` obtiene USD/EUR de la página BCV y promedia una muestra filtrada de anuncios P2P USDT/VES en ambas direcciones. La fuente P2P es una interfaz web no garantizada como API estable; errores de forma, red o filtro deben producir estado no disponible, nunca un valor inventado. El cron del Worker se configura cada 30 minutos; `GET /api/exchange-rates/latest` expone solo las observaciones persistidas. Ninguno de los dos está desplegado en un entorno remoto y la UI aún no consume el endpoint.

La migración `0007_exchange_rate_policy_retirement_guard.sql` añade protección para que retirar una política activa solo cambie el estado, sin reescribir proveedor, par, dirección, antigüedad, aprobación ni fechas. Se probó en SQLite. La actualización automática Binance P2P se ejecutó localmente y dejó observaciones reales de fuente en D1 local; BCV sigue bloqueado dentro del runtime Worker local por error de fetch/TLS, aunque la captura del HTML mediante PowerShell y su parser funcionaron. Ver D-018 y el último cierre de sesión en `AGENT_HANDOFF.md`.


## Integridad de lotes y reversos — migración 0011

La migración `0011_production_batch_finalization_and_movement_reversals.sql` fija estados terminales de lote y restringe la inserción de consumos, outputs y mermas a lotes `in_progress`. Los movimientos siguen siendo append-only: un reverso es una fila nueva, con cantidad exactamente opuesta, mismos datos de entidad/lote/ubicación/moneda/costos y relación uno-a-uno con el movimiento original. Un reverso no puede revertir otro reverso. Esto valida consistencia estructural, pero **no** garantiza existencias no negativas ni que el movimiento, CPP, snapshot y auditoría se escriban atómicamente. El servicio de dominio deberá resolver estas condiciones dentro de una transacción D1 y con idempotencia; después se requiere prueba de concurrencia. La migración se aplicó exclusivamente a D1 local; no hay API mutable ni despliegue.


## Saldos no negativos — migración 0012

La migración `0012_prevent_negative_inventory_balances.sql` verifica en cada INSERT que el saldo acumulado por insumo/ubicación/moneda y, si aplica, por lote no quede negativo. Para producto terminado comprueba producto/presentación/ubicación/moneda. Se agregaron índices de soporte y pruebas para consumo superior al saldo, sobreconsumo de un lote con stock en otro origen y venta sin stock. La base local ya tiene aplicada la migración; no hay despliegue remoto. La capa de dominio todavía debe envolver movimiento, cálculo CPP, snapshot e `audit_events` en una sola operación transaccional e idempotente, y probar reintentos/fallos.


## Corrección de saldos por moneda — migración 0013

La primera versión de los guards (0012) filtraba cantidad por moneda de costo, lo que no es válido para stock físico. La migración 0013 recrea esos triggers e índices para calcular el saldo de cantidad sin separar USD/VES; la moneda sigue siendo relevante para costos y valoración, no para contar unidades físicas. Se probaron entradas en USD frente a salidas en VES para insumos y productos terminados. Migración aplicada solo localmente y verificada. El próximo servicio debe además definir explícitamente cómo se convierten/agrupan valores monetarios al calcular CPP; no mezclar costos de monedas diferentes sin una conversión histórica trazable.
