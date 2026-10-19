# D-018 — Tasas de cambio verificables y políticas independientes

**Fecha:** 2026-10-09  
**Estado:** implementado en spike local; no desplegado.  
**Alcance:** observaciones BCV USD/EUR, muestra de anuncios Binance P2P USDT/VES, persistencia inmutable y configuración separada para costos/precios.

## Decisión

La app no tratará la tasa de cambio como una variable global mutable. Conserva observaciones con fuente, par de monedas, valor decimal, dirección P2P, método de agregación, cantidad de anuncios, fecha de publicación (si existe), hora de consulta y estado de frescura. Las aplicaciones de una tasa a un costo/precio se registran por separado y son inmutables.

Se permiten políticas distintas para:
- **Conversión de costos:** por ejemplo, tomar un precio cotizado en EUR y expresarlo en VES usando una observación BCV EUR/VES, o convertir USDT/VES desde la muestra P2P.
- **Precio de venta:** seleccionar independientemente BCV USD/VES, BCV EUR/VES, Binance P2P USDT/VES en dirección de compra/venta, o una tasa manual documentada.
- **Ámbito:** configuración global o futura excepción por producto, mediante `scope_key`. Una sola política activa por propósito y ámbito; toda activación exige aprobador y fecha.

## BCV

Fuente: https://www.bcv.org.ve/

El adaptador lee el HTML publicado y extrae los bloques `#dolar strong` y `#euro strong`. Normaliza la coma decimal y falla de forma cerrada si falta cualquiera de las cifras. Guarda la fecha visible de publicación separada del instante de consulta. El valor publicado es referencia oficial; no debe interpretarse como precio de ejecución de una operación privada.

## Binance P2P

Endpoint observado: https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list

El adaptador consulta VES/USDT por separado con `tradeType=BUY` y `tradeType=SELL`. Filtra anuncios por importe disponible, tasa de finalización y cantidad de órdenes cuando esos campos están disponibles, toma una muestra limitada y calcula media aritmética. Registra cantidad, mínimo y máximo de la muestra. En la interfaz se explicará:
- **Comprar USDT:** precio al que el usuario compra USDT a un anunciante.
- **Vender USDT:** precio al que el usuario vende USDT a un anunciante.

La ruta P2P usada no es una API pública de trading Spot estable documentada en la referencia Spot; puede cambiar o bloquearse. Debe monitorizarse y puede requerir adaptar el parser. La media de anuncios no es una tasa oficial, una garantía de liquidez ni una cotización vinculante. Las condiciones de pago y límites por anunciante afectan el precio ejecutable.

## Persistencia y frescura

Migración `0006_exchange_rates.sql`:
- `exchange_rate_observations`: observaciones append-only.
- `exchange_rate_policies`: configuración versionada para `cost_conversion` y `sale_pricing`.
- `exchange_rate_applications`: tasa aplicada e importes antes/después, moneda, redondeo, actor e idempotencia.

Las observaciones y aplicaciones no se actualizan ni borran. La tasa oficial BCV no se duplica si el valor y la fecha de publicación siguen iguales. El Worker tiene un cron cada 30 minutos y una ruta de lectura `GET /api/exchange-rates/latest`; el cron solo se ejecutará en un Worker desplegado con D1 enlazado. El prototipo local no tiene despliegue, y no se sembraron tasas en la base local.

## Validación observada el 2026-10-09

En una consulta puntual, el parser extrajo de la página BCV publicada para viernes 9 de octubre de 2026:
- USD/VES: **875,6505 VES por USD**.
- EUR/VES: **980,61472543 VES por EUR**.

En dos consultas puntuales a Binance P2P:
- Dirección BUY: media de **1018,71128571 VES/USDT**, 7 anuncios elegibles, rango 1018–1019.
- Dirección SELL: media de **1014,091625 VES/USDT**, 8 anuncios elegibles, rango 1013,501–1015.

Son lecturas puntuales para probar los adaptadores, no cifras permanentes ni recomendación de tipo de cambio. Deben consultarse de nuevo al usarse. No se insertaron estas tasas como datos de negocio.

## Límites y próximos pasos

- El adaptador BCV pasó una prueba de lectura real en el equipo; el endpoint P2P pasó pruebas reales de consulta y forma de respuesta.
- La ejecución real del cron dentro de Cloudflare Workers aún no está probada y no hay despliegue.
- La vista Configuración ya tiene selectores de previsualización independientes, pero no persiste políticas ni integra la conversión al motor de costos/precios; tampoco hay flujo de aprobación/autenticación. No activar políticas ni aplicar tasas a compras reales.
- Definir alertas de antigüedad, rango anómalo y fuente caída; nunca presentar una tasa vieja como actual.
- Antes de producción, revisar términos y estabilidad del endpoint P2P, la dirección exacta de cada operación, métodos de pago, mínimos y muestreo.

## Resultado adicional de integración local

El evento programado se invocó manualmente en Wrangler local. El endpoint de lectura confirmó que se persistieron observaciones Binance P2P BUY y SELL en D1 local. En esa ejecución, la consulta BCV desde el runtime local de Workers falló con un error interno de fetch; en cambio, la consulta directa desde PowerShell de Windows sí recibió HTTP 200 y el parser extrajo ambas tasas. Esto significa que **el parser está validado contra el HTML real, pero el fetch BCV desde el runtime Worker no está cerrado**. No se deshabilitó la validación TLS ni se usó un proxy no verificado para ocultar el problema.

Siguiente criterio técnico: el fetch directo de `https://www.bcv.org.ve/` falla dentro de workerd local con error interno; por ello se implementó un fallback a `https://bcv.today/api/v1/rate.json`, un espejo JSON no oficial que declara usar los datos publicados por BCV. En la prueba local, el fallback extrajo USD/EUR y el evento programado guardó ambos junto a Binance BUY/SELL. Las observaciones del espejo conservan `source_url` y `notes.transport=unofficial_bcv_mirror_fallback`; el endpoint calcula frescura usando `mirror_updated_at`, no solo la hora local de lectura. La interfaz lo etiqueta como espejo no oficial. Esto valida el flujo local, pero no demuestra la ejecución programada en Cloudflare desplegado ni sustituye la supervisión del espejo. No se desactivó TLS ni se usó un proxy sin verificar. Binance P2P también completó consulta y persistencia local.


## Endurecimiento adicional — política retirada terminal (2026-10-09)

La migración `0008_no_policy_reactivation.sql` también impide reactivar una política de tasa retirada. Para cambiar fuente, par, dirección, frescura o finalidad debe crearse otra versión y aprobarse; no se recicla el registro retirado. Prueba: `test_retired_exchange_rate_policy_cannot_be_reactivated` en `tests/test_schema.py`. La migración se aplicó solo a D1 local. Ver también D-019 para la puerta de autenticación/autorización pendiente.
