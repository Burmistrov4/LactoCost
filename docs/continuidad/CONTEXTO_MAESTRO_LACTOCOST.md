# LactoCost — Contexto maestro para continuidad del proyecto

**Fecha de preparación:** 2026-10-19  
**Idioma de trabajo:** español  
**Estado de este documento:** contexto reconstruido a partir del historial de trabajo disponible; no equivale a una nueva inspección del disco en esta fecha.  
**Ruta local conocida:** `C:\Users\Loro\Desktop\Analisis de Mercado de Yogurt`  
**Repositorio GitHub actual:** `https://github.com/Burmistrov4/LactoCost`

> Este archivo está diseñado para que una nueva IA, Google AI Studio, Gemini, Claude, ChatGPT u otro agente pueda retomar el trabajo sin inventar el estado del código. La información marcada como “reportada en la sesión anterior” debe volver a verificarse con los archivos y las pruebas actuales antes de tomar decisiones.

---

## 1. Resumen ejecutivo

LactoCost es una aplicación en construcción para ayudar a analizar, costear, producir y gestionar un pequeño negocio de yogurt y quesillo. No es únicamente una calculadora de precios: la intención es llegar a una herramienta coherente que conecte recetas, costos de insumos, compras, lotes de producción, mermas, inventario físico, costos promedio, márgenes, tasas de cambio y precios de venta.

El proyecto ha avanzado mediante módulos de dominio Python y un prototipo aislado basado en Cloudflare Workers + D1. Hay validadores y reglas de costo/precio, una interfaz exploratoria y una colección de migraciones SQL orientadas a proteger la consistencia de inventario y la inmutabilidad de datos históricos. No debe confundirse ese avance con un sistema completo: varios módulos existen como código aislado y todavía no están conectados a rutas de API, persistencia, autenticación ni una aplicación integrada.

La prioridad actual no es añadir muchas pantallas ni rediseñar todo desde cero. Es **reconciliar el código real, preservar las reglas económicas ya implementadas, cerrar brechas de consistencia transaccional y seguridad, probar los flujos completos y solo entonces consolidar la UI y preparar un despliegue**.

## 2. Nombre, propósito y alcance funcional

### Nombre de trabajo

