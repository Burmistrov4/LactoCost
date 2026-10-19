# HANDOFF MAESTRO PARA AGENTES — Yogur y quesillo

**Documento de entrada obligatorio para cualquier agente humano o IA.**  
**Última actualización:** 2026-10-09  
**Estado:** investigación + prototipos locales; NO producción.  
**Ruta raíz:** `C:\Users\Loro\Desktop\Analisis de Mercado de Yogurt`

## 0. Instrucción de continuidad

Antes de cambiar código o recomendar una decisión:

1. Leer este archivo completo.
2. Leer `PLAN_MAESTRO.md`.
3. Leer `docs/00_INDICE.md`.
4. Leer los últimos apartados de `docs/09_DECISIONES_RIESGOS_BITACORA.md`.
5. Leer `docs/08_ARQUITECTURA_APLICACION.md`, `docs/23_ARQUITECTURA_GRATUITA_24_7.md`, `docs/24_DASHBOARD_UX.md` y `docs/25_MODELO_DATOS_Y_FASES.md`.
6. Inspeccionar el código real y ejecutar las pruebas antes de asumir que una afirmación histórica sigue siendo cierta.
7. Registrar los cambios y los resultados en la bitácora y actualizar este handoff antes de terminar.

No confiar en memoria de conversación, resúmenes externos ni comentarios sin contrastar con los archivos actuales. Este documento es índice de continuidad, no sustituye al código ni a la bitácora.

## 1. Misión del proyecto

Estudiar la factibilidad comercial de yogurt y quesillo en Valencia/Carabobo y construir después una plataforma interna moderna, responsive e inteligente para registrar costos, CPP, insumos, compras, lotes, producción, mermas, vencimientos, precios y márgenes.

Orden obligatorio: investigación y evidencia → aplicación interna segura → tienda pública/SEO al final. No confundir hipótesis con datos confirmados. El dashboard debe terminar alimentándose exclusivamente de datos persistidos y cálculos reproducibles; las cifras actuales son de demostración.

## 2. Restricciones no negociables

- Objetivo prioritario: alojamiento web 24/7 con costo recurrente idealmente US$0, dentro de límites reales; no prometer SLA gratuito.
- Candidata provisional: Cloudflare Workers + D1 + assets estáticos. Aún no hay despliegue remoto ni cuenta/base remota creada por este trabajo.
- No comprar, fabricar, vender, contactar proveedores/autoridades, registrar dominio, publicar ni desplegar sin autorización expresa.
- No cargar precios, inventario, recetas ni datos personales reales en el prototipo actual.
- No ejecutar compras automáticamente: recomendaciones requieren aprobación humana.
- No alterar silenciosamente movimientos históricos ni CPP.
- No afirmar que un producto es sanitariamente apto, tiene vida útil o puede venderse hasta validar requisitos y controles.
- Preservar `app/core/costing.py` como referencia matemática hasta que cualquier port a JavaScript/TypeScript pase pruebas de paridad.
- No eliminar archivos ni hacer limpieza agresiva de repositorio sin comparar estado y respaldar lo relevante.
- No inventar disponibilidad de herramientas, resultados de pruebas ni estado de despliegue.

## 3. Mapa de archivos prioritarios

| Ruta | Función |
|---|---|
| `PLAN_MAESTRO.md` | Fases, objetivos y puertas de decisión |
| `docs/00_INDICE.md` | Mapa de documentos |
| `docs/09_DECISIONES_RIESGOS_BITACORA.md` | Cronología, cambios, resultados y bloqueos |
| `docs/08_ARQUITECTURA_APLICACION.md` | Arquitectura funcional |
| `docs/23_ARQUITECTURA_GRATUITA_24_7.md` | Hosting gratis y limitaciones |
| `docs/24_DASHBOARD_UX.md` | Diseño y requisitos del dashboard |
| `docs/25_MODELO_DATOS_Y_FASES.md` | Secuencia de implementación y modelo conceptual |
| `docs/decisiones/D-014_MOTOR_CALCULO.md` | Motor financiero |
| `docs/decisiones/D-015_HOSTING_GRATUITO.md` | Hosting candidato |
| `app/core/costing.py` | Fórmulas Python de CPP y costo de referencia |
| `app/core/pricing.py` | Motor de precios Decimal con comisión, cargo fijo, impuesto como escenario y redondeo |
| `app/core/storage_units.py` | Conversión estricta Decimal/micro-unidades, int64 y costo extendido seguro |
| `tests/test_storage_units.py` | Pruebas de precisión, redondeo y overflow |
| `docs/decisiones/D-017_MICRO_UNIDADES_Y_OVERFLOW.md` | Contrato provisional de precisión/almacenamiento |
| `tests/test_costing.py` | Pruebas Python del motor de costos |
| `tests/test_pricing.py` | Pruebas Python de precio/margen |
| `docs/decisiones/D-016_PRECIOS_MARGEN_VERSIONADO.md` | Contrato provisional de precio por presentación |
| `spikes/cloudflare-d1/src/index.js` | Worker mínimo |
| `spikes/cloudflare-d1/public/index.html` | Dashboard visual de prototipo |
| `spikes/cloudflare-d1/migrations/` | Migraciones de prueba |
| `spikes/cloudflare-d1/tests/worker.test.js` | Pruebas Node del Worker |
| `spikes/cloudflare-d1/README.md` | Instrucciones del spike |

