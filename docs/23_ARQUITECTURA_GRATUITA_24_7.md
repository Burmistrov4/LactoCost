# Arquitectura de hosting gratuito 24/7 — evaluación y decisión provisional

**Fecha:** 2026-10-09  
**Estado:** evaluación técnica; no desplegado.  
**Objetivo:** minimizar a US$0/mes el costo recurrente del alojamiento en línea, sin confundir “plan gratuito” con SLA garantizado ni arriesgar datos comerciales.

## 1. Conclusión ejecutiva

La arquitectura anterior —Flask + Render + PostgreSQL administrado— no cumple el requisito de costo recurrente cero si se exige persistencia robusta y disponibilidad continua. El servicio web gratuito de Render puede suspenderse y su PostgreSQL gratuito vence a los 30 días; no se debe guardar allí inventario real.

Como el sistema integrado todavía no existe, conviene evaluar una alternativa cloud-first antes de crear rutas, plantillas y persistencia:

- **Candidata A — Cloudflare Workers + D1 + assets estáticos:** costo nominal $0 dentro de las cuotas gratuitas; API y web se sirven desde la red de Cloudflare, y D1 proporciona almacenamiento SQL persistente. Implica adaptar o reimplementar el backend Python/Flask como Worker en JavaScript/TypeScript y cambiar la capa de acceso a datos. No es un simple despliegue de Flask.
- **Candidata B — PC propia siempre encendida:** conservar Flask + SQLite y publicar acceso mediante túnel seguro. Puede evitar una cuota de hosting, pero depende de electricidad, Internet, equipo, configuración del túnel y mantenimiento. SQLite exige cuidado adicional si hay concurrencia, backups y acceso remoto.
- **Candidata C — Oracle Cloud Always Free:** permite una VM gratuita bajo condiciones y disponibilidad de capacidad, pero requiere administrar sistema operativo, parches, firewall, backups y seguridad. No se considera una garantía de disponibilidad ni la opción más sencilla.
- **PythonAnywhere gratuito:** descartado como base para el requisito 24/7 permanente en cuentas nuevas: la documentación vigente indica límites de recursos y caducidad de la web app gratuita al cabo de un mes sin renovación/actividad aplicable.

## 2. Evidencia de límites consultados

### Cloudflare Workers + D1

La documentación de Workers indica una cuota gratuita de hasta 100.000 solicitudes por día, 10 ms de CPU por solicitud y límites de subsolicitudes. D1 en Workers Free incluye hasta 5 millones de filas leídas por día, 100.000 filas escritas por día y 5 GB de almacenamiento total. Si se exceden las cuotas diarias de lecturas/escrituras, las consultas pueden fallar hasta el reinicio de la cuota; superar el almacenamiento también impide nuevas operaciones que lo requieran.

Fuentes oficiales:
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/reference/faq/

**Interpretación:** parece suficiente para una aplicación interna pequeña si las consultas son eficientes y el uso permanece dentro de límites, pero no garantiza capacidad ilimitada ni SLA contractual en el plan gratuito. Hay que diseñar para límites, errores, exportación y backups independientes.

### PythonAnywhere

La página oficial de cuentas gratuitas enumera 100 segundos de CPU para tareas/consolas, 512 MiB de almacenamiento, una web app con un worker y caducidad de un mes. Las cuentas nuevas también perdieron tareas programadas y MySQL gratuito.

Fuentes:
- https://help.pythonanywhere.com/pages/FreeAccountsFeatures/
- https://blog.pythonanywhere.com/221/

**Interpretación:** no cumple el objetivo de alojar permanentemente una aplicación de negocio sin tareas de mantenimiento/caducidad.

### Oracle Cloud Always Free

Oracle documenta recursos Always Free de cómputo, pero la capacidad puede no estar disponible en una región y forma concreta; además, la VM requiere operación y hardening por cuenta propia.

Fuentes:
- https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- https://docs.oracle.com/iaas/Content/FreeTier/freetier.htm

