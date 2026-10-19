# D-021 — Verificación de JWT de Cloudflare Access

**Fecha:** 2026-10-09  
**Estado:** verificador aislado implementado y probado; integración de autenticación pendiente.  
**Ámbito:** spike local Workers + D1.

## Implementación

`src/security/access-jwt.js` verifica tokens RS256 usando WebCrypto y las claves públicas obtenidas del endpoint JWKS de Cloudflare Access. Valida formato/tamaño, algoritmo y `kid`, firma, issuer exacto, audience esperado, expiración, `nbf` si existe y `sub` estable. Solo extrae el token de `CF-Access-Jwt-Assertion`. Falla cerrado si falta configuración, falla la red o no se encuentra la clave.

La salida contiene el sujeto estable y claims mínimos. No convierte email en ID primario ni resuelve roles. No se configura un dominio, audience, aplicación Access ni recurso remoto en esta tarea.

## Pruebas

Las pruebas generan claves RSA efímeras para validar firma real y cubren issuer/audience incorrectos, token vencido, `nbf` futuro, sujeto vacío, firma alterada, algoritmo incorrecto, clave inexistente, JWKS inaccesible y configuración ausente. No se usan credenciales reales.

## Límites y condiciones para integración

- El módulo no está conectado a `fetch()` ni protege rutas actualmente.
- No autoriza roles ni verifica permisos de negocio.
- No hay caché JWKS propia; antes de producción debe implementarse caché con TTL corto y rotación segura de claves.
- La configuración del dominio y audience debe venir de secretos/variables del entorno, nunca del request.
- La arquitectura requiere configurar Cloudflare Access y probar un token real en un entorno autorizado. Eso no se hizo ni se debe simular como éxito.
- No exponer endpoints mutables hasta añadir middleware fail-closed, RBAC por acción, auditoría atómica y pruebas de integración.

