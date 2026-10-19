# Índice de documentación

- README.md — propósito y principios.
- ../PLAN_MAESTRO.md — fases y criterios de salida.
- 01_METODOLOGIA_EVIDENCIA.md — clasificación de evidencia.
- 02_MERCADO_COMPETENCIA.md — marcas, formatos y precios.
- 03_PROVEEDORES.md — posibles proveedores y verificación.
- 04_COSTOS_YOGUR.md — costos y rendimiento por formato.
- 05_COSTOS_QUESILLO.md — costos y rendimiento por formato.
- 06_PRECIOS_CANAL_VENTAS.md — precio y canales.
- 07_INOCUIDAD_NORMATIVA.md — seguridad alimentaria y normativa.
- 08_ARQUITECTURA_APLICACION.md — herramienta interna.
- 09_DECISIONES_RIESGOS_BITACORA.md — decisiones, riesgos y avances.
- 10_PLANTILLA_LEVANTAMIENTO_MERCADO.md — ficha de observación de competencia.
- 11_PLANTILLA_COTIZACION_PROVEEDOR.md — ficha de cotización, usar solo con autorización.
- 12_COSTO_PROMEDIO_PONDERADO.md — reglas de CPP, inventario, lotes y compra sugerida.
- 13_DESPLIEGUE_RENDER.md — backend en Render, persistencia, seguridad y despliegue.
- 14_REFERENCIAS_PRECIOS_OCTUBRE_2026.md — referencias de precios y limitaciones.
- 15_COMPARATIVO_YOGUR_QUESILLO_SEPTIEMBRE_2026.md — comparativos por presentación y precio normalizado.
- 16_REFERENCIAS_CULTIVOS_ENVASES.md — referencias publicadas de cultivos/envases y validaciones pendientes.
- 17_REFERENCIAS_QUESILLO_ARTESANAL.md — referencias de quesillo artesanal y comparables industriales.
- 18_PRESUPUESTO_RENDER_Y_PERSISTENCIA.md — presupuesto de hosting y riesgos de persistencia.
- 19_RUTA_SANITARIA_POR_CONFIRMAR.md — ruta sanitaria preliminar pendiente de confirmación oficial.
- 20_AUDITORIA_PDF_ESTUDIO_MERCADO_YOGURES.md — auditoría de las 19 páginas del PDF local.
- 21_CONCILIACION_INVENTARIO_INICIAL.md — plantilla de conteo físico, conciliación y recetas reportadas.
- 22_CASOS_PRUEBA_CPP_Y_PRECIOS.md — criterios de aceptación y casos de prueba para CPP, precios y compras sugeridas.
- 23_ARQUITECTURA_GRATUITA_24_7.md — alternativas de hosting gratuito, cuotas, riesgos y candidata Cloudflare Workers + D1.
- 24_DASHBOARD_UX.md — visión, especificación y estado del dashboard inteligente responsive.
- 25_MODELO_DATOS_Y_FASES.md — entidades conceptuales, transacciones, auditoría y secuencia de implementación.
- ../AGENT_HANDOFF.md — protocolo de continuidad para cualquier agente, memoria perdida o interrupción.
- decisiones/D-014_MOTOR_CALCULO.md — decisión técnica del motor de cálculo aislado.
- ../app/README.md — instrucciones del prototipo de motor financiero.
- ../tests/test_costing.py — pruebas unitarias del motor financiero.
- ../tests/test_schema.py — pruebas de restricciones e inmutabilidad de los esquemas SQLite/D1.

## Estados

DOCUMENTADO = respaldado por documento/recibo identificable. DECLARADO = informado por el usuario, aún no verificado. MEDIDO = obtenido por medición física. PUBLICADO = visible en una fuente, no necesariamente verificado. COTIZADO = recibido directamente con fecha/condiciones. VERIFICADO = contraste independiente o documento primario confirmado. ESTIMADO = cálculo con supuestos visibles. HIPÓTESIS = por comprobar. PENDIENTE = desconocido. DESCARTADO = no supera validación, con motivo.

## Protocolo

Registrar fecha; conservar versiones anteriores; indicar IVA, transporte, mínimo, moneda, pago y vigencia; actualizar cálculos afectados; anotar qué evidencia cambiaría la recomendación.