## 4. Estado verificado al último trabajo

### Motor Python
- Módulo puro con Decimal; CPP ponderado, recepción con cargos/descuentos, salidas, rendimiento útil, costo por unidad vendible, precio por margen/markup, contribución y sugerencia de compra.
- Última ejecución completa actual: Python 46/46 PASS (15 costos + 10 precios + 8 almacenamiento/precisión + 13 esquema). `python -m compileall -q app tests` PASS. Repetir antes de continuar.

### Spike Cloudflare
- Node y npm disponibles en el equipo; Wrangler 4.149.0 instalado en `spikes/cloudflare-d1`.
- Última ejecución actual: `npm test` 11/11 PASS; `node --check src/index.js` y `node --check tests/worker.test.js` PASS.
- `node --check src/index.js` y `node --check tests/worker.test.js`: PASS.
- Wrangler local sirvió `/` con HTTP 200; contenido incluyó marca, resumen y advertencia de demostración.
- `GET /health`: HTTP 200.
- `GET /health/db`: HTTP 200 en entorno local con binding D1 local.
- Migraciones `0001` a `0005` aplicadas en D1 local; `0004_product_pricing_policies.sql` y `0005_pricing_policy_retirement_guard.sql` verificadas mediante consulta de tablas y triggers. Sin datos de negocio sembrados; no se usó `--remote`.
- La página `public/index.html` es una maqueta responsive con navegación, KPIs simulados, gráfico SVG, alertas, operaciones recientes, radar de rentabilidad y exportación CSV ficticia.
- Se detectaron dos tests rotos por cambio de etiqueta de estado y se corrigieron; los 5 tests volvieron a pasar. La primera prueba HTTP falló por intentar escribir la variable reservada PowerShell `$HOME`; se corrigió usando `$page` y las comprobaciones pasaron.
- El servidor local se envió a detener con Ctrl+C. Antes de reusarlo, comprobar procesos/puerto y no dejar servidores innecesarios activos.

### No hecho
- No hay cuenta ni D1 remoto creado por este trabajo.
- No hay despliegue, DNS ni dominio.
- No existe CRUD comercial, autenticación, usuarios, roles, backup remoto ni servicio de auditoría operativo (la tabla `audit_events` existe solo como esquema).
- No se ha aprobado un esquema final de base de datos.
- No hay UI de operación conectada a datos reales.
- Las cifras del dashboard son ficticias y no deben copiarse a costos ni decisiones de negocio.

## 5. Comandos iniciales de verificación

En PowerShell:

```powershell
Set-Location 'C:\Users\Loro\Desktop\Analisis de Mercado de Yogurt'
python -m unittest discover -s tests -v
python -m compileall -q app tests
Set-Location '.\spikes\cloudflare-d1'
npm test
node --check src/index.js
node --check tests/worker.test.js
```

Prueba local de Worker si hace falta:

```powershell
npx wrangler dev --local --port 8791
```

En otra terminal comprobar `http://127.0.0.1:8791/`, `/health` y `/health/db`. Usar `--local` en las pruebas locales. No usar `wrangler deploy`, `d1 create` ni operaciones remotas sin autorización explícita.

## 6. Próximo trabajo autorizado

1. Revisar y validar el HTML/CSS/JS del dashboard, corregir accesibilidad/responsive y agregar tests estáticos básicos.
2. Definir esquema D1 en migraciones versionadas: unidades, insumos, proveedores, cotizaciones, compras/recepciones, lotes, movimientos append-only, recetas versionadas, producción, productos terminados, mermas, ventas/precios por canal y eventos de auditoría.
3. Diseñar autenticación y permisos antes de cualquier CRUD con datos reales.
4. Crear repositorios y servicios con transacciones idempotentes; no poner lógica financiera en el navegador.
5. Portar fórmulas a TypeScript con tests de paridad y almacenamiento decimal seguro.
6. Agregar exportación y restauración comprobada.
7. Solo después considerar un D1 remoto de prueba; pedir autorización si crea recursos externos o requiere login.
8. Construir el dashboard sobre endpoints reales y retirar la etiqueta demo únicamente cuando todas las tarjetas deriven de datos reales verificables.

## 7. Protocolo de cierre de cada sesión

- Resumir objetivo y archivos tocados.
- Registrar comandos ejecutados, resultados reales, errores encontrados y cómo se corrigieron.
- Actualizar `docs/09_DECISIONES_RIESGOS_BITACORA.md`, `docs/00_INDICE.md` si aparecen documentos, y este archivo.
- Separar PASS, FAIL, BLOCKED y NOT RUN.
- Dejar el próximo paso concreto con archivo y criterio de aceptación.
- No decir “terminado” si queda una condición crítica abierta.

## 8. Reglas para decisiones y evidencias

Cada dato de mercado necesita fecha, moneda, unidad, ubicación, fuente y categoría de evidencia. Los datos de usuario/PDF son declarados hasta verificarse. Guardar fecha de compra y fecha efectiva de tasa de cambio separadamente. Toda cifra derivada debe poder recalcularse y mostrar supuestos.

**Última tarea completada:** dashboard demo v0.2 y Worker con assets locales.  
**Siguiente puerta de salida:** pruebas de UI/estática y esquema de datos revisado; todavía no se debe desplegar ni usar para operaciones reales.


