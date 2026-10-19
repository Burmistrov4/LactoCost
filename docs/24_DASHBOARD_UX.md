# Dashboard inteligente — especificación UX y estado del prototipo

**Versión:** 0.3 · **Fecha:** 2026-10-09  
**Estado:** prototipo visual local; no conectado a datos reales.

## 1. Objetivo del dashboard

Convertir información de costos, inventario, producción y ventas en decisiones comprensibles. No debe ser una pantalla de métricas decorativas: cada indicador debe tener definición, procedencia, fecha de actualización, calidad de datos y acción posible.

## 2. Diseño implementado en prototipo

Archivo: `spikes/cloudflare-d1/public/index.html`.

- Identidad visual propia “Cuajada Studio”: verde oscuro, lima, superficies claras, tarjetas de borde suave, sombras discretas y tipografía de sistema.
- Sidebar desktop y menú lateral móvil.
- Navegación visual: Dashboard, Inventario, Producción, Costos & CPP, Compras, Precios & márgenes, Informes y Configuración.
- Banner persistente “Modo demostración” para evitar confundir cifras inventadas con información real.
- Cuatro KPI: ventas netas, margen de contribución, valor del inventario y CPP.
- Gráfico SVG sin librerías externas para ventas/costo variable.
- Estado de inventario, alertas, operaciones recientes y radar de rentabilidad.
- Filtros de 7/30/90 días que cambian los valores demo.
- Exportación CSV de indicadores ficticios con sufijo `_demo`.
- Vista Precios & márgenes con calculadora interactiva por producto: el margen objetivo se edita independientemente y precio/contribución se recalculan al instante.
- Fórmula explícita de margen sobre venta: `precio = costo unitario / (1 - margen)`, con margen permitido de 0% a menos de 100%; se rechazan valores inválidos.
- El radar de rentabilidad del dashboard se sincroniza con los márgenes editados en la sesión; el botón de restablecer recupera los valores demo.
- Los cambios de margen son temporales en memoria de página; todavía no existe persistencia, API ni base de datos conectada.
- Toasts accesibles para explicar que botones/vistas no persisten datos.
- Responsive para escritorio, tablet y móvil; soporte de `prefers-reduced-motion`, etiquetas ARIA en controles clave y foco visible.

## 3. Advertencia de alcance

Todos los números, operaciones, costos, existencias, vencimientos y recomendaciones actuales son **ficticios**. La calculadora sí realiza la fórmula matemáticamente, pero sus costos de entrada son ejemplos y los cambios no se guardan. La exportación solo exporta indicadores demo. No usar para comprar, fabricar, fijar precios reales ni valorar inventario. Salvo la calculadora local de demostración, las vistas de módulos secundarios son placeholders de navegación, no funcionalidades terminadas.

## 4. Definición del dashboard real

### Indicadores financieros
- Ventas netas por periodo/canal, separando facturado, cobrado, anulado y pendiente.
- Margen bruto y margen de contribución con definición visible; nunca llamar “ganancia neta” a la contribución.
- Costo variable completo y costos indirectos asignados con regla explícita.
- CPP actual por insumo y variación frente a periodos comparables.
- Costo de lote y costo por unidad realmente vendible.
- Punto de equilibrio y días de caja solo cuando existan datos suficientes.

### Inventario y cadena de frío
- Valoración a CPP, cantidad disponible, reservada, en tránsito y comprometida.
- Días de cobertura calculados a partir del consumo medido; mostrar ventana de datos.
- Alertas por debajo del mínimo, vencimiento, lote abierto, diferencia de conteo y dato desactualizado.
- FEFO para perecederos (primero vence, primero sale) cuando aplique y esté configurado.
- No afirmar vida útil segura por una fecha introducida sin validación del proceso.

### Inteligencia accionable
Cada recomendación debe mostrar:
1. Qué detectó.
2. Datos y periodo usados.
3. Fórmula/umbral.
4. Impacto potencial y nivel de confianza.
5. Acción sugerida.
6. Limitaciones y cuándo se actualizó.
7. Estado: informativa, requiere revisión o bloqueante.

Ejemplos futuros: “La leche cubriría 1,8 días según consumo de los últimos 14 días; se necesitan X litros para cubrir plazo + stock de seguridad; falta confirmar MOQ y presupuesto”. Nunca generar una orden o comprar automáticamente.

## 5. Reglas para que sea verdaderamente inteligente