- decisiones/D-015_HOSTING_GRATUITO.md — decisión provisional y condiciones para validar hosting sin mensualidad.
- decisiones/D-016_PRECIOS_MARGEN_VERSIONADO.md — margen por presentación, fórmula con comisión, versionado, redondeo y auditoría.
- decisiones/D-017_MICRO_UNIDADES_Y_OVERFLOW.md — precisión decimal, conversión a micro-unidades y límites INTEGER de SQLite/D1.
- ../app/core/storage_units.py — conversión segura Decimal/micro-unidades y costo extendido.
- ../tests/test_storage_units.py — pruebas de precisión, redondeo y overflow.
- ../app/core/pricing.py — motor de precios de referencia con Decimal.
- ../tests/test_pricing.py — pruebas del motor de precios y márgenes.
- ../spikes/cloudflare-d1/README.md — instrucciones del spike local de Workers + D1; no desplegado.
- decisiones/D-018_TASAS_CAMBIO_Y_FUENTES.md — BCV USD/EUR, muestra Binance P2P USDT/VES, políticas separadas por finalidad, historial y límites.
- decisiones/D-019_SEGURIDAD_IDENTIDAD_Y_PERMISOS.md — contrato previo a endpoints mutables: identidad, roles, auditoría, aprobación y secretos.
- ../app/core/exchange_rates.py — agregación P2P, conversión Decimal y validación de tasas.
- ../tests/test_exchange_rates.py — pruebas del motor Python de tasas.
- ../spikes/cloudflare-d1/src/exchange-rates.js — adaptadores BCV/Binance P2P y parser.
- ../spikes/cloudflare-d1/tests/exchange-rates.test.js — pruebas de parsers/adaptadores.
- ../spikes/cloudflare-d1/migrations/0006_exchange_rates.sql — observaciones, políticas y aplicaciones de tasas inmutables.
- ../spikes/cloudflare-d1/migrations/0007_exchange_rate_policy_retirement_guard.sql — protege los campos históricos al retirar una política activa.
- ../spikes/cloudflare-d1/migrations/0008_no_policy_reactivation.sql — impide reactivar versiones retiradas de políticas de precio o tasa; exige crear una nueva versión.
- ../spikes/cloudflare-d1/migrations/0009_immutable_cost_snapshots_and_losses.sql — hace inmutables los snapshots CPP de ingredientes/productos y los registros de merma.
- ../spikes/cloudflare-d1/migrations/0010_immutable_approved_recipes.sql — congela las recetas aprobadas y sus líneas, permite retiro sin reescribir historia y exige identidad de aprobador.


- ../spikes/cloudflare-d1/migrations/0011_production_batch_finalization_and_movement_reversals.sql — protege el cierre de lotes de producción y valida reversos exactos, únicos y enlazados.

- ../spikes/cloudflare-d1/migrations/0012_prevent_negative_inventory_balances.sql — impide saldos negativos de inventario por ubicación, lote y producto terminado.

- ../spikes/cloudflare-d1/migrations/0013_stock_balance_is_currency_independent.sql — corrige los triggers de saldo para sumar cantidad física independientemente de la moneda del costo.

- decisiones/D-020_COMANDOS_INVENTARIO_Y_MONEDA_VALORACION.md — contrato de validación de comandos de inventario y moneda de valoración del CPP.

- decisiones/D-021_VERIFICACION_JWT_CLOUDFLARE_ACCESS.md — diseño y límites del verificador RS256 de Cloudflare Access.

## Continuidad en GitHub / Google AI Studio

Documentos que se publican junto al código para que cualquier agente o herramienta continúe el trabajo sin depender del historial de chat.

- continuidad/README_PAQUETE_CONTINUIDAD.md — propósito y advertencias del paquete de continuidad.
- continuidad/CONTEXTO_MAESTRO_LACTOCOST.md — contexto verificado del proyecto: alcance, arquitectura, decisiones, límites, pendientes y checklist.
- continuidad/GUIA_GITHUB_Y_SINCRONIZACION_AI_STUDIO.md — procedimiento seguro de publicación en GitHub y sincronización con Google AI Studio.
- continuidad/PROMPT_INICIAL_GOOGLE_AI_STUDIO.md — prompt de arranque para retomar el proyecto en Google AI Studio tras importar el repositorio.
