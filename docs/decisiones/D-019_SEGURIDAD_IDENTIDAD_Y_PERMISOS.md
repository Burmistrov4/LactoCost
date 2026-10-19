# D-019 — Identidad, autenticación, autorización y seguridad de API

**Fecha:** 2026-10-09  
**Estado:** contrato de diseño; implementación pendiente.  
**Ámbito:** aplicación interna sobre Cloudflare Workers + D1 (candidata, aún no desplegada).

## Objetivo y regla de bloqueo

Ningún endpoint que cree, modifique, apruebe, retire o aplique políticas financieras puede exponerse hasta validar identidad y permisos en el servidor. Ocultar controles en la interfaz no es autorización. La aplicación sigue siendo un spike local y no está lista para datos reales.

## Enfoque provisional recomendado

Evaluar primero Cloudflare Access como puerta de identidad para una herramienta interna y validar en el Worker el JWT firmado de Access (`CF-Access-Jwt-Assertion`) con issuer, audience, expiración y firma verificados. No confiar en cabeceras de correo o identidad que el cliente pueda enviar sin validar. La selección final depende de que el usuario disponga/configure dominio o hostname de Access y acepte ese flujo; no se creó ni configuró recurso remoto.

Si Access no encaja, comparar una solución de identidad administrada con sesiones seguras frente a autenticación propia. No crear contraseñas, sesiones, reset de contraseña ni criptografía casera antes de una decisión explícita de arquitectura. No almacenar secretos en el frontend ni en archivos versionados.

## Contrato mínimo de autorización

- **Denegar por defecto:** rutas mutables no existen o devuelven 404/405 hasta implementar middleware de autenticación y permisos.
- **Identidad verificada:** actor estable, proveedor/issuer, identificador del sujeto y marca temporal; no usar el correo como único identificador si el proveedor ofrece un `sub` estable.
- **Roles iniciales propuestos:** `owner`, `operator`, `approver`, `viewer`. Los roles se resuelven en servidor; nunca se aceptan como autoridad desde el cuerpo JSON o el estado de UI.
- **Separación de capacidades:** `viewer` lectura; `operator` borradores y operaciones ordinarias; `approver` activación/retiro de políticas financieras; `owner` administración. Afinar permisos por acción antes de CRUD.
- **Aprobación:** conservar actor creador y aprobador, fecha, motivo y versión. Para acciones sensibles, impedir que un actor se apruebe a sí mismo cuando la política de segregación lo exija; definir explícitamente el modo de propietario único antes de operar.
- **Auditoría append-only:** registrar actor, acción, entidad, identificador, resultado, hora, request/correlation ID e idempotency key sin contraseñas, tokens ni datos secretos. Un fallo de auditoría bloquea la mutación.
- **Sesión y navegador:** no poner tokens en `localStorage`; si se introducen cookies de sesión, exigir `Secure`, `HttpOnly`, `SameSite` apropiado y protección CSRF en mutaciones.
- **API:** validar esquema/tipo/rango y tamaño de entrada; límites de frecuencia donde corresponda; errores genéricos sin stack ni SQL; `Cache-Control: no-store` en respuestas JSON sensibles; HTTPS en cualquier entorno remoto.
- **D1:** usar consultas parametrizadas; transacciones/batches idempotentes; claves de idempotencia únicas; mantener movimientos, aplicaciones de tasas, snapshots y auditoría inmutables.
- **Secretos y despliegue:** variables/secretos del proveedor, nunca commit; no usar credenciales reales en tests; recursos remotos solo con autorización explícita.

## Matriz inicial de permisos (propuesta, no implementada)

| Acción | viewer | operator | approver | owner |
|---|---:|---:|---:|---:|
| Leer dashboard y observaciones de tasas | Sí | Sí | Sí | Sí |
| Crear borrador de política de tasa/precio | No | Sí | Sí | Sí |
| Activar o retirar política financiera | No | No | Sí | Sí |
| Registrar recepción/producción/merma/venta | No | Sí | Según flujo | Sí |
| Administrar identidades y roles | No | No | No | Sí |
| Exportar datos operativos | No | Según autorización | Sí | Sí |

La matriz debe revisarse antes de convertirla en código. No hay usuarios reales ni roles sembrados.

## Controles implementados hasta ahora

- Las migraciones `0002`–`0007` protegen mediante restricciones/triggers parte de los movimientos, eventos de auditoría, snapshots, observaciones y políticas versionadas.
- Las rutas mutables de negocio aún no existen; por tanto no se afirma que la autenticación o autorización estén implementadas.
- Se endurecieron las respuestas JSON del Worker con `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` y `Referrer-Policy: no-referrer`; estas cabeceras no sustituyen autenticación, autorización ni CSP para el HTML.

## Criterios de aceptación antes de endpoints mutables

1. Elegir y documentar proveedor de identidad y mecanismo de desarrollo local.
2. Verificar firma/issuer/audience/expiración en el servidor; pruebas para token ausente, inválido, expirado, audiencia incorrecta y claims faltantes.
3. Matriz de permisos probada por endpoint, con denegación por defecto.
4. Auditoría obligatoria y pruebas de que un fallo de auditoría revierte/bloquea la mutación.
5. Aprobación/versionado e idempotencia cubiertos por pruebas.
6. Tests de seguridad sin credenciales reales; secretos fuera del repositorio.
7. Revisión de recuperación/exportación antes de almacenar operaciones comerciales.

## No realizado

No se configuró Cloudflare Access, no se creó cuenta o recurso remoto, no se añadió endpoint de escritura, no se desplegó y no se introdujeron datos reales. Esta decisión es un contrato para continuar localmente y no una certificación de seguridad.