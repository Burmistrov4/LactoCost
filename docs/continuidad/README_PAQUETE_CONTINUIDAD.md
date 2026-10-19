# LactoCost — Documentación de continuidad

Este directorio mantiene el contexto mínimo necesario para que una nueva IA o desarrollador pueda continuar el trabajo sin reconstruir todo el historial de conversación.

## Archivos

- **`CONTEXTO_MAESTRO_LACTOCOST.md`**: propósito, arquitectura conocida, estado histórico, migraciones, decisiones D-020/D-021, riesgos y hoja de ruta.
- **`GUIA_GITHUB_Y_SINCRONIZACION_AI_STUDIO.md`**: procedimiento seguro para revisar GitHub, proteger secretos, publicar cambios y sincronizar con Google AI Studio.
- **`PROMPT_INICIAL_GOOGLE_AI_STUDIO.md`**: prompt para comenzar con una auditoría de reconciliación y continuar por fases controladas.

## Repositorio

La fuente versionada esperada es [`Burmistrov4/LactoCost`](https://github.com/Burmistrov4/LactoCost). La rama predeterminada reportada en la última consulta fue `main`. El repositorio figuraba como público, por lo que se deben revisar con especial cuidado los secretos y los datos privados antes de cada publicación.

## Cómo interpretar este material

1. Estos archivos son contexto auxiliar, no sustituyen el código ni las pruebas.
2. Los recuentos de pruebas y detalles de implementación etiquetados como históricos deben verificarse otra vez en el checkout actual.
3. Si la documentación contradice el código, informa la contradicción y busca evidencia adicional; no inventes una reconciliación.
4. Distingue entre código aislado y funcionalidad integrada, migraciones locales y remotas, tests unitarios y E2E, y verificación JWT y autorización completa.
5. No uses datos ficticios como reales ni publiques secretos.

## Primera acción recomendada

Importa el repo existente en Google AI Studio y ejecuta el prompt contenido en `PROMPT_INICIAL_GOOGLE_AI_STUDIO.md`. La primera respuesta debe ser una auditoría sin editar archivos. Después implementa cambios pequeños, con tests y documentación actualizada.