- No mostrar KPI calculados con registros incompletos sin indicar “parcial” o “no disponible”.
- Separar “cero” de “sin datos”.
- Cada tarjeta debe enlazar a su detalle, cálculo y registros fuente.
- Explicar por qué cambia un KPI y distinguir variación de precio, cantidad, merma, mezcla de producto y canal.
- Detectar anomalías solo con una base suficiente; no inventar porcentajes o predicciones sin histórico.
- Evitar falsas alarmas y mostrar severidad + fecha límite + responsable.
- No mezclar monedas ni unidades sin conversiones explícitas e históricas.
- Mantener accesibilidad: teclado, contraste, etiquetas, mensajes y foco.
- Diseñar para ancho móvil desde el inicio; las tablas deben poder desplazarse o convertirse en tarjetas.
- Exportaciones deben incluir fecha, unidad, moneda, filtros y marca de calidad de datos.

## 6. Criterios de aceptación de UX

- [ ] Sin scroll horizontal global a 360, 390, 768, 1024 y 1440 px.
- [ ] Sidebar navegable por teclado; menú móvil se puede abrir y cerrar.
- [ ] Contraste y foco visibles; controles con nombre accesible.
- [ ] Los estados demo se identifican antes de las cifras y en exportaciones.
- [ ] Los filtros cambian solo los datos que corresponden y explican el periodo.
- [ ] Ningún botón simula guardar, comprar o modificar datos reales.
- [ ] El dashboard final consulta la API y presenta fecha/estado de actualización.
- [ ] Un error de API o límite de cuota se muestra como estado degradado, no como cero.
- [ ] Las recomendaciones se pueden rastrear hasta los datos y fórmula que las generaron.
- [x] En el prototipo, cada producto tiene margen objetivo editable e independiente; cambiarlo recalcula precio sugerido y contribución sin recargar.
- [x] El cálculo de precio rechaza margen menor que 0%, igual o mayor que 100%, costos negativos y entradas no numéricas.
- [x] El esquema local tiene políticas de precio versionadas por presentación y snapshots inmutables; pruebas cubren aprobación, política activa única, retiro seguro e idempotencia.
- [ ] En producción, la UI guardará y leerá esas políticas mediante API autenticada, con auditoría operativa de quién cambió el margen, fecha efectiva y autorización; el precio se recalculará en backend con decimal seguro.

## 7. Próximo paso

Las pruebas automatizadas del HTML/JS cubren fórmula, límites y controles básicos. El motor Python Decimal y el esquema local de políticas versionadas/snapshots ya existen, pero todavía no están conectados a la UI. Siguiente: definir contrato de costo por presentación y moneda; diseñar auth/roles/recuperación; crear API idempotente con paridad de cálculo y auditoría; después conectar la UI y probar navegador real. Mantener el dashboard como prototipo hasta que endpoints y almacenamiento estén seguros.


## Prototipo de selección independiente de tasas — 2026-10-09

La vista **Configuración** ahora consulta `GET /api/exchange-rates/latest` al abrirse y permite escoger una observación por separado para la previsualización de conversión de costos y de precios de venta. Prefiere BCV EUR/VES cuando existe una observación elegible; el usuario puede cambiar la fuente/dirección. Muestra proveedor, par, valor, fecha publicada cuando existe y antigüedad. Permite probar una cantidad y ver la conversión a VES, con validación y redondeo a centavos.

**Límites explícitos:** los selectores viven en memoria; no crean ni activan políticas en D1, no persisten preferencias, no aplican tasas a costos reales ni al motor de precios, y no deben usarse para registrar operaciones. Tasas stale/suspect se etiquetan y la previsualización indica no usarlas en operaciones. Se conserva la advertencia general de datos de dashboard ficticios.

La prueba local consultó `/api/exchange-rates/latest` y encontró 2 observaciones Binance P2P en D1 local. BCV no estaba disponible por el fallo de fetch desde workerd; por eso la opción por defecto en esa ejecución fue la primera tasa fresca disponible, Binance, no EUR. Esto no cambia la preferencia programada para BCV EUR cuando esté presente.


### Fuente de respaldo BCV — actualización 2026-10-09

El recolector ahora intenta primero el HTML de `https://www.bcv.org.ve/`. Si falla, consulta `https://bcv.today/api/v1/rate.json`, un **espejo no oficial** que publica JSON de las tasas atribuidas a BCV y documenta `effective_date`/`updated_at`. La app guarda `source_url` y notas de procedencia; la UI identifica el origen como “BCV · espejo no oficial”. La frescura de esta ruta usa el timestamp `mirror_updated_at`, no solo la hora de consulta, y marca obsoleta la observación si el espejo supera 36 horas. El espejo es un proveedor externo: monitorear disponibilidad y exactitud; si falta timestamp o falla la validación, no se acepta como fresco.