## 9. Última actualización de sesión — 2026-10-09
Dashboard v0.2 creado y servido en local. Node tests 8/8 PASS; el JS inline se compila con `vm.Script`; el endpoint `/` se verificó HTTP 200 con el texto de demo. Ver `docs/24_DASHBOARD_UX.md`. Modelo de datos y fases propuestas en `docs/25_MODELO_DATOS_Y_FASES.md`. Próxima tarea: añadir validaciones UI adicionales y revisar preguntas bloqueantes de datos antes de definir la primera migración comercial. La maqueta sigue siendo demo y no se debe desplegar como producto final.


## 10. Última actualización de esquema — 2026-10-09
Se añadió migración `0002_business_foundation.sql` con catálogo de unidades/insumos/proveedores/cotizaciones, ubicaciones, lotes, movimientos, snapshots CPP y auditoría; triggers bloquean modificar/borrar movimientos y eventos de auditoría. Migración aplicada solo en D1 local. `tests/test_schema.py` valida restricciones e inmutabilidad. Última suite completa: Python 21/21 PASS, Node 8/8 PASS, compileall PASS. Próximo paso: diseñar productos/recetas/producción y servicios transaccionales; no implementar operaciones reales hasta decidir auth, moneda/unidades y precisión/CPP. Revisar bitácora antes de continuar.


## 11. Última actualización de producción — 2026-10-09
Se añadió migración `0003_products_recipes_production.sql` para productos/formatos, recetas versionadas, lotes, consumos, outputs, pérdidas, movimientos de producto terminado y snapshots de costo terminado. Migración aplicada solo en D1 local; 29 comandos ejecutados y tablas clave consultadas. `tests/test_schema.py` ahora valida ambas migraciones comerciales y tiene 8 pruebas de esquema; suite Python total 23/23 PASS. La última suite Node sigue en 8/8 PASS según ejecución previa a esta migración SQL. Próximo paso: repetir suite completa y diseñar transacciones de recepción/consumo/producción; no implementar datos reales hasta resolver autenticación, precisión/monedas/unidades y recuperación.


## 12. Cierre de validación integral — 2026-10-09
Última ejecución combinada: Python 23/23 PASS, compileall PASS, Node 8/8 PASS y `node --check` para Worker/tests PASS. Las migraciones 0001–0003 están aplicadas exclusivamente en D1 local. Se detectó y cerró un proceso Wrangler/workerd que seguía escuchando en el puerto 8791; se confirmó `PORT_8791_CLOSED`. No hay recursos remotos ni despliegue. El siguiente agente debe repetir los tests y leer `docs/09_DECISIONES_RIESGOS_BITACORA.md` antes de continuar.


## 13. Última actualización — calculadora de margen por producto — 2026-10-09
- Dashboard actualizado a prototipo v0.3.
- `spikes/cloudflare-d1/public/index.html` añade vista de precios con margen objetivo editable individual para yogurt natural 200 g, yogurt de fresa 200 g y porción de quesillo. Los costos iniciales son exclusivamente ficticios.
- Fórmula: `precio = costo variable unitario / (1 - margen objetivo)`. El precio y la contribución se recalculan al cambiar el porcentaje; se actualiza también el radar del dashboard. Se valida 0% ≤ margen < 100%; el costo debe ser finito y no negativo.
- Los cambios solo permanecen en memoria durante la sesión del navegador; aún no hay persistencia, API ni escritura en D1. No tratar el resultado como precio real, porque faltan costos confirmados, impuestos/comisiones, costos fijos y regla de redondeo comercial aprobada.
- `tests/worker.test.js` amplió la suite Node a 11 pruebas; `npm test` terminó 11/11 PASS. También se ejecutaron `node --check src/index.js` y `node --check tests/worker.test.js` en el mismo proceso, que terminó con código 0.
- No se desplegó ni se creó ningún recurso remoto. Próximo paso: prueba local visual/interactiva si hay navegador de automatización disponible; después diseñar persistencia/auditoría del margen por producto y pruebas de paridad con `app/core/costing.py`.

- Smoke test HTTP posterior: `GET /` contenía `pricingGrid`, `calculatePriceForMargin` y el radar; `/health` y `/health/db` devolvieron `ok`. Se detuvieron Node/Wrangler y el proceso hijo `workerd.exe`; se confirmó `PORT_8791_CLOSED`.
- Revalidación final posterior a los últimos cambios: Python 23/23 PASS, `python -m compileall -q app tests` PASS, Node 11/11 PASS y `node --check` del Worker/tests PASS; proceso combinado con código 0. No hay Playwright/Puppeteer/jsdom instalado en el spike, por lo que la prueba visual de navegador queda NOT RUN (no se instaló ninguna dependencia nueva).


