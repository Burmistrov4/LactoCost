# Spike local — Cloudflare Workers + D1

**Estado:** prototipo técnico local; no desplegado y no apto para producción.

## Objetivo

Comprobar si la plataforma puede tener API alojada en Workers y persistencia SQL en D1 dentro de las cuotas gratuitas. Este spike incluye una maqueta responsive del dashboard para validar diseño y navegación, pero no incluye autenticación, datos de negocio, formularios persistentes ni escrituras de inventario.

## Requisitos

- Node.js LTS o compatible con la versión instalada de Wrangler.
- npm.
- Una cuenta de Cloudflare solo será necesaria para crear un D1 remoto y desplegar; todavía no se necesita para ejecutar las pruebas locales.

## Pruebas locales

Desde esta carpeta:

```powershell
npm test
```

El test usa Node.js y mocks; no necesita credenciales ni red. No comprueba un D1 real.

## Ejecución local con Wrangler

1. Instalar dependencias con `npm install`.
2. Ejecutar `npx wrangler dev`.
3. La configuración incluye un `database_id` de marcador; para enlazar un D1 remoto habrá que crear la base y sustituirlo. No crear recursos remotos ni desplegar sin autorización.
4. Probar `GET /health` y `GET /health/db` en el servidor local. Sin binding real, el segundo debe devolver 503 de forma segura.

## Alcance y restricciones

- El Worker expone el dashboard estático y endpoints GET de salud; no hay CRUD ni mutaciones de datos.
- Las migraciones crean una tabla de prueba y el esquema fundacional de catálogo, proveedores/cotizaciones, inventario, CPP, auditoría, productos, recetas, producción y políticas versionadas de precio/tasa. La migración 0008 impide reactivar políticas retiradas; no siembra datos de negocio.
- No hay autenticación/autorización, sesiones, gestión de usuarios, backup automático ni monitoreo.
- No introducir precios reales, inventario, recetas, proveedores ni datos personales.
- No existe comando de despliegue intencional en package.json.
- La configuración no representa aún una decisión definitiva de arquitectura.
- Las fórmulas Python de `app/core/costing.py` siguen siendo la referencia y necesitan pruebas de paridad si se portan a TypeScript/JavaScript.

## Validación local realizada

- Wrangler 4.149.0 instalado mediante npm; npm audit reportó 0 vulnerabilidades en 38 paquetes.
- Última validación completa de código: `npm test` 11/11 PASS; Python 46/46 PASS y `python -m compileall -q app tests` PASS. Incluye calculadora demo de margen y motor de precios Decimal, pero aún no hay API de precios ni CRUD.
- Migración `0002_business_foundation.sql` aplicada en D1 local; consulta a `sqlite_master` confirmó `audit_events`, `ingredients`, `inventory_movements` y `suppliers`.
- Migración `0003_products_recipes_production.sql` aplicada en D1 local; consulta confirmó `finished_products`, `recipe_versions`, `production_batches` y `finished_inventory_movements`.
- Migraciones `0004_product_pricing_policies.sql` y `0005_pricing_policy_retirement_guard.sql` aplicadas en D1 local; consulta confirmó tablas de políticas/snapshots y triggers de retiro/inmutabilidad.
- Estados históricos previos: Python 23/23 antes de 0004 y 38/38 tras el motor de precios. Estado actual tras añadir almacenamiento seguro: Python 46/46 PASS, incluyendo costos, precios, micro-unidades/overflow y esquema.
- `python -m compileall -q app tests`: PASS.
- Dashboard visual v0.3 en `public/index.html`, con valores explícitamente ficticios, navegación por módulos, gráfico SVG, alertas, exportación CSV demo y calculadora temporal de margen editable por producto. No conecta a las políticas D1.
- Wrangler local: `/` devolvió HTTP 200 y el contenido incluyó Cuajada Studio, Resumen ejecutivo y la advertencia de demostración; `/health` y `/health/db` devolvieron HTTP 200.
- `wrangler dev --local --port 8790`: `/health` y `/health/db` respondieron `status=ok`.
- `wrangler d1 migrations apply yogurt-d1-spike --local`: migración `0001_spike_probe.sql` aplicada correctamente.
- Consulta local a `sqlite_master`: confirmó que existe `spike_probe`.
- El servidor local de prueba se detuvo tras las verificaciones.

## Criterio de salida

La prueba local básica pasa. Con autorización para crear recursos remotos, se podrá evaluar un D1 de prueba sin datos sensibles, transacciones, límites y exportación/restauración. El servicio solo avanzará a la aplicación real cuando seguridad, paridad matemática y recuperación estén verificadas.

## Tasas de cambio (D-018)

Se añadieron `src/exchange-rates.js`, migraciones `0006_exchange_rates.sql` y `0007_exchange_rate_policy_retirement_guard.sql`, y cron de 30 minutos para consultar BCV USD/EUR y una muestra de anuncios Binance P2P USDT/VES BUY/SELL. La ruta `GET /api/exchange-rates/latest` lee las últimas observaciones persistidas. Para ejecutar pruebas: `npm test`.

La configuración de cron solo opera en un Worker desplegado con D1 real enlazado. No ejecutar `wrangler deploy` ni crear recursos remotos sin autorización. El endpoint P2P puede cambiar y no se trata como API oficial estable; revisar `docs/decisiones/D-018_TASAS_CAMBIO_Y_FUENTES.md`. La UI todavía no consume estas tasas y no se deben usar para transacciones reales.


## Captura de tasas BCV y Binance P2P