**Interpretación:** posible alternativa, no se elige sin probar disponibilidad, requisitos de alta de cuenta y esfuerzo de mantenimiento.

### GitHub Pages

La documentación de GitHub advierte que Pages no está destinado ni permitido como hosting gratuito para sitios orientados principalmente a facilitar transacciones comerciales o ejecutar un SaaS. No usarlo como alojamiento principal de la aplicación comercial.

Fuente:
- https://github.com/github/docs/blob/main/content/pages/getting-started-with-github-pages/github-pages-limits.md

## 3. Recomendación de arquitectura

**Recomendación provisional para validar primero: Cloudflare Workers + D1.** Se prioriza porque el sistema integrado aún no se ha construido y permite diseñar desde el principio alrededor de un nivel gratuito sin mantener una VM. La decisión no está cerrada hasta hacer un spike técnico verificable.

Separación propuesta:
1. Interfaz responsive servida como assets estáticos desde Workers/Pages, sin secretos en el navegador.
2. API Worker con validación de entrada y operaciones de negocio del lado servidor.
3. D1 con migraciones SQL versionadas, claves foráneas, restricciones e índices.
4. Autenticación y autorización obligatorias antes de registrar datos reales. No asumir que ocultar una URL protege la app.
5. Auditoría append-only para movimientos de inventario, compras, CPP, recetas, lotes y ajustes.
6. Exportación de datos en formato abierto y procedimiento probado de respaldo/restauración fuera de la base principal.
7. Límites de tasa, límites de tamaño, manejo explícito de cuotas excedidas y errores de base de datos.
8. Alertas visibles de disponibilidad/errores sin depender de un servicio de pago.
9. Mantener el motor financiero Python como referencia de pruebas; portar las fórmulas a TypeScript solo con pruebas equivalentes y comparación de resultados Decimal/precisión.

## 4. Requisitos de validación antes de elegir

- [ ] Construir un Worker mínimo que lea/escriba D1 y despliegue un entorno de prueba.
- [ ] Probar transacciones y restricciones para recepción, consumo, ajustes y cálculo CPP.
- [ ] Verificar límites reales de precisión decimal; almacenar dinero como enteros en unidad monetaria menor o representación decimal controlada, nunca números binarios de punto flotante sin control.
- [ ] Probar autenticación, autorización por usuario, CSRF cuando aplique, rate limiting y protección de secretos.
- [ ] Verificar si el modo de autenticación elegido funciona sin correo/SMS de pago; no implementar recuperación de cuenta insegura.
- [ ] Crear exportación y restauración en base vacía y demostrar que los movimientos históricos permanecen coherentes.
- [ ] Simular cuota excedida y demostrar que no se pierden ni duplican movimientos.
- [ ] Confirmar límites vigentes y términos de uso el día del despliegue.
- [ ] Probar responsive y flujos críticos en móvil y escritorio.
- [ ] No cargar datos financieros reales hasta superar pruebas de seguridad, backup y restauración.

## 5. Lo que “gratis 24/7” no significa

- No equivale a SLA de disponibilidad, soporte prioritario ni recursos ilimitados.
- La plataforma puede limitar, suspender o cambiar su plan gratuito conforme a términos vigentes.
- Una caída de proveedor, cuenta, DNS o Internet puede interrumpir el servicio.
- El sistema necesita backups y exportaciones, aunque el hosting sea gratuito.
- El desarrollo, mantenimiento, dominio opcional y conectividad pueden tener costo de tiempo o dinero.
- No se debe introducir información sensible ni usar el sistema como registro único hasta tener restauración comprobada.

## 6. Decisión pendiente

Se propone aprobar técnicamente la candidata Cloudflare Workers + D1 tras un prototipo de validación, sin eliminar aún el módulo Python de referencia. No se ha creado cuenta, desplegado nada, cambiado DNS, comprado dominio ni transferido información. La alternativa Render se conserva documentada como opción de pago si el proyecto supera los límites del plan gratuito o requiere soporte/garantías mayores.