## 14. Última actualización — motor y esquema de precios versionados — 2026-10-09
- Se añadió `app/core/pricing.py` como motor de precios de referencia con `Decimal`. Acepta costo unitario, margen objetivo, comisión porcentual sobre precio neto, cargo variable fijo por unidad, tasa de impuesto modelada como añadido al precio, e incremento configurable de redondeo `ROUND_HALF_UP`. Calcula precio neto, precio al cliente, comisión, contribución y margen realizado después del redondeo.
- Se añadió `tests/test_pricing.py` con 10 casos: margen, comisión, cargo fijo, impuesto separado, redondeo, límites, valores inválidos e inmutabilidad del resultado.
- Se crearon y aplicaron solo localmente `spikes/cloudflare-d1/migrations/0004_product_pricing_policies.sql` y `0005_pricing_policy_retirement_guard.sql`. Tablas: `product_pricing_policies` y `product_price_snapshots`. Una política activa por presentación, historial versionado, aprobación requerida, snapshots inmutables e idempotencia. La migración 0005 permite retirar una política activa sin reescribir campos históricos y actualiza triggers en bases que ya aplicaron 0004.
- Se amplió `tests/test_schema.py` a 13 pruebas de esquema y se añadieron 8 pruebas de almacenamiento/precisión. Última ejecución Python: 46/46 PASS; `python -m compileall -q app tests` PASS. Última suite Node: 11/11 PASS; `node --check` de Worker/tests PASS; migraciones 0004/0005 aplicadas localmente y tablas/triggers verificadas. Proceso combinado anterior a `storage_units.py` tuvo código 0; tras agregar almacenamiento se volvió a ejecutar Python + compileall y ambos pasaron.
- Se actualizó `docs/decisiones/D-016_PRECIOS_MARGEN_VERSIONADO.md`, `docs/25_MODELO_DATOS_Y_FASES.md`, índice, README de app/spike, PLAN MAESTRO y esta bitácora.
- No hay endpoint API de precios, CRUD, auth, ni conexión entre UI y política D1. La UI conserva cambios solo en memoria y usa costos ficticios. No crear ni desplegar recursos remotos.
- Supuestos pendientes: moneda, unidades/precisión, tratamiento fiscal por producto/canal, comisión real de cada canal, costo completo de cada presentación y quantum comercial de redondeo. La tasa de impuesto de la función es solo matemática, no consejo fiscal.
- Próximo paso: especificar servicio de lectura de costo por presentación y contrato de moneda/unidades/tasa histórica. Antes de endpoints mutables, definir auth/roles/recuperación segura; después construir API idempotente con auditoría y pruebas de paridad Python ↔ Worker.

- Control de versiones: se verificó `Test-Path .git = False` en la raíz. `git status`/`git diff --check` no se pudieron ejecutar porque el directorio no es un repositorio Git. No se inicializó Git ni se hizo commit/push sin autorización.

## 15. Última actualización — tasas BCV/Binance y políticas separadas — 2026-10-09

- D-018: se diseñó la tasa como observación histórica y política independiente por finalidad: `cost_conversion` y `sale_pricing`, ámbito global o producto, fuente/moneda/dirección configurables, antigüedad máxima y aprobación antes de activar.
- Migraciones `0006_exchange_rates.sql` y `0007_exchange_rate_policy_retirement_guard.sql`: `exchange_rate_observations`, `exchange_rate_policies`, `exchange_rate_applications`. Observaciones/aplicaciones append-only, política activa única por propósito/ámbito, tasas USDT aceptadas como código de activo de 4 caracteres. Aplicada solo en D1 local; tablas comprobadas vacías antes de corregir la definición inicial del esquema.
- `app/core/exchange_rates.py`: media/m mediana P2P configurable, filtros por liquidez/terminación/órdenes, conversión Decimal y validación.
- `spikes/cloudflare-d1/src/exchange-rates.js`: parser BCV de USD/EUR, adaptador Binance P2P para BUY/SELL, media de muestra con rango/cantidad y fallo cerrado.
- `spikes/cloudflare-d1/src/index.js`: `GET /api/exchange-rates/latest` y tarea `scheduled` que consulta fuentes y persiste observaciones. Cron de 30 minutos en `wrangler.jsonc`. No se desplegó ni se creó base remota; la tarea programada no está activa hasta desplegar.
- Smoke test real de fuente el 2026-10-09: BCV devolvió HTML de 153636 caracteres y se extrajeron USD 875.6505 VES/USD y EUR 980.61472543 VES/EUR, con fecha de publicación visible “Viernes, 09 Octubre 2026”. Binance P2P respondió con estructura `data.items`; BUY promedio 1018.71128571 (7 anuncios) y SELL promedio 1014.091625 (8 anuncios). Estos números solo prueban extracción en ese instante, no son valores sembrados ni garantizados.
- Suite: Python 57/57 PASS; compileall PASS; Node 25/25 PASS; `node --check` del Worker, adaptador, tests y script inline de UI PASS. Cron productivo en Cloudflare no probado; UI tiene solo previsualización de tasas en memoria.
- Pendiente crítico: persistir las políticas de selección, conectar cada finalidad al cálculo de costos/precios y proteger mutaciones con autenticación/autorización. El prototipo UI ya muestra fuente/fecha/antigüedad y permite previsualizar cada finalidad de forma independiente, sin persistencia. Confirmar estabilidad/condiciones de uso del endpoint P2P.

### Corrección operativa de D-018 — smoke test del cron local

