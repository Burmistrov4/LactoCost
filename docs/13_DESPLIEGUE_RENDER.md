# Arquitectura de despliegue — Render

**Decisión:** el backend de la aplicación se desplegará en Render. La publicación queda pendiente de autorización y de definir costos, acceso y base de datos.

## Arquitectura objetivo

- Aplicación web responsive: Flask + Jinja2 + HTML/CSS/JavaScript Vanilla, salvo que la especificación de producto justifique un cambio.
- Backend: Render Web Service ejecutando Flask mediante servidor WSGI de producción (por ejemplo Gunicorn), enlazado a `0.0.0.0` y al puerto `PORT` que Render proporcione.
- Persistencia recomendada para uso en línea: Render Postgres. No guardar la base de datos de producción en un SQLite dentro del filesystem efímero del servicio.
- Secretos y configuración mediante variables de entorno; nunca subir credenciales a Git.
- Repositorio Git como fuente de despliegue; migraciones de esquema versionadas.
- Salud del servicio, logs, pruebas de humo, backups/exportación y procedimiento de restauración documentados.

## Advertencia de persistencia

Render documenta que el filesystem de los servicios es efímero por defecto y que los cambios locales pueden perderse al reiniciar o desplegar. Los servicios gratuitos también pierden archivos locales cuando se suspenden por inactividad. Por ello, SQLite local puede seguir sirviendo para desarrollo/pruebas, pero la versión en línea debe usar una base de datos persistente como Render Postgres o una alternativa explícitamente aprobada.

Fuentes oficiales:
- https://render.com/docs/disks
- https://render.com/docs/faq
- https://render.com/docs/web-services
- https://render.com/docs/postgresql
- https://render.com/docs/free

## Entornos

1. **Desarrollo local:** SQLite permitido para prototipos y pruebas, con datos ficticios o exportables.
2. **Pruebas/staging:** variables y base de datos separadas de producción; nunca usar datos sensibles reales en pruebas.
3. **Producción:** Render Web Service + Render Postgres, HTTPS, secretos fuera del repositorio, política de backups y acceso restringido.

## Riesgos de Render que deben evaluarse

- Suspensión y arranque en frío de instancias gratuitas.
- Caducidad y límites de bases de datos gratuitas, precio de planes y requisitos de backup vigentes antes de elegir plan.
- Exposición de un panel financiero: autenticación, contraseñas robustas, limitación de intentos, CSRF, autorización, cookies seguras, validación de entradas y actualización de dependencias.
- Latencia y disponibilidad para usuarios en Venezuela.
- No incluir credenciales de proveedores, datos financieros privados ni recetas propietarias en logs.
- No desplegar hasta probar migraciones, backup/restauración, seguridad y pérdida de conexión.

## Decisiones pendientes

- ¿Uso personal o multiusuario?
- ¿La app será privada con inicio de sesión o públicamente accesible?
- ¿Se necesita exportar/importar CSV/Excel y backup cifrado?
- ¿Qué plan de Render y qué presupuesto recurrente son aceptables?
- ¿Dónde se alojará la futura landing pública? Será una fase separada y posterior.

## Criterios de aceptación del despliegue

- Despliegue reproducible desde repositorio.
- Base persistente confirmada después de reinicio y nuevo deploy.
- Migraciones probadas sobre base vacía y base con datos de prueba.
- Endpoint de salud sin revelar secretos.
- Restauración de backup demostrada en entorno de prueba.
- Variables de entorno documentadas sin valores secretos.
- Errores visibles en logs sin filtrar contraseñas ni datos privados.
- Responsive verificado en móvil, tablet y escritorio.


## Advertencia de producción — límite del plan gratuito (verificado 09-10-2026)
La documentación oficial indica que Render Postgres gratuito vence 30 días después de su creación, limita almacenamiento a 1 GB y no ofrece backups ni recuperación administrada. Por tanto, no debe ser la base definitiva de una aplicación con inventario y costos reales. Puede utilizarse para pruebas desechables con exportación y migración planificada. Antes de producción se debe presupuestar Postgres de pago u otra base persistente aprobada y probar backups/restauración. Los Web Services gratuitos se suspenden tras 15 minutos sin tráfico y pierden cambios del filesystem local en reinicios, despliegues o suspensión.
Fuente oficial: https://render.com/docs/free ; https://render.com/docs/postgresql-backups.
