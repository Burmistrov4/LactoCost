# PLAN MAESTRO — Factibilidad de yogur y quesillo

**Versión:** 0.1 · **Fecha:** 2026-10-09 · **Estado:** investigación.  
**Orden obligatorio:** investigar y validar → aplicación interna → tienda pública.

## 1. Visión
Determinar con evidencia si conviene revender productos terminados, fabricar yogur, fabricar quesillo o combinar modelos por fases. “No viable por ahora” es un resultado válido.

## 2. Objetivos verificables
- Medir precios y formatos de yogur y quesillo en Valencia/Carabobo.
- Identificar proveedores de leche, leche en polvo, azúcar, huevos, leche condensada, cultivos, fruta, envases, tapas, sellos, etiquetas, equipos, refrigeración y transporte.
- Conseguir cotizaciones comparables con cantidades mínimas y condiciones.
- Modelar costo completo por lote, unidad vendible, formato y canal.
- Calcular margen de contribución, punto de equilibrio, caja mínima, sensibilidad y merma.
- Investigar permisos, registro, etiquetado, trazabilidad, higiene, cadena de frío y vida útil validada.
- Evaluar venta directa, pedidos, comercios, cafeterías, panaderías y clientes mayoristas.
- Crear herramienta interna responsive para registrar evidencia y calcular costos.
- Crear marca y tienda pública/SEO al final, cuando la operación esté validada.

## 3. Fuera de alcance por ahora
No comprar, fabricar, distribuir, contactar proveedores en nombre del usuario, registrar dominios, publicar anuncios ni desplegar sistemas sin autorización expresa.

## 4. Fases y puertas de decisión
### F0 — Organización documental
Índice, metodología, bitácora, fuentes y lista de incógnitas. Cierre: afirmaciones relevantes tienen fuente/fecha o se marcan pendientes.

### F1 — Mercado y competencia
Yogur natural, firme, batido, bebible, griego/proteico, endulzado/frutal y quesillo tradicional en varios tamaños. Cierre: tabla comparable, evitando afirmar exhaustividad sin cobertura real.

### F2 — Abastecimiento
Fichas de proveedor con producto, ubicación, contacto publicado, precio, unidad, MOQ, transporte, pago, documentación y estado de verificación. Buscar dos fuentes por insumo crítico cuando sea posible.

### F3 — Ingeniería inversa de costos
BOM por receta/formato; rendimiento y pérdidas; costos directos, indirectos y de canal. Escenarios conservador/base/optimista con fórmulas visibles. No inferir recetas exactas de marcas competidoras.

### F4 — Viabilidad sanitaria y operativa
Confirmar con fuentes oficiales y autoridad competente la ruta para reventa, elaboración artesanal y fabricación. Definir controles de frío, higiene, lote, vencimiento y retiro. Sin esto no se recomienda producción comercial.

### F5 — Validación de demanda
Entrevistas, encuestas y pruebas de intención de compra sin anunciar como disponible producto no autorizado. Medir disposición a pagar, frecuencia, tamaño y canal.

### F6 — Especificación de aplicación
Requisitos, modelo de datos, fórmulas auditables, historial de cotizaciones, CSV, backups, pruebas y responsive.

### F7 — Implementación y validación
El motor financiero Python aislado sigue como referencia matemática. Antes de implementar la aplicación integrada, evaluar **Cloudflare Workers + D1** como candidata prioritaria para mantener el hosting recurrente en US$0 dentro de límites gratuitos. Esto supone reimplementar/adaptar el backend a JavaScript/TypeScript; no es compatible con desplegar Flask directamente. Hacer un spike técnico y pruebas de transacciones, seguridad, exportación y restauración antes de cerrar la decisión. Render + PostgreSQL de pago queda como alternativa si el plan gratuito no cubre requisitos. Ver `docs/23_ARQUITECTURA_GRATUITA_24_7.md`, además de `docs/13_DESPLIEGUE_RENDER.md` y `docs/18_PRESUPUESTO_RENDER_Y_PERSISTENCIA.md`.

### F8 — Marca, tienda pública y SEO
Solo tras validar producto, capacidad, permisos, logística y margen. Contenido real, catálogo, pedidos, políticas, SEO técnico, analítica y conversión. No prometer posiciones garantizadas.

## 5. Indicadores obligatorios
- Costo total del lote y costo por unidad vendible.
- Materia prima, empaque, mano de obra, energía/agua, limpieza, frío, transporte, comisión, merma, impuestos y costos indirectos.
- Margen bruto = (ingreso neto − costo de ventas) / ingreso neto.
- Contribución = ingreso neto − costos variables completos.
- Punto de equilibrio = costos fijos / contribución unitaria.
- Precio mínimo por canal, precio mayorista, capital de trabajo, rotación y vencimientos.
- Sensibilidad ante leche, envase, transporte, tasa de cambio y merma.