El trigger se invocó con `GET /cdn-cgi/local/scheduled`. Persistió Binance P2P BUY/SELL y `GET /api/exchange-rates/latest` respondió con ambos registros. La consulta BCV falló desde el runtime local de Workers con error interno de fetch; no se eludió TLS. PowerShell de Windows sí pudo leer la página BCV y el parser extraer USD/EUR. Por tanto, el recolector completo es parcial: Binance end-to-end local PASS; BCV parser PASS contra HTML real, pero fetch desde Worker BLOCKED. No afirmar automatización BCV operativa hasta resolver el runtime de destino. Se terminó el proceso workerd de esta prueba; confirmar puerto 8791 cerrado.

## 16. Estado final de la última sesión — 2026-10-09

- Última suite: Python 57/57 PASS, `python -m compileall -q app tests` PASS, Node 25/25 PASS, `node --check` del Worker/adaptador/tests y script inline de UI PASS.
- Migraciones de tasas: `0006_exchange_rates.sql` y `0007_exchange_rate_policy_retirement_guard.sql` aplicadas a D1 local. La tabla local tiene observaciones reales capturadas por el smoke test Binance P2P BUY/SELL; no se cargaron precios de productos ni datos de negocio. No hay D1 remoto.
- El evento programado local respondió HTTP 200 y guardó 4 observaciones: BCV USD/EUR mediante fallback explícito a `https://bcv.today/api/v1/rate.json` (espejo no oficial, con `mirror_updated_at` en notas) y Binance P2P BUY/SELL. El fetch directo `www.bcv.org.ve` sigue fallando dentro de workerd local; el fallback funcionó. El cron productivo sigue sin probarse.
- El endpoint `GET /api/exchange-rates/latest` devuelve las observaciones más recientes y marca como stale las que superan 90 minutos para Binance o 36 horas para BCV; la previsualización UI muestra edad/fuente/dirección.
- `0007_exchange_rate_policy_retirement_guard.sql` evita reescribir los campos históricos al retirar una política activa.
- El servidor Wrangler y su proceso hijo fueron detenidos; comprobación final: `PORT_8791_CLOSED`.
- Siguiente tarea concreta: verificar el cron y el fallback BCV en un Worker desplegado con infraestructura aprobada, mantener vigilancia de frescura del espejo; después persistir los selectores como políticas versionadas y conectarlas a conversiones reales. Antes de mutaciones operativas, diseñar auth/roles.

### Avance de UI de tasas — 2026-10-09

- `spikes/cloudflare-d1/public/index.html`: la vista Configuración ahora carga `GET /api/exchange-rates/latest`, muestra observaciones, frescura, fuente y publicación; dos selectores independientes para conversión de costos y precio de venta; previsualización de importe→VES; default preferido BCV EUR/VES cuando esté disponible; advertencia si stale/suspect.
- El selector es solo una previsualización en memoria. No guarda preferencias, no crea/activa `exchange_rate_policies`, no aplica tasas al costing/pricing ni habilita operaciones. No eliminar estas advertencias antes de implementar auth, política persistida, auditoría y conexión real al motor.
- Endpoint probado en Wrangler local: devolvió 4 observaciones (BCV USD/EUR mediante espejo no oficial y Binance P2P BUY/SELL). El fetch directo del BCV sigue fallando dentro de workerd; el fallback al espejo sí funciona. No desplegado.
- Pruebas Node incluyen controles independientes, preferencia EUR, conversión y fallback BCV. Resultado final más reciente: Node 28/28 PASS; Python 57/57 PASS; compileall y comprobaciones sintácticas PASS. El puerto local quedó cerrado.


## 17. Cierre más reciente — fallback BCV y UI de previsualización (2026-10-09)

- Fuente directa: `https://www.bcv.org.ve/` falla en workerd local con error interno. Fallback funcional: `https://bcv.today/api/v1/rate.json`, espejo **no oficial** que declara usar tasas publicadas por BCV. Documentación pública lo identifica como no oficial y describe `USD`, `EUR`, `effective_date`, `updated_at` (ver `docs/decisiones/D-018_TASAS_CAMBIO_Y_FUENTES.md`). No llamarlo API oficial del BCV.
- El trigger local `GET /cdn-cgi/local/scheduled` respondió HTTP 200 y guardó observaciones BCV USD/EUR más Binance P2P BUY/SELL. `GET /api/exchange-rates/latest` devolvió 4 pares/finalidades; las notas guardan `transport=unofficial_bcv_mirror_fallback` y `mirror_updated_at`. El endpoint usa esa fecha para frescura y la UI muestra “BCV · espejo no oficial”.
- Al consultar D1 local, hay 2 observaciones BCV por moneda (misma publicación y mismo mirror timestamp, deduplicación operativa) y 6 observaciones Binance por dirección por las varias pruebas manuales. No hay compras, productos ni costos reales insertados. Solo D1 local.
- UI: dos selectores independientes y previsualización a VES, sin persistencia ni integración al motor de costos/precios. El default favorece BCV EUR/VES cuando está disponible y fresco; permite cambiarlo.
- Última validación final: Python 57/57 PASS; `python -m compileall -q app tests` PASS; Node 28/28 PASS; `node --check` de Worker/adaptador/tests y del JavaScript inline de UI PASS. Smoke test local después del último cambio: trigger HTTP 200, endpoint `GET /api/exchange-rates/latest` status `ok`, 4 observaciones disponibles (BCV USD/EUR espejo + Binance BUY/SELL). Muestras puntuales al momento: BCV USD 875.6505, EUR 980.61472543; Binance BUY 1006.79971429, SELL 1010.60011111 VES/USDT. No fijar esos valores como permanentes. El servidor se cerró y la comprobación final fue `PORT_8791_CLOSED`.
- Siguiente paso: verificar la tarea programada en un Worker desplegado solo cuando el usuario autorice y configure un D1 real; luego diseñar autenticación/roles y endpoints versionados para activar políticas, integrar conversión Decimal y registrar aplicaciones inmutables. No saltarse revisión de seguridad ni conectar el selector a datos reales todavía.


