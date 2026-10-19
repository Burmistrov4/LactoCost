# LactoCost — Guía para GitHub y Google AI Studio

**Última actualización:** 2026-10-19  
**Repositorio oficial del proyecto:** https://github.com/Burmistrov4/LactoCost  
**Ruta local reportada:** `C:\Users\Loro\Desktop\Analisis de Mercado de Yogurt`  
**Objetivo:** publicar, conservar y continuar el proyecto existente sin crear una aplicación paralela ni perder código.

> Esta guía documenta un procedimiento seguro. No significa que el repositorio local haya sido inspeccionado ni que un push se haya realizado.

## 1. Estado conocido del repositorio remoto

En una consulta a GitHub realizada el 2026-10-19, los metadatos de `Burmistrov4/LactoCost` indicaron:

- Nombre: `LactoCost`.
- Rama predeterminada: `main`.
- Visibilidad: **pública**.
- Tamaño reportado por la API: `0`.
- Permiso de push disponible para la cuenta conectada a aquella consulta.

Esto es una observación de ese momento, no una garantía sobre el estado actual. Antes de publicar, confirmar directamente el contenido, ramas, commits, archivo README, configuración y estado local. El campo `size=0` no reemplaza la inspección real.

Como el repositorio es público, **no debe subirse ningún secreto, dato personal, transacción real ni archivo local sensible**. No cambies su visibilidad de forma automática: esa decisión pertenece al propietario.

## 2. Documentos a mantener en `docs/continuidad/`

Estos cuatro archivos deben quedar dentro de la raíz del proyecto:

- `docs/continuidad/README_PAQUETE_CONTINUIDAD.md`
- `docs/continuidad/CONTEXTO_MAESTRO_LACTOCOST.md`
- `docs/continuidad/GUIA_GITHUB_Y_SINCRONIZACION_AI_STUDIO.md`
- `docs/continuidad/PROMPT_INICIAL_GOOGLE_AI_STUDIO.md`

No sobrescribas archivos de igual nombre sin compararlos primero. Si ya existen versiones previas, revisa diferencias y conserva cualquier detalle útil que no esté en la versión regenerada.

## 3. Revisar el proyecto local antes de Git

En PowerShell:

```powershell
Set-Location 'C:\Users\Loro\Desktop\Analisis de Mercado de Yogurt'
Get-Location
Get-ChildItem -Force
Test-Path .git
```

Si ya existe `.git`, no ejecutes `git init`, no borres el directorio Git y no reemplaces la historia. Inspecciona:

```powershell
git rev-parse --show-toplevel
git status --short --branch
git branch --show-current
git remote -v
git log -5 --oneline
```

Comprueba el estado remoto:

```powershell
git ls-remote https://github.com/Burmistrov4/LactoCost.git
```

Usa la autenticación Git ya configurada. No pegues tokens en el chat, en comandos visibles, en archivos del proyecto ni en documentación.

Si la raíz local no tiene Git, no la inicialices hasta confirmar que es la carpeta correcta y revisar el árbol completo, `.gitignore`, archivos sensibles y el estado remoto. El agente autorizado a realizar la publicación debe preservar tanto la historia local como la remota si cualquiera existe.

## 4. Revisión de archivos sensibles

Antes de ejecutar `git add`, revisa el `.gitignore` existente y agrega reglas que falten sin eliminar las que ya protegen el proyecto.

Como mínimo, evaluar y excluir los siguientes elementos cuando existan y sean locales:

```gitignore
# Secrets / local environment
.env
.env.*
!.env.example
!.env.sample
.dev.vars
.dev.vars.*
*.pem
*.key

# Python
.venv/
venv/
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
.ruff_cache/

# Node/build
node_modules/
dist/
build/
coverage/

# Cloudflare local state
.wrangler/

# Local databases, exports and backups
*.sqlite
*.sqlite3
*.db
*.dump
*.bak

# OS/editor/logs
.DS_Store
Thumbs.db
.idea/
*.log
```

Es solo una base; compárala con el proyecto real. No ignores migraciones `*.sql`, pruebas, documentos ni código fuente en bloque. `.env.example` solo se puede publicar después de confirmar que contiene placeholders, no credenciales reales.

Inspecciona archivos staged y sus diffs. No publiques tokens, contraseñas, claves privadas, certificados, URLs de conexión con credenciales, bases de datos reales, dumps ni datos comerciales/financieros privados. Si un archivo es sospechoso, exclúyelo del push y pide revisión; no imprimas el secreto en los logs ni lo copies al reporte.

## 5. Incluir los documentos de continuidad

Copia estos archivos dentro del proyecto en `docs/continuidad/`:

```text
docs/
└── continuidad/
    ├── README_PAQUETE_CONTINUIDAD.md
    ├── CONTEXTO_MAESTRO_LACTOCOST.md
    ├── GUIA_GITHUB_Y_SINCRONIZACION_AI_STUDIO.md
    └── PROMPT_INICIAL_GOOGLE_AI_STUDIO.md
```

Ajusta enlaces relativos si el documento se traslada o cambia de nombre. El archivo maestro describe arquitectura y decisiones conocidas; el código y las pruebas reales prevalecen si hay discrepancias. No inventes archivos ni marques tareas pendientes como terminadas.

## 6. Preflight antes de publicar

Ejecuta solo los comandos adecuados a la situación real. No asumas que la carpeta ya tiene Git ni que GitHub está vacío.

```powershell
git status --short --branch
git diff --stat
git diff --check
```

Después de añadir archivos seleccionados al staging, revisar:

```powershell
git status --short
git diff --cached --stat
git diff --cached --name-status
git diff --cached --check
git diff --cached
```

Haz una segunda inspección de secretos sobre los archivos staged. Verifica que solo se incluyan archivos intencionales, especialmente en un repo público.

Si el repositorio remoto y la historia local divergen, no uses `push --force`, `push -f`, `reset --hard`, `clean -fd` ni ninguna operación que reescriba o destruya historia. Detente y reconcilia la situación preservando ambas partes.

El propietario autorizó preparar la publicación del proyecto en `Burmistrov4/LactoCost`. Esa autorización no permite filtrar secretos ni hacer despliegues. El commit y el push solo deben producirse después de revisar el contenido que se publicará.

## 7. Verificación después del push

Después de publicar, comprueba:

```powershell
git status --short --branch
git log -1 --oneline
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Si se publica de forma justificada en otra rama, verifica esa rama concreta. El SHA remoto debe coincidir con el commit esperado. Inspecciona en la interfaz web de GitHub los directorios y archivos esenciales y confirma que los cuatro documentos de continuidad estén presentes.

No declares éxito solo porque `git push` no devolvió error. Registra branch, SHA y evidencia de que el contenido está en GitHub.

## 8. Importar el repositorio existente en Google AI Studio

La documentación oficial de Google AI Studio Build indica que se puede importar un proyecto existente desde GitHub mediante el menú **Add files (+) → Import from GitHub** y habilitar sincronización bidireccional desde **Settings → GitHub**. La interfaz puede cambiar.

Referencia oficial: https://ai.google.dev/gemini-api/docs/aistudio-build-mode

Pasos recomendados:

1. Abre Google AI Studio y entra en **Build mode**.
2. Usa **Add files (+) → Import from GitHub** y selecciona `Burmistrov4/LactoCost`.
3. Si solicita autorización de GitHub, autoriza solo los permisos necesarios en la interfaz oficial. No compartas tokens con el agente.
4. Verifica que se haya importado la rama correcta y que aparecen los archivos reales del proyecto.
5. Abre `docs/continuidad/PROMPT_INICIAL_GOOGLE_AI_STUDIO.md` y utilízalo como primera instrucción.
6. Pide primero una auditoría de reconciliación del código, arquitectura, pruebas y estado de seguridad. No autorices una reescritura completa de entrada.
7. Revisa los resultados y el diff antes de sincronizar modificaciones.
8. Mantén un único agente/editor modificando los mismos archivos al mismo tiempo, o crea ramas y reconcilia conscientemente los cambios.

Google AI Studio Build puede trabajar con aplicaciones web de frontend React y runtime de servidor Node.js. Eso no implica que deba reemplazar los módulos Python ni el prototipo Cloudflare/D1 de LactoCost. El agente debe mapear las dependencias existentes y explicar cualquier incompatibilidad antes de cambiar la arquitectura.

## 9. Ciclo de trabajo recomendado

1. GitHub conserva la base versionada.
2. AI Studio inspecciona el proyecto real y propone un plan de trabajo.
3. Los cambios se implementan en lotes pequeños y con criterios de aceptación.
4. Antes de sincronizar, se revisan los diffs y archivos afectados.
5. Después de sincronizar, se ejecutan las pruebas disponibles y se registran resultados reales.
6. Se actualizan decisiones, `AGENT_HANDOFF.md`, `PLAN_MAESTRO.md` y los documentos de continuidad si cambia la arquitectura o el estado.

No marcar como completo un módulo que solo contiene una función aislada. No confundir una migración local con una aplicada en remoto, pruebas unitarias con pruebas de integración, un prototipo de UI con una app conectada a servicios reales ni un verificador JWT con autorización funcional.