## 6. Requisito financiero obligatorio: costo promedio ponderado
La app debe calcular CPP de compras e inventario, costos de lote y costo de producto terminado. Ponderar precios por cantidades, incluir cargos de adquisición documentados y normalizar unidades/monedas sin alterar el historial. Incluir recomendación de compra con stock, consumo, plazo, seguridad, MOQ, vencimiento y presupuesto; nunca ejecutar compras sin aprobación humana. Especificación y pruebas: `docs/12_COSTO_PROMEDIO_PONDERADO.md` y `docs/22_CASOS_PRUEBA_CPP_Y_PRECIOS.md`. La conciliación física previa está en `docs/21_CONCILIACION_INVENTARIO_INICIAL.md`. Se permite únicamente el prototipo matemático aislado en `app/core/costing.py`; la app integrada espera conciliación, especificación aprobada, persistencia segura y pruebas.

## 7. Estado del prototipo de interfaz y continuidad
Se creó una maqueta visual de dashboard en `spikes/cloudflare-d1/public/index.html`. Solo usa cifras ficticias y no registra operaciones. La calculadora de margen editable está implementada en modo sesión, y el motor Decimal de precios y el esquema local versionado están en `app/core/pricing.py` y `spikes/cloudflare-d1/migrations/0004_product_pricing_policies.sql`; todavía no están conectados por API ni guardan cambios de la UI. Especificación UX en `docs/24_DASHBOARD_UX.md`, modelo en `docs/25_MODELO_DATOS_Y_FASES.md` y decisión D-016 en `docs/decisiones/D-016_PRECIOS_MARGEN_VERSIONADO.md`. Cualquier agente debe comenzar por `AGENT_HANDOFF.md`, repetir pruebas y actualizar bitácora/handoff. Próxima puerta: definir contrato de moneda, unidades, costos completos, auth y recuperación segura antes de endpoints mutables.

## 8. Auditoría del PDF de referencia del usuario
El PDF `Estudio de Mercado de Yogures en Valencia.pdf` se ha leído completo, pero sus cálculos y afirmaciones no se tratan como hechos verificados. Consultar `docs/20_AUDITORIA_PDF_ESTUDIO_MERCADO_YOGURES.md` antes de reutilizar sus cifras. Los costos por producto tienen versiones contradictorias y el concepto “ganancia neta” está sobreestimado por costos omitidos; tasas de cambio, precios de envases cuadrados, receta exacta del quesillo, peso de margarina y rendimientos quedan pendientes de confirmar. El PDF es una fuente de datos declarados por el usuario y de hipótesis a validar, no una cotización ni un estudio de mercado auditado.

## 8. Reglas de ingeniería inversa
Cada cifra lleva unidad, fecha, fuente y tipo de evidencia. Un precio minorista no se convierte en mayorista aplicando descuento arbitrario. El rendimiento se mide por lote. Las estimaciones muestran fórmula y rango. Un margen teórico no demuestra demanda.

## 9. Criterios de lanzamiento
Solo recomendar lanzamiento con demanda demostrable, contribución positiva en escenario adverso razonable, cadena de frío viable, capacidad, permisos aclarados y control de lotes/vencimientos.

## 10. Tasas de cambio y trazabilidad (D-018)

Las tasas BCV y Binance P2P se consultan como fuentes distintas, con su fecha y método. BCV ofrece referencias USD/VES y EUR/VES; Binance P2P aporta una muestra de anuncios USDT/VES en dirección BUY y SELL, no una tasa oficial. La configuración de tasa para convertir costos es independiente de la tasa para calcular precios de venta y admite ámbito global o futuro por producto. Las tasas ya aplicadas se conservan en un registro inmutable. No se permite activar una política sin aprobación ni utilizar una observación fuera de su ventana de frescura.

Estado: migración 0006, parsers, endpoint de lectura y cron cada 30 minutos preparados en el spike local. Binance P2P se consultó y persistió en D1 local. El fetch directo BCV falla dentro de workerd local, pero el fallback a BCV Today (espejo JSON no oficial de tasas publicadas por BCV) funcionó y guardó USD/EUR con procedencia explícita y frescura basada en actualización del espejo. No desplegado; el selector UI es solo previsualización en memoria, aún no conectado a políticas persistidas ni al flujo real de costos/precios. Pruebas: Python 57/57 y Node 28/28 PASS. Cron productivo no probado. Ver `docs/decisiones/D-018_TASAS_CAMBIO_Y_FUENTES.md`.


### Avance UI tasas (2026-10-09)

La vista Configuración del spike tiene dos selectores independientes de tasas para costo y venta, consultando el endpoint de lectura, con previsualización de conversión y etiquetas de frescura. Es UI de prototipo en memoria: aún no persiste políticas ni integra la conversión con los costos o precios reales. El fetch directo BCV falla en workerd local, pero el fallback al espejo JSON no oficial funciona y guarda USD/EUR con procedencia; Binance P2P se consulta/persiste en D1 local. No desplegado. Ver `docs/24_DASHBOARD_UX.md` y D-018.


## 11. Puerta de seguridad antes de CRUD y políticas persistidas (D-019)