## 18. Seguridad de API y puerta de identidad — 2026-10-09

- Se repitió la suite antes de modificar: Python 57/57 PASS, `compileall` PASS, Node 28/28 PASS y `node --check` del Worker/adaptador/tests PASS.
- Se añadió `docs/decisiones/D-019_SEGURIDAD_IDENTIDAD_Y_PERMISOS.md`: contrato de autenticación, matriz de roles propuesta, auditoría append-only, separación de aprobación, secretos y criterios para abrir endpoints mutables. Recomienda evaluar Cloudflare Access como primera opción, pero no lo configura ni da por tomada la decisión.
- Se endureció el helper JSON común de `spikes/cloudflare-d1/src/index.js` con `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` y `Referrer-Policy: no-referrer`. Se agregó una prueba para verificar las cabeceras. Esto no es autenticación y no reemplaza la protección del HTML.
- La nueva prueba y el código deben volver a validarse al cierre. Próximo paso: terminar pruebas de seguridad de esquema y definir el flujo de identidad local/remoto antes de implementar cualquier endpoint mutable. No crear Cloudflare Access, D1 remoto ni desplegar sin autorización explícita.
- Sigue sin existir `.git`; no se hizo commit/push. No se modificaron tasas ni datos de negocio.


### Verificación final de la sección 18

- La primera ejecución falló por una expresión regular mal escapada en el test nuevo; se corrigió usando `startsWith("application/json")`.
- Validación final: Python 57/57 PASS; compileall PASS; Node 29/29 PASS; `node --check` del Worker, adaptador y tests PASS; proceso combinado exit 0 (`ALL_LOCAL_CHECKS_PASS`).
- El test comprueba las tres cabeceras defensivas y content-type JSON. No se inició servidor, no se tocaron datos de negocio y no se desplegó.
- Próximo paso recomendado: implementar una capa de autenticación verificable en pruebas (según decisión de identidad) y un middleware RBAC cerrado por defecto, todavía sin endpoints mutables, o continuar con pruebas de integridad del esquema. No conectar la UI a políticas persistidas hasta que esa puerta de seguridad esté cerrada.


## 19. Migración 0008 — políticas retiradas terminales (2026-10-09)

- Hallazgo: las políticas de precio/tasa retiradas podían volver a `active` por UPDATE SQL directo, reutilizando versión histórica. No existía endpoint mutante, pero el esquema debía cerrar la brecha.
- Se creó `spikes/cloudflare-d1/migrations/0008_no_policy_reactivation.sql`: triggers `pricing_policies_no_reactivation` y `exchange_rate_policies_no_reactivation` impiden esa transición. Cambios posteriores requieren una nueva versión.
- Se amplió `tests/test_schema.py` con dos pruebas de reactivación bloqueada. Suite final tras el cambio: Python 59/59 PASS; compileall PASS; Node 29/29 PASS; `node --check` del Worker/adaptador/tests PASS.
- Wrangler aplicó `0006`–`0008` solo localmente (`--local`, sin `--remote`). Consulta D1 local confirmó 18 observaciones de tasa, 0 políticas de precio, 0 políticas de tasa y ambos triggers nuevos. No se borraron observaciones ni se añadieron datos de negocio.
- Actualizados D-016, D-018, índice, README del spike, PLAN_MAESTRO, bitácora y este handoff. No se desplegó y no hay repositorio Git.
- Siguiente paso: definir/verificar identidad y RBAC antes de añadir endpoints mutables; continuar con pruebas de auditoría, idempotencia y paridad matemática mientras el entorno permanezca local.


## 20. Migración 0009 — snapshots CPP y mermas inmutables (2026-10-09)

- Auditoría de `0002`/`0003` detectó una brecha: los movimientos, auditoría, consumos/salidas y políticas ya tenían triggers de inmutabilidad, pero `inventory_cost_snapshots`, `finished_cost_snapshots` y `batch_losses` no.
- Se creó `spikes/cloudflare-d1/migrations/0009_immutable_cost_snapshots_and_losses.sql`, con UPDATE/DELETE bloqueados para las tres tablas. Recálculos CPP deben crear snapshots nuevos; una corrección de merma debe preservar el registro original.
- Se añadieron tres pruebas en `tests/test_schema.py`, que verifican UPDATE y DELETE rechazados en cada tabla.
- Validación final de código: Python 62/62 PASS; `compileall` PASS; Node 29/29 PASS; `node --check src/index.js`, `src/exchange-rates.js`, `tests/worker.test.js` PASS; proceso combinado exit 0 (`ALL_LOCAL_CHECKS_PASS`).
- Migración 0009 aplicada a D1 local mediante Wrangler (no `--remote`). Consulta posterior confirmó los seis triggers (`*_no_update`/`*_no_delete`) para las tres tablas. No se tocaron observaciones de tasas ni datos comerciales.
- Actualizados índice, README del spike, D-017 y bitácora. No se desplegó; no hay Git inicializado.
- Siguiente paso: probar invariantes de movimientos/reversos y snapshots bajo secuencias de operaciones; después diseñar un servicio de dominio puro para registrar movimientos de inventario con idempotencia, validación de existencias y auditoría transaccional. No publicar endpoints mutables hasta resolver identidad/RBAC según D-019.


