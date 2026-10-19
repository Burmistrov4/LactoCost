# Aplicación interna inteligente — arquitectura preliminar

## Objetivo
Herramienta privada de investigación y cálculo económico antes de crear la tienda pública. Ayuda a decidir con números trazables; no reemplaza criterio profesional ni requisitos sanitarios.

## Stack de referencia inspeccionado
El proyecto de referencia TechLoan documenta Python 3.12, Flask 3.1, SQLite3, Jinja2, HTML5 semántico, CSS3 propio y JavaScript Vanilla. requirements.txt declara Flask 3.1.2 y Werkzeug 3.1.3. Sin frameworks frontend.

## Módulos propuestos
1. Dashboard de investigación: pendientes, cotizaciones incompletas y precios vencidos.
2. Catálogo de productos/SKU: yogur, quesillo, tamaño, canal y estado.
3. Fuentes/proveedores: contacto publicado, evidencia, cotización y verificación.
4. Insumos/unidades: kg, g, L, ml, unidad, docena y caja con conversiones explícitas.
5. BOM/recetas de prueba: cantidades, costo, versión y rendimiento observado.
6. Envases y empaques: componentes y costo por unidad vendible.
7. Lotes: producido, merma, rechazado, vendible, vencimiento y costo real.
8. Precio por canal: detal, mayor, gastronomía, pedido y entrega.
9. Simulador: escenarios, sensibilidad y punto de equilibrio.
10. Comparador fabricar vs revender.
11. Validación de demanda.
12. Exportación CSV/PDF y respaldo.
13. Auditoría de cambios y fuente de cifras.

## Inteligencia útil, sin humo
- Fórmulas deterministas con pruebas.
- Alertas de cotización vencida, margen negativo y dependencia de proveedor único.
- Sensibilidad que identifica qué variable cambia más el resultado.
- Comparación con incertidumbre visible.
- IA opcional para resumir cotizaciones/clasificar documentos con revisión humana.
- Nunca usar respuesta generativa como fuente final de precio o cálculo financiero.

## Modelo de datos inicial
Supplier, SourceEvidence, Quotation, Ingredient, PackagingComponent, ProductSKU, RecipeVersion, RecipeLine, ProductionBatch, YieldObservation, SalesChannel, PriceScenario, CostSnapshot, DemandInterview, RegulatoryTask, DecisionLog.

Guardar moneda, fecha, unidad, IVA, flete, MOQ, vigencia y enlace/documento. No sobrescribir cotizaciones históricas.

## Despliegue: objetivo de costo cero revisado
La prioridad del usuario es una plataforma accesible 24/7 sin mensualidad. Antes de construir la aplicación integrada se evaluará Cloudflare Workers + D1, dentro de sus cuotas gratuitas y con exportación/restauración probadas. Esto cambia la arquitectura de backend respecto a Flask: requiere adaptación a JavaScript/TypeScript y pruebas equivalentes del motor financiero. Render + PostgreSQL de pago queda como alternativa; Render gratuito no debe almacenar datos críticos. Ver `docs/23_ARQUITECTURA_GRATUITA_24_7.md`, `docs/13_DESPLIEGUE_RENDER.md` y `docs/18_PRESUPUESTO_RENDER_Y_PERSISTENCIA.md`.

## Dashboard visual v0.2
Se creó `spikes/cloudflare-d1/public/index.html`: dashboard responsive “Cuajada Studio” con KPIs de demo, gráfico SVG, salud del inventario, alertas, operaciones recientes, radar de rentabilidad, navegación y exportación CSV ficticia. Las cifras están claramente marcadas como simuladas. El Worker sirve los assets estáticos desde la ruta `/`. Se añadieron tests estáticos del HTML, navegación/responsive y compilación del JS inline. Resultado actual: 8/8 pruebas Node PASS. Es una maqueta de UX, no una aplicación conectada a datos reales. Especificación: `docs/24_DASHBOARD_UX.md`.

## Spike de hosting gratuito
Se creó `spikes/cloudflare-d1/` con un Worker mínimo, endpoint de salud, verificación de binding D1, migración SQL de prueba y tests con Node. Se instaló Wrangler 4.149.0 localmente. Pruebas: Node 5/5 PASS; Wrangler local respondió correctamente en `/health` y `/health/db`; la migración D1 local se aplicó y la tabla `spike_probe` fue confirmada por consulta. No hay CRUD de negocio ni datos reales. No se creó una base remota ni se desplegó el Worker. Ver `spikes/cloudflare-d1/README.md`.

## Esquema D1 fundacional
Se añadieron `0002_business_foundation.sql` (unidades, insumos, proveedores/cotizaciones, ubicaciones, lotes, movimientos inmutables, snapshots CPP y auditoría) y `0003_products_recipes_production.sql` (productos terminados, formatos, recetas versionadas, lotes de producción, consumos, salidas, pérdidas y movimientos de producto terminado). Ambas se aplicaron a D1 local y se validaron con `tests/test_schema.py`. Resultado actual: 23 pruebas Python y 8 Node PASS. Es solo esquema; todavía no hay login, CRUD ni servicios transaccionales. Ver `docs/25_MODELO_DATOS_Y_FASES.md`.

## Costo promedio ponderado — requisito no negociable
Implementar CPP de compras y existencias (promedio móvil como método operativo inicial, más informe periódico cuando sea útil), costo de fabricación por lote y costo promedio de producto terminado. Conservar movimientos y snapshots históricos, moneda/tasa, unidad base, flete, descuentos, impuestos recuperables/no recuperables y evidencia. La recomendación de compra será automática en cálculo, pero la orden siempre requiere aprobación humana. Ver `docs/12_COSTO_PROMEDIO_PONDERADO.md`.

## Estado de implementación — prototipo de motor financiero
Se creó app/core/costing.py con funciones puras para CPP ponderado, recepción con cargos/descuentos, valoración de salida, costo por rendimiento útil, costo por unidad vendible, margen, markup, contribución y compra sugerida. Usa Decimal y no tiene aún interfaz, persistencia, conversión de moneda/unidad ni inventario transaccional. Pruebas en tests/test_costing.py: la primera ejecución pasó 15 pruebas. No es todavía una aplicación lista para usuarios ni producción. Decisión: docs/decisiones/D-014_MOTOR_CALCULO.md.

## Pruebas mínimas
Fórmulas de costo/margen/markup/punto de equilibrio/CPP; conversiones sin confundir masa/volumen; IVA/descuentos sin doble conteo; flete prorrateado; moneda y tasa histórica; rendimiento/merma; escenarios reproducibles; seguridad de autenticación/CSRF; responsive/accesibilidad; exportación, backup y restauración.
