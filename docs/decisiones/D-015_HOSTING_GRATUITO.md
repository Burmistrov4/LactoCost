# Decisión técnica D-015 — prioridad de hosting gratuito 24/7

**Fecha:** 2026-10-09  
**Estado:** provisional; requiere spike técnico.  
**Prioridad del usuario:** hosting en línea con costo recurrente de US$0 y disponibilidad continua, dentro de las limitaciones reales del proveedor.

## Decisión

Antes de construir la aplicación integrada, validar Cloudflare Workers + D1 como candidata prioritaria. El backend Flask del prototipo no se puede desplegar directamente en Workers; requerirá una API en JavaScript/TypeScript y una capa de persistencia D1. El motor Python actual se conserva como referencia independiente hasta que existan pruebas equivalentes para cada fórmula.

## Justificación

- El plan gratuito de Workers publica hasta 100.000 solicitudes por día y un límite de CPU por solicitud.
- D1 en Workers Free publica cuotas diarias de lecturas/escrituras y 5 GB de almacenamiento total.
- La aplicación aún no tiene UI ni persistencia integrada, así que evaluar el cambio ahora es menos costoso que migrar un sistema ya construido.
- Render gratuito no satisface por sí solo el objetivo de disponibilidad continua y su base de datos gratuita no es adecuada para datos operativos persistentes.

## Condiciones de aceptación

1. CRUD mínimo con D1 y migraciones versionadas.
2. Pruebas de transacciones, duplicación de operaciones y restricciones.
3. Port de fórmulas con pruebas de paridad contra app/core/costing.py.
4. Autenticación y autorización reales antes de exponer información financiera.
5. Exportación de datos y restauración ensayada en una base limpia.
6. Prueba de cuotas excedidas y errores sin pérdida ni duplicación de movimientos.
7. Confirmación de términos/límites vigentes al desplegar.
8. No usar como sistema único de registro hasta demostrar backups y restauración.

## Límites

US$0/mes no equivale a SLA, recursos ilimitados ni garantía de permanencia del plan gratuito. Puede haber caídas, límites, cambios de términos o bloqueos de cuota. La alternativa Oracle Always Free o una PC propia puede estudiarse si la candidata no pasa las pruebas, pero también tiene costos operativos y riesgos.

## Fuentes oficiales

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/reference/faq/
- https://render.com/docs/free

No se ha creado cuenta, desplegado servicio, modificado DNS, comprado dominio ni transferido datos reales.
