# Presupuesto de despliegue y decisión de persistencia — Render

**Fecha de revisión:** 2026-10-09  
**Estado:** arquitectura decidida; presupuesto recurrente debe aprobarse antes del despliegue real.

## 1. Decisión de arquitectura

- Backend Flask en Render Web Service.
- PostgreSQL persistente para datos reales, con credenciales por variables de entorno.
- SQLite solo para desarrollo local, pruebas automatizadas o demostración desechable.
- Secretos fuera del repositorio; migraciones de esquema versionadas; backups y prueba de restauración antes de guardar inventario real.
- La app puede desarrollarse y probarse localmente antes de pagar alojamiento. No publicar información financiera sensible en un servicio público sin autenticación y autorización.

## 2. Referencias de precio de Render consultadas

La página oficial de precios indica para Web Services:
- plan gratuito: US$0/mes, 512 MB RAM, con limitaciones;
- plan de pago de 0,5 CPU / 512 MB RAM: US$7/mes;
- plan de 1 CPU / 2 GB RAM: US$25/mes.

Fuente oficial: https://render.com/pricing

Render documenta que el plan gratuito de PostgreSQL tiene 1 GB, no ofrece backups administrados y vence a los 30 días; después del período de gracia, la base y sus datos se eliminan. No usarlo como almacenamiento de producción para inventario, costos, compras o lotes reales.

Fuente oficial: https://render.com/docs/free

## 3. Presupuesto mínimo que debe calcularse antes de producción

No se presenta un total mensual definitivo porque falta seleccionar y confirmar el plan de base de datos, almacenamiento, impuestos aplicables y requisitos de disponibilidad. El presupuesto deberá incluir:
1. Web Service de pago si se requiere disponibilidad sin suspensión por inactividad.
2. PostgreSQL de pago con persistencia y estrategia de backup.
3. Almacenamiento adicional si el tamaño de la base lo requiere.
4. Dominio propio solo si se decide adquirirlo; no es requisito para iniciar desarrollo.
5. Monitorización y correo transaccional solo cuando la función sea necesaria.
6. Impuestos/cargos de pago y variación cambiaria, si aplican al medio de pago del usuario.

La tabla de precios de Render puede cambiar. Verificar precio en la página oficial el día de la contratación y guardar captura/fecha.

## 4. Ruta de menor riesgo y costo

- Fase de desarrollo: trabajar localmente con SQLite y datos sintéticos.
- Pruebas de integración: usar PostgreSQL de prueba y migraciones repetibles.
- Prototipo público desechable: se permite plan gratuito solo si se documenta claramente que no se guardarán datos críticos y se acepta la suspensión/eliminación.
- Producción real: migrar a PostgreSQL de pago antes de introducir inventario, compras, costos, recetas, datos de clientes o información financiera real.
- Verificar exportación y restauración de backup antes del lanzamiento.

## 5. Seguridad mínima

- Contraseñas almacenadas con hash seguro, nunca en texto plano.
- Autenticación y permisos; sesiones seguras; protección CSRF en formularios que cambian datos.
- Validación de entrada y consultas parametrizadas.
- Registro de auditoría de compras, recepciones, consumos, ajustes, CPP y cambios de receta.
- No permitir que una nueva compra reescriba el costo histórico de lotes cerrados.
- Secretos y DATABASE_URL configurados como variables de entorno.
- Exportación CSV controlada y backups con acceso restringido.

## Fuentes oficiales

- https://render.com/pricing
- https://render.com/docs/free
- https://render.com/docs/postgresql
- https://render.com/docs/web-services


## 6. Revisión posterior: requisito de costo cero 24/7 (2026-10-09)

Este documento conserva el análisis de Render como alternativa de pago; **no representa ya la arquitectura prioritaria**. El requisito nuevo es evitar mensualidad y mantener acceso continuo en línea. Se prioriza validar Cloudflare Workers + D1, con cuotas gratuitas y sin SLA garantizado, antes de construir la aplicación integrada. La API necesitará adaptación a JavaScript/TypeScript; no se puede ejecutar Flask directamente como Worker. La decisión sigue provisional hasta que pase las pruebas de transacciones, autenticación, exportación y restauración descritas en docs/23_ARQUITECTURA_GRATUITA_24_7.md y docs/decisiones/D-015_HOSTING_GRATUITO.md.