## 21. Migración 0010 — recetas aprobadas inmutables (2026-10-09)

- Hallazgo: una receta aprobada y sus `recipe_lines` podían cambiar después de aprobación, alterando la composición histórica asociada a lotes y costos.
- Nueva migración `spikes/cloudflare-d1/migrations/0010_immutable_approved_recipes.sql`: requiere `approved_by` y `approved_at`; bloquea edición/borrado de versiones aprobadas/retiradas; solo permite retirar una receta aprobada sin alterar los demás campos; bloquea insertar/editar/borrar líneas salvo que la receta siga en borrador.
- Tres pruebas nuevas cubren inmutabilidad de versión, líneas bloqueadas y aprobación sin identidad. Validación final: Python 65/65 PASS, `compileall` PASS, Node 29/29 PASS y `node --check` de Worker/adaptador/tests PASS (`ALL_LOCAL_CHECKS_PASS`).
- Migración aplicada solo a D1 local mediante Wrangler con `CI=true`; consulta posterior confirmó los siete triggers de la migración. Sin `--remote`, sin recetas comerciales sembradas.
- Actualizados índice, D-017 y bitácora. No se desplegó; Git sigue sin inicializarse.
- Siguiente paso: auditar la inmutabilidad del lote de producción una vez completado y las reglas de reversión de movimientos; no implementar endpoints mutables hasta cerrar identidad/RBAC y auditoría transaccional (D-019).


## 22. Migración 0011 — lotes terminales y reversos exactos (2026-10-09)

- Auditoría del esquema detectó dos huecos: un lote de producción completado podía editarse retroactivamente y los movimientos aceptaban referencias de reverso sin validar correspondencia exacta ni impedir un segundo reverso.
- Nueva migración `spikes/cloudflare-d1/migrations/0011_production_batch_finalization_and_movement_reversals.sql`: protege transiciones de estado del lote, bloquea UPDATE/DELETE de lotes completados/cancelados, y solo permite insertar consumos/salidas/mermas mientras el lote está `in_progress`. Los lotes no se borran; deben conservarse y gestionarse por estado.
- Para movimientos de insumo y producto terminado, el reverso debe ser un nuevo movimiento `reversal`, enlazado a uno original que no sea a su vez un reverso; valida cantidad exactamente opuesta, misma entidad/lote/ubicación/moneda y mismo costo unitario/total. Un índice único impide más de un reverso por movimiento. No se permite rellenar `reverses_movement_id` en movimientos que no sean reversos.
- Se agregaron siete pruebas de esquema. Validación completa: Python 72/72 PASS; `python -m compileall -q app tests` PASS; Node 29/29 PASS; `node --check src/index.js`, `src/exchange-rates.js` y `tests/worker.test.js` PASS; salida combinada `ALL_LOCAL_CHECKS_PASS`.
- Migración 0011 aplicada mediante Wrangler **solo a D1 local**, con 11 comandos SQL ejecutados. No se usó `--remote`; no se insertaron datos comerciales y no se desplegó.
- Límite importante: los triggers preservan forma e historia, pero no implementan validación de stock no negativo, transacciones completas de producción ni auditoría atómica. Eso requiere servicios de dominio y pruebas de concurrencia antes de cualquier endpoint mutable.
- Próximo paso: verificar el catálogo local de triggers/migraciones, documentar este cierre y después diseñar una capa de dominio transaccional pura para registrar movimientos, validar existencias e insertar auditoría dentro de la misma transacción. Identidad/RBAC de D-019 sigue siendo bloqueante para exponer escrituras.


## 23. Migración 0012 — impedir existencias negativas (2026-10-09)

- Se creó `spikes/cloudflare-d1/migrations/0012_prevent_negative_inventory_balances.sql` para rechazar movimientos que dejen negativo el saldo agregado de un insumo por ubicación/moneda, el saldo de un lote concreto, o el saldo de producto terminado por presentación/ubicación/moneda. Añade índices para estas comprobaciones.
- Se agregaron tres pruebas de esquema: saldo agregado negativo, sobreconsumo de un lote aun cuando existe stock agregado en otro origen, y venta de producto terminado sin existencias. Se ajustaron las pruebas de reversos para mantener stock suficiente y verificar por separado el error de reverso no exacto.
- Validación integral final: Python 75/75 PASS; `python -m compileall -q app tests` PASS; Node 29/29 PASS; checks sintácticos de Worker/adaptador/tests PASS; `ALL_LOCAL_CHECKS_PASS`.
- La migración 0012 se aplicó a D1 local únicamente. Verificación posterior: los tres triggers (`inventory_movement_no_negative_balance`, `inventory_lot_movement_no_negative_balance`, `finished_movement_no_negative_balance`) aparecen en `sqlite_master` y Wrangler confirma `No migrations to apply`. No se usó `--remote`; no hay despliegue ni datos comerciales.
- Esta protección de esquema no sustituye una operación de dominio transaccional. El siguiente trabajo debe diseñar la transacción D1 que agrupe validación/idempotencia, movimiento, actualización de CPP/snapshot y evento de auditoría; probar que un fallo de cualquier paso no deja escrituras parciales. D-019 (identidad y autorización) continúa bloqueando endpoints mutables.


