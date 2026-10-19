# Proyecto de investigación comercial y factibilidad — Yogur y quesillo

**Estado:** investigación activa; no autoriza compras ni fabricación.  
**Mercado inicial:** Valencia y municipios cercanos, Carabobo, Venezuela.

## Navegación
- [Plan maestro](PLAN_MAESTRO.md)
- [Índice documental](docs/00_INDICE.md)
- [Metodología y evidencia](docs/01_METODOLOGIA_EVIDENCIA.md)
- [Mercado y competencia](docs/02_MERCADO_COMPETENCIA.md)
- [Proveedores](docs/03_PROVEEDORES.md)
- [Costos de yogur](docs/04_COSTOS_YOGUR.md)
- [Costos de quesillo](docs/05_COSTOS_QUESILLO.md)
- [Precios y canales](docs/06_PRECIOS_CANAL_VENTAS.md)
- [Inocuidad y normativa](docs/07_INOCUIDAD_NORMATIVA.md)
- [Arquitectura de la aplicación](docs/08_ARQUITECTURA_APLICACION.md)
- [Decisiones y bitácora](docs/09_DECISIONES_RIESGOS_BITACORA.md)
- [Costo promedio ponderado y compra sugerida](docs/12_COSTO_PROMEDIO_PONDERADO.md)
- [Despliegue en Render](docs/13_DESPLIEGUE_RENDER.md)
- [Referencias de cultivos y envases](docs/16_REFERENCIAS_CULTIVOS_ENVASES.md)
- [Referencias de quesillo artesanal](docs/17_REFERENCIAS_QUESILLO_ARTESANAL.md)
- [Presupuesto Render y persistencia](docs/18_PRESUPUESTO_RENDER_Y_PERSISTENCIA.md)
- [Ruta sanitaria por confirmar](docs/19_RUTA_SANITARIA_POR_CONFIRMAR.md)
- [Auditoría del PDF del estudio de mercado](docs/20_AUDITORIA_PDF_ESTUDIO_MERCADO_YOGURES.md)
- [Conciliación inicial de inventario](docs/21_CONCILIACION_INVENTARIO_INICIAL.md)
- [Casos de prueba CPP y precios](docs/22_CASOS_PRUEBA_CPP_Y_PRECIOS.md)
- [Motor financiero — instrucciones](app/README.md)
- [Decisión técnica del motor](docs/decisiones/D-014_MOTOR_CALCULO.md)
- [Arquitectura gratuita 24/7](docs/23_ARQUITECTURA_GRATUITA_24_7.md)
- [Spike local Cloudflare Workers + D1](spikes/cloudflare-d1/README.md)
- [Decisión de hosting gratuito](docs/decisiones/D-015_HOSTING_GRATUITO.md)

## Continuidad entre agentes
- **Leer primero:** [AGENT_HANDOFF.md](AGENT_HANDOFF.md). Contiene el protocolo obligatorio, estado verificado, rutas clave, comandos de prueba, restricciones y siguiente tarea para que otro agente continúe sin depender de la memoria del chat.
- **Paquete de continuidad:** [docs/continuidad/](docs/continuidad/README_PAQUETE_CONTINUIDAD.md) — contexto maestro, guía de publicación en GitHub/sincronización con Google AI Studio y prompt de arranque.
- [Especificación del dashboard inteligente](docs/24_DASHBOARD_UX.md)
- [Modelo conceptual y fases de datos](docs/25_MODELO_DATOS_Y_FASES.md)
- [Prototipo de dashboard local](spikes/cloudflare-d1/public/index.html)

## Principios
1. No inventar precios, rendimientos, proveedores, permisos ni demanda.
2. Distinguir dato publicado, cotización directa, estimación e hipótesis.
3. Registrar fecha, unidad, impuestos, mínimo de compra, vigencia y condiciones.
4. No contactar terceros, comprar, publicar ni desplegar sin autorización expresa.
5. No fabricar ni vender hasta confirmar requisitos sanitarios y controles aplicables.
6. No prometer el primer lugar en Google; medir clientes rentables, recompra y margen.
7. Investigar primero; aplicación interna después; tienda pública al final.

## Stack de referencia
Se inspeccionó el proyecto de referencia en C:\Users\Loro\Desktop\Cuarto Semestre\Programación III\Proyecto Final de Python. Stack documentado: Python 3.12 + Flask 3.1, SQLite3, Jinja2, HTML5, CSS3 y JavaScript Vanilla, sin framework frontend.

**Decisión de hosting revisada:** se prioriza evaluar una arquitectura gratuita 24/7 con Cloudflare Workers + D1 antes de construir la aplicación integrada. Esto implica adaptar el backend respecto al prototipo Flask; no se ha desplegado nada. Render queda como alternativa de pago si se necesitan más recursos o garantías. Comparativa, límites y pruebas pendientes: [arquitectura gratuita 24/7](docs/23_ARQUITECTURA_GRATUITA_24_7.md).

- [Plantilla de levantamiento de mercado](docs/10_PLANTILLA_LEVANTAMIENTO_MERCADO.md)
- [Plantilla de cotización a proveedores](docs/11_PLANTILLA_COTIZACION_PROVEEDOR.md)
- [Costo promedio ponderado y compra sugerida](docs/12_COSTO_PROMEDIO_PONDERADO.md)
- [Despliegue en Render](docs/13_DESPLIEGUE_RENDER.md)
- [Referencias de precios — octubre 2026](docs/14_REFERENCIAS_PRECIOS_OCTUBRE_2026.md)
- [Comparativo de yogur y quesillo](docs/15_COMPARATIVO_YOGUR_QUESILLO_SEPTIEMBRE_2026.md)
- [Referencias de cultivos y envases](docs/16_REFERENCIAS_CULTIVOS_ENVASES.md)