- **Marca/nombre visible propuesto:** LactoCost.
- **Subtítulo:** Gestión de costos, producción e inventario lácteo.
- **Repositorio GitHub existente:** [`Burmistrov4/LactoCost`](https://github.com/Burmistrov4/LactoCost).
- **Descripción breve:** Sistema para analizar el mercado y gestionar recetas, compras, lotes de producción, inventario, costos y precios de productos como yogurt y quesillo.

El repositorio `Burmistrov4/LactoCost` ya existe. Su nombre no implica que se haya verificado una marca comercial registrada ni la disponibilidad de dominios relacionados.

### Objetivos funcionales

1. Registrar productos terminados, ingredientes/insumos, unidades, proveedores y referencias de cotizaciones.
2. Modelar recetas aprobadas y versionadas, con cantidades exactas por ingrediente.
3. Registrar compras y entradas de inventario con moneda de origen y moneda de valoración explícita.
4. Costear producción por lote; vincular consumos, rendimiento, productos obtenidos y mermas.
5. Mantener inventario por ubicación/almacén y evitar stock negativo.
6. Calcular costo promedio ponderado (CPP) sin destruir el historial ni reinterpretar saldos históricos.
7. Guardar instantáneas de costo para que los resultados históricos no cambien silenciosamente al actualizar ingredientes o tasas.
8. Calcular precio de venta con margen objetivo editable por producto, comisiones, costos adicionales y reglas de redondeo explícitas.
9. Diferenciar margen bruto, contribución y margen real, y documentar qué costos/impuestos se incluyen en cada escenario.
10. Consultar tasas BCV USD/EUR y referencias Binance P2P USDT/VES. Permitir una política para convertir costos y otra, independiente, para la conversión de precios de venta.
11. Mostrar el origen, fecha, antigüedad y confianza de las tasas; nunca inventar una tasa si las fuentes fallan.
12. Exponer un dashboard moderno, accesible y adaptable a escritorio/tablet/móvil, con advertencias claras y trazabilidad.
13. Apoyar análisis de mercado y comparación de costos/precios sin introducir datos falsos de proveedores o transacciones reales.

### Usuarios previstos

Inicialmente, el dueño u operador de un pequeño negocio artesanal. Puede que más adelante haya usuarios con roles distintos, pero no se debe dar por implementada autenticación, autorización o RBAC hasta comprobarlo en el código y en pruebas integradas.

## 3. Principios y límites no negociables

- **No inventar datos de negocio.** No simular proveedores reales, compras reales, movimientos de inventario, ventas, costos históricos ni credenciales. Para demos, usar datos claramente etiquetados como ficticios y únicamente con aprobación/alcance de prueba explícito.
- **No alterar datos históricos para que cuadren.** Las migraciones nuevas deben evitar reescrituras destructivas y preservar la trazabilidad.
- **No exponer secretos.** No copiar `.env`, claves API, tokens, credenciales, URLs privadas o dumps con información sensible a GitHub, prompts, documentación pública ni capturas.
- **No publicar/deployar por sorpresa.** No crear servicios remotos, bases de datos, dominios, aplicaciones Cloudflare Access, recursos Google Cloud o despliegues reales sin aprobación explícita.
- **No realizar acciones Git remotas destructivas.** El repositorio remoto ya existe: `https://github.com/Burmistrov4/LactoCost`. En la consulta del 2026-10-19, GitHub informó rama predeterminada `main`, visibilidad pública y tamaño reportado `0`; estos metadatos no sustituyen la inspección de ramas, contenido, commits y estado local. No asumir que la carpeta local tiene o no tiene `.git`: verificarlo.
- **No declarar producción lista por pasar pruebas unitarias.** Falta demostrar seguridad, transacciones, concurrencia, integración funcional, secretos/configuración, despliegue y observabilidad.
- **Separar código implementado de código integrado.** Un validador puro no equivale a un servicio de dominio; una migración local no equivale a una base remota; una vista previa de tasas no equivale a una política persistida.
- **No cambiar arbitrariamente el stack.** Inspeccionar el repositorio antes de proponer React/Node/Python/Cloudflare. Google AI Studio puede crear su propia estructura full-stack; se debe evitar que reemplace o duplique la app existente.
- **Precisión monetaria.** Usar `Decimal`, enteros en unidades mínimas o escalas declaradas; no usar `float` para cálculos financieros críticos. Cada redondeo tiene que ser explícito y probado.
- **Fallar de forma segura.** Si falta una tasa, una política, una identidad autorizada o una referencia necesaria, rechazar la operación con error de dominio; no asumir defaults financieros silenciosos.

## 4. Arquitectura conocida (volver a verificar en disco)

### Módulos Python

- `app/core/costing.py`
- `app/core/pricing.py`
- `app/core/storage_units.py`

Pruebas Python conocidas:

- `tests/test_costing.py`
- `tests/test_pricing.py`
- `tests/test_storage_units.py`
- `tests/test_schema.py`

`app/core/pricing.py` reporta cálculos con `Decimal`, margen objetivo, comisión, costo fijo/variable adicional, escenario de impuesto, redondeo, contribución y margen real. `app/core/storage_units.py` maneja micro-unidades/valores escalados, valida enteros y límites `int64`, y evita redondeos implícitos.

### Spike/prototipo Cloudflare

Raíz aproximada: `spikes/cloudflare-d1/`

Componentes conocidos:

- `spikes/cloudflare-d1/src/index.js` — entrada del Worker y endpoints del prototipo.
- `spikes/cloudflare-d1/src/exchange-rates.js` — recolección/validación de tasas.
- `spikes/cloudflare-d1/src/domain/inventory-command.js` — normalizador/validador puro del comando de movimiento de inventario.
- `spikes/cloudflare-d1/src/security/access-jwt.js` — verificador aislado de JWT de Cloudflare Access.
- `spikes/cloudflare-d1/public/index.html` — dashboard prototipo.
- `spikes/cloudflare-d1/tests/` — pruebas Node del Worker, tasas, comandos de inventario y JWT.
- `spikes/cloudflare-d1/README.md` — documentación del spike.

El prototipo y la arquitectura final no deben tratarse como equivalentes. El agente debe leer `package.json`, la configuración de Wrangler, el Worker, las migraciones y los README actuales antes de asumir cómo se ejecuta.

### Decisiones/documentos de referencia

- `AGENT_HANDOFF.md`
- `PLAN_MAESTRO.md`
- `docs/00_INDICE.md`
- `docs/decisiones/D-020_COMANDOS_INVENTARIO_Y_MONEDA_VALORACION.md`
- `docs/decisiones/D-021_VERIFICACION_JWT_CLOUDFLARE_ACCESS.md`

También se conocen otras decisiones previas, incluida D-019 (bloqueo pendiente relacionado con endpoints mutables). El agente debe leer el texto real de estas decisiones antes de interpretarlas.

## 5. Estado técnico reportado en el historial

### Python / dominio económico

- En una ejecución anterior se informó `77/77` pruebas Python aprobadas después de los cambios de inventario SQL (migraciones 0011–0013).
- No se ha confirmado en esta sesión una nueva ejecución de la suite completa. Volver a correr pruebas en la máquina actual antes de afirmar que sigue aprobada.
- Revisar cobertura real: casos límite de monedas, redondeos, rendimientos, unidades, mermas, precio objetivo y margen final.

### JavaScript / Cloudflare D1

Resultados reportados en distintas etapas; la cantidad se incrementó con nuevos módulos:

- Después de D-020: `39/39` pruebas Node aprobadas.
- Después de D-021: `45/45` pruebas Node aprobadas.
- Las pruebas se ejecutaron con claves RSA efímeras para verificar JWT, sin necesidad de crear una aplicación Cloudflare Access real.
- Los chequeos de sintaxis para `src/security/access-jwt.js`, `tests/access-jwt.test.js` y `src/domain/inventory-command.js` aprobaron en aquella ejecución.
- No se ha verificado en esta sesión que el conteo siga siendo exactamente el mismo. Ejecutar la orden de test definida en `package.json` y registrar su salida actual.

### Tasas de cambio

El collector intenta consultar las tasas publicadas en BCV para USD y EUR. En el runtime local `workerd`, la consulta directa de `https://www.bcv.org.ve/` fallaba con un error interno, aunque PowerShell podía leer el HTML. Se añadió fallback a `https://bcv.today/api/v1/rate.json`.

**Importante:** `bcv.today` es un espejo no oficial, no una API oficial del BCV. La implementación reportada registra `source_url`, `underlying_source`, marca de tiempo del espejo, notas del transporte y usa `Cache-Control: no-cache`. La consulta directa se prioriza y el fallback se utiliza solo cuando falla. Si ambas fuentes fallan, no se crean tasas inventadas.

Tasas utilizadas en el endpoint local `GET /api/exchange-rates/latest` en una ejecución anterior (NO son cotizaciones actuales):

- BCV USD/VES: `875.6505`
- BCV EUR/VES: `980.61472543`
- Binance P2P BUY sample mean: `1006.79971429`
- Binance P2P SELL sample mean: `1010.60011111`

No reutilizar esos valores como actuales ni como datos de operación; son solo muestras históricas de test/observación del momento.

Reglas reportadas:

- Antigüedad de BCV: stale si pasa de 36 horas a partir del timestamp de origen/espejo, no a partir de la hora en la que el Worker volvió a descargarlo.
- Antigüedad Binance P2P: umbral de 90 minutos.
- Timestamp ausente/incorrecto o más de 5 minutos en el futuro se considera sospechoso.
- Idempotencia de observaciones compara `rate_decimal`, `source_published_at`, `source_url` y `notes`.
- El timestamp del espejo puede cambiar aunque la tasa sea igual, por lo que puede producir nuevas observaciones.
- La UI tiene selectores independientes para conversión de costos y para precios de venta, conversión de importe a VES y avisos de fuente/fecha/antigüedad. Los selectores del HTML son una **vista previa en memoria**, no una política persistida ni conectada de extremo a extremo con el motor de costo/precio.

### Migraciones D1 reportadas

En `spikes/cloudflare-d1/migrations/`:

- `0001_spike_probe.sql`
- `0002_business_foundation.sql`
- `0003_products_recipes_production.sql`
- `0004_product_pricing_policies.sql`
- `0005_pricing_policy_retirement_guard.sql`
- `0006_exchange_rate_observations.sql`
- `0007_exchange_rate_policy_retirement_guard.sql`
- `0008_no_policy_reactivation.sql`
- `0009_immutable_cost_snapshots_and_losses.sql`
- `0010_immutable_approved_recipes.sql`
- `0011_production_batch_finalization_and_movement_reversals.sql`
- `0012_prevent_negative_stock_balances.sql`
- `0013_stock_balance_currency_correction.sql`

Resumen de intención:

- `0008`: evita reactivar políticas retiradas por medio de un `UPDATE` directo.
- `0009`: protege la inmutabilidad de `inventory_cost_snapshots`, `finished_cost_snapshots` y `batch_losses` ante `UPDATE`/`DELETE`.
- `0010`: versiones de receta aprobadas inmutables, con transición limitada `approved -> retired`, y sus líneas modificables solamente mientras la receta padre está en borrador. La aprobación requiere `approved_by` y `approved_at`.
- `0011`: protege lotes de producción completados/cancelados, limita transiciones de estado, restringe consumos/salidas/mermas mientras se ejecuta el lote y define controles para reversiones.
- `0012`: agrega prevención de saldos negativos.
- `0013`: corrige la comprobación para que el saldo físico se calcule independientemente de la moneda del movimiento y no permita sobreconsumo por mezclar divisas.

Estas migraciones fueron informadas como **aplicadas localmente**, no en una base remota/producción. No se debe ejecutar una migración remota ni `--remote` sin autorización explícita y una revisión de entorno.

## 6. Trabajo reciente D-020: validador de comando de inventario

Archivo: `spikes/cloudflare-d1/src/domain/inventory-command.js`  
Prueba: `spikes/cloudflare-d1/tests/inventory-command.test.js`  
Decisión: `docs/decisiones/D-020_COMANDOS_INVENTARIO_Y_MONEDA_VALORACION.md`

La función `normalizeInventoryMovementCommand(input, context)` es pura (sin IO) y normaliza/valida:

- Identificador del movimiento, ingrediente, ubicación, actor tomado del contexto, clave de idempotencia y motivo.
- Tipo de movimiento permitido y reglas de signo de cantidad.
- Enteros seguros para cantidades y costos.
- Consistencia del costo total con aritmética `BigInt`, escala `1,000,000` y redondeo half-up.
- Código de moneda de tres letras y coincidencia con `context.valuationCurrency` explícita.
- Si moneda original y moneda de valoración difieren, exige `exchangeRateApplicationId`.
- Consistencia de par de referencia y requisito del ID original para una reversión.
- Timestamp válido.

Retorna un objeto congelado. No autentica/autorizza al actor, no consulta existencia real en DB, no valida que exista la aplicación de tasa referenciada, no persiste movimientos, no calcula CPP y no ejecuta transacción. **No está conectado a una ruta mutable del Worker.**

## 7. Trabajo reciente D-021: verificador de JWT Cloudflare Access

Archivo: `spikes/cloudflare-d1/src/security/access-jwt.js`  
Prueba: `spikes/cloudflare-d1/tests/access-jwt.test.js`  
Decisión: `docs/decisiones/D-021_VERIFICACION_JWT_CLOUDFLARE_ACCESS.md`

Función principal reportada: `verifyAccessJwt(token, {teamDomain, audience, fetchImpl=fetch, cryptoImpl=crypto, nowMs=Date.now()})`.

Valida:

- Configuración/domino de confianza normalizado.
- Formato y tamaño del token; tres segmentos JWT.
- `alg=RS256` y `kid` no vacío.
- `iss` exacto `https://${domain}`.
- `aud` en string o array con coincidencia esperada.
- `exp` y `nbf` cuando existen; `sub` no vacío.
- Descarga claves de `https://${domain}/cdn-cgi/access/certs`, escoge una RSA JWK por `kid`, filtra `use` y `alg` según lo esperado y verifica firma WebCrypto `RSASSA-PKCS1-v1_5` + SHA-256.
- Devuelve un conjunto mínimo e inmutable con `sub`, `iss`, audience configurada, `iat`/`exp` si existen y email opcional.
- `accessTokenFromRequest(request)` solo lee el header `CF-Access-Jwt-Assertion`.

Pruebas reportadas incluyen token válido, formato/ausencia, algoritmo inaceptable, issuer/audience erróneos, expiración, `nbf` futuro, subject vacío, firma manipulada, clave inexistente, JWKS no disponible, configuración ausente y extracción de header.

**NO está listo como control de acceso de la aplicación:** no hay dominio/audience configurados; no se creó aplicación Cloudflare Access; no se integró a middleware ni a rutas; no asigna roles; no sustituye RBAC; no tiene caché JWKS de TTL corto/rotación. La documentación señala que antes de producción faltan configuración real confiable, fail-closed middleware, RBAC y pruebas autorizadas reales.

Nunca confíes en un `actorId` enviado en JSON por el cliente. La identidad/actor debe derivarse de un contexto autenticado y autorizado por servidor.

## 8. Riesgo técnico principal pendiente: operaciones transaccionales de inventario y CPP

La siguiente fase de ingeniería propuesta en la sesión fue diseñar/implementar el servicio transaccional de inventario. No debe implementarse de forma superficial.

Requisitos de una operación completa:

1. Autenticar y autorizar actor desde middleware confiable.
2. Validar el comando con `normalizeInventoryMovementCommand`.
3. Validar la clave de idempotencia en el ámbito adecuado y responder a reintentos sin duplicar efectos.
4. Verificar que ingrediente, ubicación, moneda de valoración y aplicación de tasa existan y estén vigentes/permitidos.
5. Aplicar el movimiento en una transacción atómica.
6. Proteger la invariancia de stock no negativo aun bajo concurrencia.
7. Calcular CPP con fórmula y precisión documentadas y consistente con el esquema.
8. Crear instantánea de costo inmutable donde corresponda.
9. Registrar auditoría de actor, motivo, correlación, operación original/reversión y resultado.
10. Si algún paso falla, no dejar movimientos/saldos/snapshots/auditoría parcial, excepto auditoría de fallo si se diseña explícitamente fuera de la transacción y con semántica clara.
11. Crear pruebas de fallo, reintento, duplicación, concurrencia y reversión.

Advertencia crítica de SQLite/D1: leer el saldo/CPP en JavaScript fuera de `D1.batch()` y después ejecutar writes no garantiza una operación atómica ni evita una carrera entre dos writers. `D1.batch()` puede agrupar sentencias en una transacción, pero las decisiones derivadas de una lectura previa pueden quedar obsoletas. Antes de implementar, leer los esquemas completos y decidir cómo se garantiza la concurrencia con constraints, SQL condicional, operaciones SQL dentro de una transacción/batch y verificaciones del `rows_written`/cambios afectados. Si no se puede demostrar una invariancia con el patrón de ejecución elegido, no se debe exponer el endpoint mutable.

El nuevo código debe venir acompañado de una explicación precisa de las garantías de D1 realmente usadas; evitar palabras como “transaccional/atómico” si los reads de los cuales depende el cálculo no forman parte de la misma garantía.

## 9. Plan de trabajo sugerido por fases

### Fase 0 — Reconciliación no destructiva

- Inspeccionar el árbol de archivos real y detectar archivos ignorados/secretos; no leer ni imprimir secretos.
- Revisar `AGENT_HANDOFF.md`, `PLAN_MAESTRO.md`, `docs/00_INDICE.md`, decisiones D-019–D-021 y `spikes/cloudflare-d1/README.md`.
- Revisar `package.json`, lockfiles, config Python, Wrangler, schema SQLite/D1 y todas las migraciones.
- Ejecutar la suite completa definida en los scripts existentes y registrar resultados actuales.
- Confirmar si hay cambios sin guardar, si `.git` existe actualmente, y si el árbol incluye datos locales.
- No ejecutar reset destructivo, limpieza agresiva, reescritura de historia, deploy o migración remota. El propietario solicitó publicar el proyecto, pero eso no autoriza secretos expuestos ni operaciones `--force`. La existencia y el estado de `.git` deben comprobarse en el momento.

### Fase 1 — Base reproducible y repositorio

- Revisar y ajustar `.gitignore` antes de cualquier publicación. El repositorio remoto ya existe; no crear otro repositorio ni sustituirlo por `lactocost-yogurt-quesillo`.
- Excluir `.env*` salvo `.env.example` sin secretos, `.venv/`, `venv/`, `__pycache__/`, `.pytest_cache/`, `node_modules/`, `.wrangler/`, archivos de base de datos locales, artefactos de build, logs y datos privados.
- Añadir guía reproducible de instalación/test local con versiones esperadas y variables de entorno documentadas.
- Si la raíz local no tiene historia Git, un primer commit solo después de revisar `git status`, `git diff --stat`, `git diff --check` y la lista completa de archivos staged. Si existe historia, preservarla y reconciliarla de forma no destructiva.

### Fase 2 — Cerrar identidad y autorización

- Decidir el modelo de acceso según usuarios reales previstos. Cloudflare Access JWT verifier aislado es solo una base.
- Configurar dominio/audience mediante secretos/vars de entorno correctamente documentados en el runtime apropiado.
- Implementar fail-closed middleware: si configuración, token, firma/JWKS/claims fallan, no ejecutar mutaciones.
- Derivar el actor desde una identidad verificada; roles/permisos se obtienen por un mecanismo explícito, no por claims no confiables.
- Implementar RBAC por recurso y acción, auditar accesos sensibles y testear no autorizado/forjado.
- No crear Access app real ni modificar cuentas/recursos sin aprobación.

### Fase 3 — Servicio transaccional de inventario

- Estudiar schema completo; documentar invariantes/formulas antes de programar.
- Diseñar idempotencia y reversiones (nunca borrar el historial para “corregirlo”).
- Implementar movimientos, CPP, snapshot y auditoría con garantías de concurrencia demostrables.
- Cubrir rollbacks, claves repetidas, moneda distinta, tasa desconocida, saldo insuficiente, lotes finalizados, reversión duplicada y requests concurrentes.
- No exponer endpoint si queda inconsistencia en caso de falla.

### Fase 4 — Producción por lote y recetas

- Integrar receta versionada/aprobada, consumos de ingredientes, rendimiento real, producto final, mermas y costo final.
- Asegurar transiciones de estado y trazabilidad de qué versión de receta/tasa/costo se utilizó.
- Validar que las instantáneas históricas siguen siendo inmutables tras cambios de receta, proveedor, tasa o precio.

### Fase 5 — Motor de pricing integrado

- Integrar `app/core/pricing.py` con productos, política de moneda, costo real y gastos del negocio.
- Asegurar margen objetivo vs markup no se confundan.
- Mostrar y testear precio recomendado, margen de contribución y margen efectivo después de comisiones/costos/impuesto escenario.
- Margen editable por producto, guardado de forma persistente con auditoría/versionado cuando impacte operaciones.

### Fase 6 — Tasas de cambio robustas

- Documentar la fuente y la semántica de cada tasa: BCV USD/EUR; Binance P2P BUY/SELL promedio de muestra para USDT/VES.
- Conservar la advertencia de que `bcv.today` es mirror no oficial.
- Definir frescura, sospecha, fallback, idempotencia, rango válido, latencia, caché y observabilidad.
- Los procesos de costo y precio deben seleccionar sus políticas de forma independiente y persistir la política/observación aplicada a cada operación histórica.
- Si una fuente está stale/suspect o no responde, bloquear, pedir confirmación o aplicar una política explícita; jamás fingir una actualización.

### Fase 7 — UI, accesibilidad y calidad

- Reconciliar UI existente antes de rediseñar. El selector de tasas en `public/index.html` era solo una vista previa en memoria.
- Conectar UI a endpoints reales únicamente después de completar autenticación/autorización y contratos.
- Validación visible de entradas, estados de carga/vacío/error, feedback de operaciones, fechas/localización, navegación con teclado y contraste.
- Probar responsividad móvil/tablet/escritorio y los flujos críticos completos.
- Evitar tarjetas repetitivas innecesarias; priorizar un dashboard claro: valor de inventario, costos vigentes, avisos de tasa, lotes en curso, mermas, productos con margen bajo y acciones pendientes.

### Fase 8 — Despliegue y operación

- Preparar checklist de staging y variables/secrets, health checks, logs, backup/export de datos y rollback.
- Verificar costes/limitaciones del proveedor gratuito antes de afirmar que es gratis o sostenible.
- No desplegar sin autorización explícita, pruebas completas, y plan de migración/rollback.

## 10. Política de pruebas y reporte

Cada cambio relevante debe tener:

1. Motivo/bug que resuelve.
2. Ficheros concretos modificados.
3. Pruebas nuevas y casos cubiertos.
4. Comandos ejecutados y salida exacta/resumida, con recuento real.
5. Riesgos residuales y qué no quedó implementado.
6. Estado de Git (sin cambios no revisados, o lista detallada de los cambios).
7. Confirmación explícita si algo fue integrado al runtime o sigue aislado.

No reportar una prueba como aprobada si no se ejecutó en la iteración actual. Separar “último resultado histórico reportado” de “resultado recién confirmado”. Ejecutar también Python si la suite de dominio puede verse afectada o antes de un hito mayor.

## 11. GitHub + Google AI Studio: reglas para evitar corrupción del proyecto

- Repositorio de destino existente: `https://github.com/Burmistrov4/LactoCost`, rama predeterminada reportada `main`. Antes de sincronizar, comprueba el contenido real, el último commit, ramas y diferencias.
- Subir el código actual como base reproducible, no crear una app paralela generada desde cero.
- El repo fue reportado como **público** en una consulta del 2026-10-19; trata el riesgo de exposición como alto. Antes de cada push, inspecciona todos los archivos staged en busca de secretos, bases locales, dumps, claves o transacciones privadas. No cambies la visibilidad del repo automáticamente.
- Primera rama sugerida: `main` para base estable y `work/lactocost-hardening` o ramas `feature/*` para trabajo incremental. Si no se usa flujo de ramas, exigir al menos diffs pequeños.
- Sincronizar un actor a la vez: si AI Studio y el IDE local editan los mismos archivos simultáneamente, aparecerán conflictos.
- En AI Studio, importar desde GitHub. Al inicio, solicitar solo auditoría/plan; no pedir un rediseño completo ni autorizar refactors masivos.
- Después, activar la sincronización bidireccional desde Settings → GitHub según el estado actual de la interfaz. Revisar cada diff/commit antes de seguir.
- Google AI Studio puede aportar código en un runtime Node.js y preferir React, pero no debe sustituir módulos Python ni migraciones de Cloudflare por un mock local.
- Nunca compartir secretos en prompts, logs, screenshots o documentos de handoff.

## 12. Qué falta verificar en el primer inicio de una nueva IA

1. ¿La ruta local existe y el agente tiene acceso?
2. ¿La raíz real coincide con la ruta indicada?
3. ¿Hay `.git` actualmente? Verificar; no inferirlo del historial.
4. ¿Hay cambios nuevos desde este resumen?
5. ¿El repositorio `Burmistrov4/LactoCost` contiene commits, archivos o ramas? La consulta de metadatos del 2026-10-19 mostró `main`, visibilidad pública y tamaño informado `0`, pero hay que inspeccionar el estado real.
6. ¿Las migraciones 0001–0013 siguen en el árbol y en qué estado están aplicadas?
7. ¿Qué versiones exactas de Python, Node, Wrangler, SQLite/D1 y dependencias se utilizan?
8. ¿Cuál es el comando de test de `package.json` y la orden de test Python?
9. ¿Qué endpoints existen y cuáles son solo prototipo/TODO?
10. ¿Hay una aplicación utilizable fuera del HTML de prueba o el código de negocio sigue siendo módulos aislados?
11. ¿El cálculo CPP puede garantizar concurrencia bajo la arquitectura actual de D1?
12. ¿Autenticación/RBAC están integrados? El historial dice que no, pero debe comprobarse.
13. ¿El selector de política de tasa guarda datos o solo mantiene estado en memoria? El historial dice que era memoria temporal.
14. ¿Cuál es el estado actual de las tasas, pruebas y documentos después de los últimos cambios?
15. ¿Existe `.env.example` y un `.gitignore` adecuados?
16. ¿Se inspeccionaron todos los archivos staged y se revisaron secretos antes del push?
17. ¿Los documentos de este directorio `docs/continuidad/` están incluidos en el repositorio y sus enlaces siguen funcionando?

## 13. Definición de terminado (DoD)

No llamar “terminado” al proyecto hasta cumplir, como mínimo:

- El proyecto se instala en una máquina limpia siguiendo instrucciones escritas.
- Suite de pruebas relevante completa y reproducible.
- Migraciones versionadas revisadas y aplicables en una base de prueba; estado consistente en una base vacía.
- Operaciones mutables protegidas por autenticación y autorización reales, con fail-closed.
- Idempotencia, CPP, stock no negativo, reversiones y snapshots correctos bajo errores/reintentos/concurrencia.
- El costo de lote, la receta usada, pérdidas y moneda/tasa aplicadas son trazables.
- Pricing calculado con precisión correcta y márgenes claros.
- Tasas de cambio etiquetadas por origen/fecha/antigüedad; no se aceptan tasas inventadas.
- La UI consume servicios reales y no presenta datos de demostración como reales.
- Flujos críticos probados de extremo a extremo.
- Accesibilidad y responsividad probadas.
- Configuración de staging/producción y rollback documentados; despliegue aprobado por el usuario.
- Repo limpio, sin secretos ni bases con datos privados; documentación/handoff actualizados.

## 14. Mensaje de arranque para una nueva IA

Empieza leyendo este contexto y luego inspecciona los archivos reales. No escribas código todavía. Tu primer entregable debe ser una auditoría de reconciliación que clasifique cada afirmación como: confirmada en código, confirmada por pruebas recién ejecutadas, documentada pero no verificada, o pendiente/desconocida. Después propone el siguiente lote de trabajo más seguro, con riesgos, archivos afectados, tests y criterio de aceptación. Cuando empieces a modificar, haz cambios pequeños y comprobables. Protege la consistencia contable y la integridad de datos por encima de la velocidad de añadir funcionalidades.