## 24. Corrección de balance físico por moneda — migración 0013 (2026-10-09)

- Revisión crítica de 0012 detectó un defecto conceptual: el saldo de cantidad física no puede dividirse por `currency_code`; un recibo valorizado en USD y una salida valorizada en VES representan el mismo stock físico. No se dejó pasar como correcto.
- Se creó `0013_stock_balance_is_currency_independent.sql`, que elimina/recrea los tres triggers de saldo para agregar cantidades sin filtrar por moneda. También corrige índices de balance y añade un índice para consultas por lote. No reescribe ni elimina movimientos históricos.
- Dos pruebas nuevas comprueban que un recibo en USD no permite sobreconsumir el mismo inventario en VES, tanto para insumos como para producto terminado.
- Validación integral final: Python 77/77 PASS; `python -m compileall -q app tests` PASS; Node 29/29 PASS; `node --check src/index.js`, `src/exchange-rates.js`, `tests/worker.test.js` PASS; `ALL_LOCAL_CHECKS_PASS`.
- Wrangler aplicó 0013 solo a D1 local (12 comandos ejecutados). Verificación: los tres triggers de saldo existen en `sqlite_master` y Wrangler confirma `No migrations to apply`. No se usó `--remote`; no hay despliegue ni datos comerciales.
- Próximo paso sigue siendo diseñar una operación D1 transaccional e idempotente para movimiento + CPP/snapshot + `audit_events`, con prueba de rollback ante fallos. La protección de saldo no negativo es estructural; no implementa autenticación/RBAC ni endpoints. D-019 continúa bloqueando escrituras expuestas.


## 25. Contrato de comando de inventario — D-020 (2026-10-09)

- Se añadió `spikes/cloudflare-d1/src/domain/inventory-command.js`, validador puro previo a cualquier I/O. Exige actor de contexto, motivo, idempotency key, IDs, fecha válida, clase/signo de movimiento coherentes, enteros seguros, costos no negativos y coherencia de costo total usando aritmética `BigInt` con escala de 1.000.000 y redondeo half-up.
- Define el contrato monetario: la cantidad física no se divide por moneda, pero el CPP debe calcularse en una moneda de valoración explícita. Rechaza movimientos cuya moneda valorizada difiera de la moneda configurada; si la moneda fuente es distinta, exige ID de una aplicación de tasa persistida. El futuro servicio aún debe verificar que la aplicación existe y coincide con importe, moneda, entidad y política.
- Pruebas nuevas en `tests/inventory-command.test.js`: validación de comandos válidos/inválidos, signos, enteros inseguros, totales inconsistentes, actor/motivo, monedas, evidencia de conversión y referencias. Python 77/77 PASS; Node 39/39 PASS; `node --check` de módulo de dominio, Worker, adaptador y pruebas PASS. Una primera ejecución encontró un escenario de prueba que fallaba por inconsistencia de costo antes de llegar a la condición de reverso; se corrigió el fixture para aislar el invariante, y la ejecución final pasó.
- D-020 documenta que este validador no autentica, no autoriza y no escribe en D1. No se conectó a rutas HTTP; no hay endpoints mutables ni despliegue.
- Siguiente paso: validar suite Node completa; luego diseñar servicio de persistencia transaccional D1 con idempotencia, validación de tasa persistida, movimiento + CPP/snapshot + auditoría en batch atómico, y pruebas de rollback. D-019 sigue bloqueando endpoints mutables.


## 26. Verificador aislado de Cloudflare Access JWT — D-021 (2026-10-09)

- Se añadió `spikes/cloudflare-d1/src/security/access-jwt.js`. Verifica JWT RS256 con WebCrypto y JWKS de Access; comprueba formato/tamaño, algoritmo, `kid`, firma, issuer exacto, audience esperado, `exp`, `nbf` y `sub` estable. Extrae la aserción únicamente desde `CF-Access-Jwt-Assertion`.
- `tests/access-jwt.test.js` genera claves RSA efímeras y prueba firma válida, token ausente/malformado, algoritmo no permitido, issuer/audience incorrectos, expiración, `nbf`, sujeto vacío, firma manipulada, clave ausente, JWKS inaccesible y configuración incompleta.
- Resultado tras la última corrección de fixture: Node 45/45 PASS; checks sintácticos del verificador, pruebas y validador de inventario PASS. Python 77/77 PASS en la ejecución integral previa y no se modificó Python desde entonces.
- D-021 documenta límites: el verificador no está integrado en el Worker, no asigna roles, no protege rutas, no se configuró Access ni se creó recurso remoto. Antes de producción necesita caché JWKS con TTL/rotación y una prueba real autorizada.
- Próximo paso: construir middleware de autenticación que falle cerrado solo después de definir configuración real de Access, seguido de RBAC por acción y auditoría transaccional. No habilitar escrituras hasta superar D-019 y las pruebas de rollback.