El Worker intenta primero la página oficial `https://www.bcv.org.ve/` para USD/EUR. En el runtime local de Wrangler ese fetch falla con un error interno; por eso existe fallback a `https://bcv.today/api/v1/rate.json`. **BCV Today es un espejo no oficial**, aunque declara publicar datos extraídos del BCV; no confundir el dominio espejo con la web del Banco Central. Las observaciones guardan URL y notas de procedencia, y el endpoint usa `mirror_updated_at` para detectar datos viejos. Si falla el fetch directo y también el espejo, la tarea registra fallo parcial y no inventa tasas.

Binance P2P se consulta por separado para `BUY` y `SELL`, registra la media de una muestra de anuncios y sus límites. No es una tasa oficial ni un precio garantizado de ejecución. La tarea local se probó manualmente y guardó observaciones en D1 local; la ejecución programada en un Worker desplegado sigue pendiente. No usar `--remote` ni desplegar hasta configurar recursos y autorización explícitos.


## Integridad histórica — migración 0009

`0009_immutable_cost_snapshots_and_losses.sql` protege con triggers los snapshots de costo ponderado de ingredientes/productos y los registros de merma por lote. No se permite reescribir o eliminar evidencia histórica: los recálculos producen snapshots nuevos y las correcciones deben conservar la merma original. Los tests de esquema se ejecutan con `python -m unittest discover -s tests -q` desde la raíz del proyecto. La migración se debe aplicar solo localmente durante esta fase; no ejecutar sobre D1 remoto sin autorización explícita.


## Recetas aprobadas — migración 0010

La migración `0010_immutable_approved_recipes.sql` exige identidad/fecha de aprobación y congela las versiones aprobadas junto con sus líneas de ingredientes. Una receta aprobada solo puede pasar a retirada sin modificar campos históricos; las líneas se editan únicamente mientras la versión está en borrador. Cualquier cambio de formulación exige una versión nueva. La migración se aplicó y verificó en D1 local; no en remoto.


## Lotes de producción y reversos — migración 0011

La migración `0011_production_batch_finalization_and_movement_reversals.sql` añade una máquina de estados para lotes, hace terminales e inmutables los lotes completados/cancelados, bloquea borrado de lotes y solo permite insertar consumos, salidas y mermas durante `in_progress`. Para movimientos de inventario de insumos y productos terminados, valida que un reverso sea una nueva fila exactamente opuesta al movimiento original, con correspondencia de entidad/lote/ubicación/moneda/costos y máximo un reverso por movimiento. Se aplicó y probó solo en D1 local. La suite de esquema incluye pruebas positivas y negativas; ejecutar `python -m unittest discover -s tests -v` desde la raíz. Esto no implementa comprobación de saldo no negativo, servicios transaccionales, auditoría atómica ni autenticación; no habilitar endpoints de escritura.


## Existencias no negativas — migración 0012

La migración `0012_prevent_negative_inventory_balances.sql` rechaza movimientos que harían negativo el saldo de un insumo por ubicación/moneda, el saldo de un lote específico o el saldo de producto terminado por presentación/ubicación/moneda. Incluye índices para las consultas de balance y pruebas positivas/negativas en `tests/test_schema.py`. Se aplica solo localmente durante esta fase. La validación del trigger no reemplaza el servicio transaccional que debe actualizar movimiento, CPP/snapshot y auditoría atómicamente. Sin endpoints mutables, autenticación ni despliegue.


## Corrección de balance físico — migración 0013

La migración `0013_stock_balance_is_currency_independent.sql` corrige un defecto conceptual detectado al revisar 0012: el saldo de cantidad no se debe particionar por moneda de valoración. Ahora los triggers agregan el stock por insumo/ubicación y por lote cuando aplica, y por producto/presentación/ubicación, independientemente de si los costos históricos están expresados en USD o VES. Ajusta índices sin alterar el ledger histórico. Aplicada y verificada solo en D1 local. Pruebas integrales actuales: Python 77/77 y Node 29/29 PASS; no hay despliegue.


## Validación previa de comandos de inventario

El módulo `src/domain/inventory-command.js` es una validación pura, sin persistencia ni autorización. Rechaza movimientos mal formados, signos incompatibles, valores no enteros/seguros, total de costo incoherente y moneda distinta de la moneda de valoración. Si la moneda fuente difiere, exige referencia a una aplicación de tasa registrada. No debe exponerse mediante una ruta mutable hasta verificar esa referencia en servidor, implementar identidad/RBAC y garantizar movimiento + CPP/snapshot + auditoría dentro de una operación D1 atómica. Pruebas locales actuales: Python 77/77 y Node 39/39 PASS; checks sintácticos PASS. Véase `docs/decisiones/D-020_COMANDOS_INVENTARIO_Y_MONEDA_VALORACION.md`.


## Verificador aislado de Cloudflare Access

`src/security/access-jwt.js` valida una aserción JWT RS256 contra las claves JWKS de Cloudflare Access, incluyendo firma, issuer, audience, expiración, `nbf` y sujeto estable. Las pruebas generan claves RSA efímeras; no usan tokens reales. Node 45/45 PASS. Este módulo no se integra todavía en el Worker, no asigna roles y no autentica ninguna ruta. Falta configurar Access, variables de entorno confiables, caché JWKS con rotación segura, middleware fail-closed, RBAC y auditoría atómica. Véase `docs/decisiones/D-021_VERIFICACION_JWT_CLOUDFLARE_ACCESS.md`.