No implementar endpoints mutables hasta cerrar proveedor de identidad, validación de identidad en servidor, matriz de roles, auditoría obligatoria, aprobación e idempotencia. La primera alternativa a evaluar es Cloudflare Access con validación de JWT en Worker, sujeto a configuración/autorización del propietario; no se ha configurado ni desplegado. Ver `docs/decisiones/D-019_SEGURIDAD_IDENTIDAD_Y_PERMISOS.md`. Las cabeceras HTTP defensivas recién añadidas son hardening básico, no sustituyen autenticación/autorización. El trabajo local puede continuar con pruebas de esquema, contratos y servicios puros sin datos comerciales ni mutaciones expuestas.


## 12. Integridad histórica adicional — migración 0009

La migración `spikes/cloudflare-d1/migrations/0009_immutable_cost_snapshots_and_losses.sql` hace append-only los snapshots CPP de ingredientes/productos y los registros de merma por lote. Se aplicó y verificó en D1 local; no en remoto. Tests actuales: Python 62/62 y Node 29/29 PASS. Antes de CRUD: completar identidad/RBAC y pruebas de movimientos/reversos, existencias no negativas según política, idempotencia y auditoría en la misma transacción. Ver D-017 y `AGENT_HANDOFF.md` sección 20.


## 13. Integridad de lotes y reversos — migración 0011 (2026-10-09)

La migración `spikes/cloudflare-d1/migrations/0011_production_batch_finalization_and_movement_reversals.sql` bloquea cambios retroactivos en lotes completados/cancelados, limita consumos/salidas/mermas a lotes en curso y valida que un reverso sea el opuesto exacto de un movimiento original. Solo admite un reverso por movimiento. Aplicada y verificada en D1 local; sin recursos remotos. Pruebas tras el cambio: Python 72/72 PASS, Node 29/29 PASS, compileall y checks sintácticos PASS. Esto no sustituye validación de existencias, transacciones de negocio, auditoría atómica ni autenticación/autorización. Siguiente puerta: servicio de dominio transaccional, con stock no negativo, idempotencia y auditoría en la misma operación; mantener endpoints mutables bloqueados hasta cerrar D-019.


## 14. Saldos no negativos — migración 0012 (2026-10-09)

La migración `0012_prevent_negative_inventory_balances.sql` agrega triggers para rechazar sobreconsumo por ubicación/moneda, sobreconsumo del lote específico y salida de producto terminado superior a existencias. Tres pruebas nuevas cubren los límites; suite final: Python 75/75 PASS, Node 29/29 PASS, compileall y checks sintácticos PASS. Aplicación local y verificación completadas: los tres triggers aparecen en `sqlite_master` y Wrangler informa que no quedan migraciones pendientes. Esto aún no implementa CPP transaccional ni auditoría atómica. Próximo paso: servicio de dominio que agrupe movimiento, snapshot/CPP e `audit_events` en un único batch transaccional idempotente, con fallo total ante cualquier inconsistencia; identidad/RBAC sigue bloqueando endpoints mutables.


## 15. Corrección de saldo físico independiente de moneda — migración 0013 (2026-10-09)

La revisión de 0012 detectó que filtrar el saldo físico por moneda podía permitir sobreconsumo cuando las entradas y salidas tenían monedas de costo diferentes. La migración 0013 recrea los triggers para sumar cantidad física por entidad/ubicación (y lote cuando aplica), sin particionar por moneda; también ajusta índices. Dos pruebas cubren insumos y productos terminados con entradas USD y salidas VES. Aplicada solo en D1 local y verificada; suite final Python 77/77, Node 29/29, compileall y checks sintácticos PASS. Siguiente paso: transacción idempotente movimiento + CPP/snapshot + auditoría, sin endpoints mutables hasta resolver identidad/RBAC.


## 16. Validación pura de comandos de inventario — D-020 (2026-10-09)

Se implementó `spikes/cloudflare-d1/src/domain/inventory-command.js` y su suite `tests/inventory-command.test.js`. Valida campos obligatorios, actor de contexto, idempotencia, signos, enteros seguros, coherencia de total/costo con `BigInt`, y moneda de valoración. Si la fuente está en moneda extranjera exige una aplicación de tasa persistida. No hace I/O, no autoriza y no se conectó a la API. La política de CPP debe usar una moneda de valoración explícita sin dividir stock físico por moneda. Validación: Python 77/77 y Node 39/39 PASS; checks sintácticos PASS. D-019 continúa bloqueando escrituras expuestas; sigue pendiente la persistencia transaccional con snapshot y auditoría atómica.


## 17. Verificación aislada de Cloudflare Access JWT — D-021 (2026-10-09)

Se implementó `src/security/access-jwt.js` con validación RS256/WebCrypto, firma JWKS, issuer, audience, `exp`, `nbf` y `sub`; seis grupos de pruebas con claves RSA efímeras cubren casos válidos y de rechazo. Node 45/45 PASS y checks sintácticos PASS. Python 77/77 PASS en la última suite integral antes de este módulo. **No está integrado en el Worker ni autentica rutas todavía**; tampoco se configuró Cloudflare Access ni se crearon recursos remotos. Para integrar: variables confiables de dominio/audience, caché JWKS segura, middleware fail-closed, RBAC y auditoría atómica. Mantener endpoints mutables bloqueados.
