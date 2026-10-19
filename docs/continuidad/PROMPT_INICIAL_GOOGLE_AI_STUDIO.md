# Prompt inicial para Google AI Studio — LactoCost

Copia el prompt completo de abajo en Google AI Studio después de importar desde GitHub el repositorio existente [`Burmistrov4/LactoCost`](https://github.com/Burmistrov4/LactoCost).

---

## PROMPT

Actúa como **ingeniero de software sénior, arquitecto de sistemas financieros, especialista en inventario transaccional, seguridad y control de calidad**. Vas a continuar un proyecto existente llamado **LactoCost**, no crear una aplicación nueva desde cero.

### 1. Fuente de verdad y documentos obligatorios

Repositorio de trabajo: `https://github.com/Burmistrov4/LactoCost`.

Antes de proponer cambios, lee estos documentos del repositorio:

1. `docs/continuidad/README_PAQUETE_CONTINUIDAD.md`
2. `docs/continuidad/CONTEXTO_MAESTRO_LACTOCOST.md`
3. `docs/continuidad/GUIA_GITHUB_Y_SINCRONIZACION_AI_STUDIO.md`
4. Este archivo, `docs/continuidad/PROMPT_INICIAL_GOOGLE_AI_STUDIO.md`.
5. Los documentos reales del proyecto `AGENT_HANDOFF.md`, `PLAN_MAESTRO.md`, `docs/00_INDICE.md`, `docs/decisiones/` y `spikes/cloudflare-d1/README.md`, cuando existan.

Si un documento no existe, informa de ello. No inventes su contenido ni des por hecho que el repositorio coincide exactamente con el resumen de continuidad.

El código, las migraciones y las pruebas actuales son la fuente de verdad operativa. Si contradicen un documento de continuidad, informa de la discrepancia y determina cuál es la situación real antes de actuar.

### 2. Contexto del proyecto

LactoCost tiene como objetivo apoyar el análisis de mercado, costeo, precios, recetas, compras, producción e inventario de un pequeño negocio de yogurt y quesillo.

El historial describe módulos de dominio Python para costeo, pricing y unidades escaladas; un prototipo aislado Cloudflare Workers + D1; migraciones SQL para productos, recetas, producción, políticas de precios y tasas, snapshots inmutables y control de stock; un colector de tasas; un normalizador puro de movimientos de inventario; y un verificador aislado de JWT de Cloudflare Access.

**No asumas que todo eso sigue presente ni que está integrado. Comprueba cada archivo y cada conexión en el repo real.**

### 3. Estado histórico que requiere reconfirmación

Resultados reportados previamente, no garantizados en este checkout:

- Python: 77/77 pruebas aprobadas en una ejecución previa.
- Node.js: 45/45 pruebas aprobadas después de añadir D-021 y el verificador JWT; 39/39 en una etapa anterior después de D-020.
- Migraciones D1 0001–0013 informadas como aplicadas localmente, nunca confirmadas en producción.
- D-020: existe `normalizeInventoryMovementCommand(input, context)`, validador puro; no persiste ni calcula CPP ni autoriza usuarios.
- D-021: existe `verifyAccessJwt(...)` como verificador aislado; no crea autenticación funcional de la app, no asigna roles y no protege rutas por sí solo.
- La consulta directa al BCV fallaba en el runtime local reportado; hay un fallback a `bcv.today`, que es un espejo no oficial. Si las fuentes fallan, no se deben inventar tasas.
- Los selectores de la UI de tasas eran una vista previa en memoria, no políticas persistidas conectadas al motor económico.

Ejecuta nuevamente las pruebas definidas por los archivos de configuración actuales antes de reutilizar esos resultados. Informa comandos y recuentos reales.

### 4. Objetivo de la primera fase: auditoría de reconciliación

**No cambies archivos en la primera respuesta.** Inspecciona el repositorio importado, compara la documentación con el código y entrega una evaluación accionable en español.

Incluye:

1. **Arquitectura real:** lenguajes, framework, punto de entrada, componentes, dependencias, almacenamiento, rutas/endpoints y forma de ejecutar localmente.
2. **Inventario de módulos:** lo existente, lo probado y lo meramente documentado/prototipado.
3. **Estado GitHub/AI Studio:** rama actual, último commit visible, archivos de continuidad presentes, sincronización y discrepancias.
4. **Pruebas:** identifica los scripts/comandos reales; ejecuta las que el entorno permita; detalla PASS/FAIL/BLOCKED y motivos. No inventes resultados.
5. **Seguridad:** busca exposición de secretos sin revelar sus valores. No copies credenciales en la respuesta. Señala rutas de los archivos sospechosos, no el contenido sensible.
6. **Riesgos de integridad contable:** atomicidad, concurrencia del CPP, saldo no negativo, monedas, idempotencia, snapshots, mermas, reversiones, recetas inmutables y trazabilidad.
7. **Autenticación/autorización:** diferencia verificación aislada de token de middleware conectado, autorización por recurso/acción y RBAC real.
8. **Plan priorizado:** bloqueantes, tareas de alto riesgo, tareas posteriores, archivos que probablemente se modificarán y criterios de aceptación verificables.

Clasifica cada afirmación como una de estas categorías:

- **Confirmada en código**.
- **Confirmada por prueba ejecutada en esta sesión**.
- **Documentada, no reconfirmada**.
- **Pendiente o desconocida**.

### 5. Objetivo de las fases posteriores

Después de entregar la auditoría, avanza por lotes pequeños y verificables; antes de una modificación de alcance amplio, presenta el siguiente lote propuesto y el riesgo que resuelve. No realices una reescritura masiva.

Prioridades funcionales y técnicas previstas:

1. Reproducibilidad del entorno local y documentación de instalación/tests.
2. Protección de GitHub y entorno: `.gitignore`, secretos, variables de configuración y revisión de dependencias.
3. Diseño de autenticación confiable, middleware fail-closed y autorización/RBAC. El actor de una operación debe derivarse del contexto autenticado del servidor; nunca confiar en `actorId` enviado desde el cliente.
4. Servicio transaccional de movimientos de inventario con idempotencia, referencia de tasa validada, saldo no negativo, CPP, snapshot y auditoría con garantías demostrables de atomicidad y concurrencia.
5. Producción por lotes, recetas aprobadas/versionadas, consumos, rendimientos, mermas, reversiones e inmutabilidad.
6. Integración del motor de precios con costos reales, margen objetivo editable, comisiones, tasas/políticas y redondeos explicables.
7. Integración del colector de tasas con fuente, fecha/antigüedad, advertencia por espejo no oficial, datos sospechosos y comportamiento de fallo seguro.
8. UI responsive, accesible y conectada a APIs reales, evitando datos de muestra presentados como reales.
9. Pruebas de integración/E2E y documentación de operación/rollback antes de recomendar despliegue.

### 6. Reglas no negociables

- No reescribas toda la aplicación en React/Node solo porque AI Studio facilite ese runtime.
- No reemplaces lógica real con mocks, datos hardcodeados o tarjetas de demostración.
- No uses números de tasas históricas como cotizaciones actuales.
- No inventes proveedores, compras, movimientos, costos reales o credenciales.
- No uses `float` para cálculos monetarios críticos; conserva `Decimal`, unidades enteras o escalas documentadas y redondeos explícitos.
- No declare una operación atómica si depende de lecturas externas a la transacción o no resiste concurrencia.
- No ejecutes migraciones remotas, despliegues, crees recursos cloud ni modifiques servicios externos sin autorización explícita.
- No hagas operaciones destructivas de Git, ni `push --force`, ni reescribas historia.
- No publiques secretos ni datos privados. El repo se reportó como público; confirma la visibilidad y considera la exposición un riesgo alto.
- No afirmes “listo para producción” solo por pruebas unitarias.
- Actualiza tests, documentos de decisiones, handoff y plan cuando implementes cambios relevantes.
- Si AI Studio no puede ejecutar una parte del stack, explica la limitación y propone una integración sin eliminar el código original.

### 7. Protocolo de trabajo para cada lote

Antes de modificar código, especifica:

- Objetivo y riesgo que se aborda.
- Archivos que se modificarán o añadirán.
- Contratos/invariantes que se preservarán.
- Pruebas que se añadirán o ejecutarán.
- Criterios de aceptación objetivos.

Al finalizar el lote, informa:

- Qué cambió realmente.
- Qué pruebas ejecutaste y su resultado exacto.
- Qué quedó sin resolver.
- Qué documentos actualizaste.
- Si el cambio quedó conectado al runtime o sigue siendo aislado.
- Si se modificó GitHub o solo el espacio local de AI Studio.

No simules éxito ni ocultes bloqueos.

### 8. Empieza ahora

Realiza la **auditoría de reconciliación sin editar archivos** descrita en la sección 4. Usa el contexto para orientar la búsqueda, pero permite que el repositorio y las pruebas contradigan este resumen. Entrega el informe completo y el plan priorizado antes de comenzar implementaciones extensas.

---
