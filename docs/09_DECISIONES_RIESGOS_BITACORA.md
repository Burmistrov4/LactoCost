# Decisiones, riesgos, incógnitas y bitácora

## Decisiones vigentes
- D-001: investigación antes de aplicación y tienda pública.
- D-002: estudiar yogur y quesillo en paralelo; lanzamiento podría ser separado.
- D-003: medir contribución y caja, no solo margen aparente sobre ingredientes.
- D-004: no contactar proveedores ni comprar sin autorización explícita.
- D-005: stack de referencia Flask + SQLite + Jinja2 + HTML/CSS/JS Vanilla.
- D-006: Pages estático no aloja Flask/SQLite por sí solo.
- D-007: tienda/landing pública queda para el final.
- D-008: SEO no garantiza ranking; medir tráfico y conversión.

## Riesgos prioritarios
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Precio publicado vencido | Alto | fecha y cotización con vigencia |
| Envase consume margen | Alto | cotizar volumen/formato alternativo |
| Perecedero no vendido | Alto | pedidos anticipados, lotes pequeños |
| Cadena de frío inadecuada | Crítico | validar proceso y logística |
| Rendimiento supuesto | Alto | medir y documentar lotes |
| Mayorista exige descuento/crédito | Alto | modelar caja y plazo de cobro |
| Proveedor único | Medio/alto | segunda fuente |
| Impuestos contabilizados mal | Alto | separar neto/bruto |
| Despliegue sin persistencia/backup | Alto | arquitectura antes de publicar |
| Marketing/claims no demostrados | Alto | afirmaciones verificables |

## Incógnitas bloqueantes
1. Presupuesto y pérdida máxima tolerable.
2. Espacio autorizado o necesidad de maquila.
3. Precio mayorista entregado de yogur terminado.
4. Precio de leche pasteurizada/cruda en Carabobo.
5. Envases a 500/1.000/5.000 unidades.
6. Cultivo y ficha técnica.
7. Costo de refrigeración/transporte por pedido.
8. Precio/peso/demanda de quesillo por formato.
9. Permisos y ensayos requeridos.
10. Disposición a pagar y frecuencia.
11. Tiempo de trabajo y costo asignado.
12. Aplicación local o en línea/multiusuario.

## Bitácora
### 2026-10-09 — Organización inicial
- Leídos README, requirements y plan maestro del proyecto de referencia TechLoan.
- Confirmado stack documentado: Python 3.12, Flask 3.1, SQLite3, Jinja2, HTML/CSS/JS Vanilla.
- Creada carpeta de investigación y documentos Markdown iniciales.
- Añadidas fuentes públicas como pistas, no cotizaciones confirmadas.
- No se contactó a proveedores ni se compró nada.
- Siguiente: ampliar investigación de quesillo y precios locales; verificar mayoristas y normativa oficial; diseñar ficha de campo y cotización.

## Plantilla de entrada
### AAAA-MM-DD — título
- Pregunta investigada:
- Evidencia nueva:
- Cálculo/implicación:
- Confianza:
- Qué falta:
- Documentos actualizados:
- Decisión afectada:


### 2026-10-09 — Segunda pasada de investigación
- Se encontró una lista indexada de precios CIUPAS con referencias de Yolo, Yoka y Frigurt; la unidad comercial de algunas filas sigue ambigua, por lo que no se toma como cotización validada.
- Se ampliaron posibles proveedores industriales de empaques con CAVENVASE: Amcor y MOLANCA, además de Corposur y Tapas Plásticas.
- Se encontró referencia pública de leche condensada Nestlé en Farmatodo y lista de supermercados de septiembre 2026; son precios minoristas y deben normalizarse con fecha/moneda y tipo de cambio aplicable antes de usarse.
- Las búsquedas públicas no permitieron confirmar una ruta oficial completa de permisos para el caso concreto ni un rango fiable de quesillo artesanal en Valencia. Ambos temas siguen pendientes de verificación directa.
- No se enviaron consultas ni se hicieron compras.


### Decisiones añadidas — 2026-10-09
- D-009: backend confirmado en Render; arquitectura en línea recomendada: Render Web Service + Render Postgres. SQLite solo para desarrollo local/pruebas, por el filesystem efímero de Render. Fuente oficial: https://render.com/docs/faq y https://render.com/docs/postgresql.
- D-010: costo promedio ponderado obligatorio para compras e inventario, además de costo real por lote y costo de producto terminado. CPP debe ponderar cantidades y conservar evidencia, moneda, tasa, flete, descuentos y movimientos históricos.
- D-011: el sistema puede recomendar cantidades de compra automáticamente, pero no ejecutar órdenes ni compras sin aprobación explícita del usuario.
- D-012: no comenzar la aplicación integrada ni desplegarla hasta continuar investigación, resolver incógnitas bloqueantes y aprobar especificación. Se permite un prototipo aislado de fórmulas puras, sin persistencia ni uso operativo; la landing pública sigue siendo la última fase.
- D-013: no fijar precio promedio de quesillo sin normalizar peso, formato, canal, ubicación y fecha; los anuncios incompletos quedan como pistas, no como datos comparables.
- Se crearon `docs/12_COSTO_PROMEDIO_PONDERADO.md` y `docs/13_DESPLIEGUE_RENDER.md`, y se enlazaron desde el índice y la arquitectura.


### 2026-10-09 — CPP, Render y nueva referencia de quesillo
- Confirmado por el usuario: backend en Render. Se documentó Render Web Service + Render Postgres como arquitectura objetivo para datos persistentes; las instancias gratuitas pueden suspenderse y el filesystem local no es almacenamiento persistente. Fuentes oficiales: https://render.com/docs/faq ; https://render.com/docs/free ; https://render.com/docs/postgresql.
- Especificado CPP ponderado por cantidad, CPP móvil para inventario como método operativo propuesto, costo por lote, moneda/tasa, flete prorrateado, stock útil y sugerencia de compra con aprobación humana. Se documentaron pruebas obligatorias.
- Nueva referencia pública de quesillo Cremosillo 150 g y 230 g en Farmatodo, con precios en bolívares. Se registra como precio retail observado, no como costo de fabricación ni precio artesanal de Valencia; se requiere verificación de zona/fecha de compra.
- Mercado Libre muestra ofertas de quesillo con peso/ubicación ambiguos y publicaciones pausadas; no se incorporan al rango de precio comparable.
- La búsqueda no cerró la ruta oficial de permisos de elaboración en Carabobo; sigue siendo bloqueante.


### 2026-10-09 — Investigación de precios y Render
- Se creó `docs/14_REFERENCIAS_PRECIOS_OCTUBRE_2026.md` con referencias recientes de leche en polvo, huevos, quesillo, envases y requisitos sanitarios.
- Referencias de septiembre de Ahorra y Ya: San Simón completa 400 g, mediana Valencia $7,57; La Campiña 400 g, mediana Valencia $7,08; Upaca 400 g, mediana nacional $4,94; La Pradera 500 g, mediana Valencia $7,20. Son precios minoristas de comparador, no cotizaciones mayoristas; se mantienen SKUs separados.
- Farmatodo muestra quesillo Cremosillo 150 g a Bs. 2.484 y una ficha relacionada de 230 g a Bs. 3.717 en la última captura. Hay variación entre capturas, así que registrar como precio dinámico que debe confirmarse por zona y fecha.
- Se encontró documentación secundaria sobre Providencia Administrativa 165/2016 y registros sanitarios artesanales, pero no se confirmó su vigencia actual con SACS. Ruta sanitaria continúa bloqueante y debe verificarse oficialmente.
- Corrección crítica de despliegue: Render Postgres gratuito vence a los 30 días, 1 GB, sin backups administrados ni PITR. No usar como almacenamiento de producción para inventario/costos reales. Presupuestar base de pago o alternativa persistente; free solo para prototipo con datos desechables y migración/respaldo explícitos. Fuente oficial https://render.com/docs/free.
- Próximo trabajo: recopilar precios comparables de yogur y quesillo artesanal por peso/canal, y cotizaciones de envases. No hubo contacto directo a proveedores.

- Corrección de calidad de fuente: al abrir directamente páginas de Ahorra y Ya y Farmatodo, se observaron precios/fechas diferentes de los resúmenes indexados (San Simón 400 g: página abierta semana 27 jul–2 ago, mediana Valencia $7,03; Farmatodo Cremosillo 150 g: página abierta Bs. 340 frente a resumen indexado anterior Bs. 2.484). Se marcaron como datos dinámicos no confirmados hasta seleccionar ciudad y registrar captura/fecha. No utilizar estas cifras para cerrar márgenes.


### 2026-10-09 — Comparativo de categoría
- Se creó `docs/15_COMPARATIVO_YOGUR_QUESILLO_SEPTIEMBRE_2026.md` con tabla de precios publicados de yogur y quesillo Cremosillo por formato, mediana, ciudad cuando disponible y precio normalizado por 100 g/ml.
- La fuente Ahorra y Ya informa para la ventana 14–20 septiembre 2026 Cremigurt griego 150 g mediana nacional $2,34 y Valencia $2,28; Yoka griego fresa 150 g mediana $2,43; Yolo griego fresa 680 g mediana nacional $9,10 y Valencia $8,78; yogur griego natural Yolo 750 ml mediana $9,00.
- En esa misma ventana, el comparador muestra quesillo Cremosillo 150 g mediana $2,80 y 230 g mediana $3,90. Son precios retail industriales, no precios artesanales ni cotizaciones actuales.
- Se mantiene la prohibición de usar promedio general que mezcle estilos, tamaños, ciudades y unidades incompatibles.

- Se creó `docs/16_REFERENCIAS_CULTIVOS_ENVASES.md`: publicaciones públicas de cultivos (Vivolac/LyoPro/Anbras) y envases de aluminio para quesillo. Los costes nominales derivados ($0,20/L, $0,046/L, $0,05/L; $0,30/unidad y $1,20/unidad) se etiquetan como referencias de publicación, no cotizaciones ni costo real validado. Aptitud alimentaria, dosificación, conservación, flete, disponibilidad y MOQ siguen pendientes.


### 2026-10-09 — Referencias de quesillo artesanal y presupuesto Render
- Se creó `docs/17_REFERENCIAS_QUESILLO_ARTESANAL.md`. Mercado Libre muestra una publicación pausada de quesillo Caserito Postres de 1 kg a US$10, con variantes descritas de US$10–15 según sabor; es una pista histórica, no cotización vigente ni evidencia de entrega en Valencia.
- Gama en Línea muestra Cremosillo 150 g a US$2,80, 230 g a US$4,19 y 400 g a US$7,97 (totales publicados con IVA), equivalentes nominales de US$18,67/kg, US$18,22/kg y US$19,93/kg. Son comparables industriales minoristas; no mezclarlos con precio artesanal para formar un promedio.
- No se considera cerrado el muestreo de quesillo artesanal local: falta confirmar ofertas vigentes en Valencia/Carabobo, peso, entrega y canal.
- Se creó `docs/18_PRESUPUESTO_RENDER_Y_PERSISTENCIA.md`. La página oficial de Render publica Web Service de pago desde US$7/mes (0,5 CPU/512 MB) y US$25/mes (1 CPU/2 GB); falta confirmar el plan/precio de PostgreSQL al contratar, por lo que no se declara un total mensual.
- Se mantiene el requisito de no usar PostgreSQL gratuito de 30 días para datos reales de inventario/costos. No hubo contacto con vendedores o proveedores, ni compras, ni despliegues.
- Fuentes consultadas: https://articulo.mercadolibre.com.ve/MLV-769426516-quesillo-tradicional-caserito-postres-_JM ; https://gamaenlinea.com/es/quesillo-casero-tradicional-cremosillo-150-gr/p/30005687 ; https://gamaenlinea.com/es/quesillo-casero-tradicional-cremosillo-230-gr/p/30005689 ; https://gamaenlinea.com/es/quesillo-casero-tradicional-cremosillo-400-gr/p/30005690 ; https://render.com/pricing ; https://render.com/docs/free.

### 2026-10-09 — Ruta sanitaria documental
- Se creó `docs/19_RUTA_SANITARIA_POR_CONFIRMAR.md`. Se encontró un índice de recursos de industria alimentaria con documentos atribuidos al SACS y copias secundarias de requisitos para registro nacional/artesanal.
- Las copias describen posibles requisitos como permiso sanitario del establecimiento, evaluación de BPF, etiqueta y análisis de laboratorio, pero no se toman como confirmación de vigencia ni de aplicabilidad a yogur/quesillo en Carabobo.
- La puerta sanitaria continúa bloqueada hasta obtener requisitos actualizados directamente de SACS/Contraloría Sanitaria de Carabobo para el lugar, escala y productos concretos. No hubo contacto con autoridades, proveedores o vendedores.
- Fuentes secundarias: https://safeintl.com/normas-reglamentos-y-documentos-de-interes-para-la-industria-de-alimentos/ ; https://www.scribd.com/document/770893988/1-Registro-Sanitario-de-Alimentos-Nacionales-Julio2024 ; https://es.scribd.com/document/539753666/Providencia-Administrativa-165-2.


### 2026-10-09 — Lectura y auditoría del PDF local de 19 páginas
- Se leyó `Estudio de Mercado de Yogures en Valencia.pdf` completo mediante extracción por páginas y se creó `docs/20_AUDITORIA_PDF_ESTUDIO_MERCADO_YOGURES.md`.
- El PDF es una cadena de respuestas generadas con datos declarados por el usuario y estimaciones; no constituye un estudio de mercado verificado. Sus precios locales, cuotas de volumen, descuentos mayoristas y afirmaciones de vida útil no están sustentados por evidencia adjunta suficiente.
- Se detectaron varias versiones de costo por producto: yogur US$15,714/15 ≈ US$1,05 incluyendo empaque estimado y energía frente a US$13,26/15 ≈ US$0,88 excluyéndolos; quesillo US$4,963 por lote frente a US$3,75 al cambiar componentes incluidos; torta US$6,473 frente a US$5,88. La receta real del quesillo, costo/peso de margarina, azúcar de torta y rendimiento deben confirmarse antes de cerrar cifras.
- El PDF llama “ganancia neta” a resultados que no incluyen de forma demostrada mano de obra, mermas comerciales, frío, transporte, limpieza, impuestos ni costos fijos. Se reclasifican como estimaciones de margen/contribución bajo supuestos.
- Las tasas USD/EUR y sus fechas que aparecen en el PDF no fueron verificadas en esta lectura; quedan pendientes de comprobación oficial antes de utilizarlas. La diferencia matemática entre las tasas citadas no equivale por sí sola a beneficio realizado.
- Se prioriza conciliar inventario real y reconstruir cada lote con moneda/tasa/fecha, costo histórico, costo de reposición, rendimiento vendible y costos indirectos separados. No se contactó a proveedores ni se hizo compra.


### 2026-10-09 — Contraste externo de tasas históricas
- Se contrastaron tasas publicadas por fuentes secundarias que reproducen datos atribuidos al BCV: 01/10 USD 860,18 y EUR 976,84; 02/10 USD 866,56 y EUR 973,93; 07/10 USD 873,87 y EUR 984,26; 08/10 USD 874,73 y EUR 979,08; 09/10 USD 875,65 y EUR 980,61472543. Fuentes: https://finanzasdigital.com/tasa-de-cambio-bcv-01-octubre-2026/ ; https://finanzasdigital.com/tasa-de-cambio-bcv-09-octubre-2026/ ; https://calculadorabcv.com/tasa-bcv-hoy.
- La compra anotada el 03/10/2026 ocurrió en sábado; Bs 866,56 corresponde a la fecha valor 02/10/2026 en los históricos consultados. En el sistema debe conservarse la fecha real de compra y la fecha valor de tasa como campos distintos.
- El PDF no debe reutilizar la tasa EUR del 09/10 para fechas distintas. Se amplió `docs/20_AUDITORIA_PDF_ESTUDIO_MERCADO_YOGURES.md` con tabla de contraste y salvedad: la fuente definitiva debe ser la publicación/captura primaria del BCV archivada por fecha.


### 2026-10-09 — Conciliación inicial y pruebas de aceptación
- Se creó docs/21_CONCILIACION_INVENTARIO_INICIAL.md con los datos reportados en el PDF, saldos teóricos condicionados, campos para conteo físico y listas de recetas por confirmar. Los saldos no se presentan como inventario real hasta el conteo.
- Se creó docs/22_CASOS_PRUEBA_CPP_Y_PRECIOS.md con casos matemáticos de CPP, flete, descuento, conversiones, mermas, costo por unidad vendible, margen frente a markup, historial inmutable y sugerencia de compras.
- Se incorporaron criterios de aceptación para que el futuro sistema no convierta estimaciones en costos definitivos, no permita ajustes silenciosos y no ejecute compras.
- Se actualizó el índice documental. No se modificó el PDF original, no se contactó a proveedores y no se compró ni publicó nada.
- Próximo bloqueo práctico: realizar conteo físico y confirmar las recetas reales; después, convertir estos casos en pruebas automatizadas cuando se apruebe la especificación e implementación de la aplicación.


### 2026-10-09 — Prototipo ejecutable del motor financiero
- Se creó app/core/costing.py, motor aislado basado en Decimal, sin interfaz ni persistencia. Incluye CPP ponderado, recepción con flete/descuento, salida al CPP vigente, costo por rendimiento aprovechable, costo por unidad vendible, precio por margen, markup, contribución y compra sugerida.
- Se añadieron 15 pruebas unitarias en tests/test_costing.py; la ejecución terminó con 15/15 PASS usando python -m unittest discover -s tests -v.
- Se creó app/README.md con instrucciones y límites, y docs/decisiones/D-014_MOTOR_CALCULO.md. Se actualizaron el índice, README y arquitectura.
- Alcance deliberadamente limitado: no hay Flask, DB, autenticación, UI, conversión de monedas/unidades ni movimientos de inventario. No conectar a datos reales ni desplegar hasta diseñar persistencia transaccional, auditoría y seguridad.
- El prototipo no reemplaza el conteo físico ni valida recetas/costos comerciales. No se contactó a terceros ni se realizaron compras.


### 2026-10-09 — Revisión de arquitectura por requisito de hosting gratuito 24/7
- El usuario aclaró que la plataforma debe poder usarse 24/7 con costo recurrente idealmente nulo. Se revisaron fuentes oficiales vigentes de Cloudflare Workers/D1, PythonAnywhere, Oracle Cloud y GitHub Pages.
- Se corrigió la decisión anterior de Render como única arquitectura objetivo: Render + PostgreSQL de pago queda como alternativa, no como ruta prioritaria. Se prioriza validar Cloudflare Workers + D1 porque la app integrada aún no está construida; esto implica adaptar/reimplementar la API en JavaScript/TypeScript, no desplegar Flask sin cambios.
- Cloudflare Free tiene cuotas explícitas: Workers hasta 100.000 solicitudes/día y D1 hasta 5 millones de filas leídas/día, 100.000 escritas/día y 5 GB totales según documentación consultada. Exceder cuotas puede detener consultas hasta el reinicio diario. No es SLA ni capacidad ilimitada.
- PythonAnywhere gratuito para nuevas cuentas tiene caducidad de un mes de la web app y límites reducidos; no se selecciona como base de disponibilidad permanente. Oracle Always Free sigue como alternativa con operación de VM propia y posible falta de capacidad regional.
- Se crearon docs/23_ARQUITECTURA_GRATUITA_24_7.md y docs/decisiones/D-015_HOSTING_GRATUITO.md. README, plan maestro, índice y arquitectura actualizados.
- Se verificó de nuevo el motor Python: python -m unittest discover -s tests -v ejecutó 15 pruebas y todas pasaron; python -m compileall -q app tests terminó con código 0.
- No se creó cuenta, no se desplegó nada, no se modificó DNS, no se compró dominio ni se trasladaron datos reales. Próximo paso técnico: spike mínimo de Workers + D1 y comparación de resultados financieros, antes de desarrollar módulos de negocio.


### 2026-10-09 — Spike local Cloudflare Workers + D1
- Se creó spikes/cloudflare-d1 con Worker mínimo, rutas GET de salud, manejo seguro de fallo de binding/consulta, migración SQL vacía de prueba y cinco tests Node integrados con mocks.
- Verificación local: node --test = 5/5 PASS; migración SQL ejecutada en SQLite en memoria y comprobado INSERT de prueba. Una primera invocación de la comprobación SQL falló por comillas del comando PowerShell; se corrigió y la segunda ejecución terminó con código 0. No se ocultó el fallo inicial.
- Node v24.15.0 y npm 11.12.1 están disponibles en la PC. No se instaló Wrangler ni dependencias, no se creó cuenta/base remota y no se desplegó nada. El Worker no ofrece CRUD ni contiene datos de negocio.
- Se enlazó el spike desde README y arquitectura. Próximo paso: instalar dependencias del spike y ejecutar Wrangler local; luego, solo si el entorno local pasa, evaluar un D1 remoto de prueba con autorización explícita y sin datos reales.


### 2026-10-09 — Validación local de Wrangler y D1
- Se completó npm install en spikes/cloudflare-d1; Wrangler 4.149.0 quedó instalado localmente y npm audit reportó 0 vulnerabilidades en 38 paquetes.
- npm test volvió a pasar 5/5. Wrangler dev local respondió OK en /health y /health/db.
- Se aplicó migrations/0001_spike_probe.sql exclusivamente en D1 local mediante `wrangler d1 migrations apply yogurt-d1-spike --local`; la consulta posterior confirmó la tabla spike_probe. El comando usó explícitamente `--local`; no se accedió a una base remota.
- Se detuvo el servidor local al terminar las pruebas. No se creó cuenta/base remota ni se desplegó. El spike sigue sin endpoints de negocio, autenticación o datos reales.


### 2026-10-09 — Dashboard visual v0.2 y continuidad de agentes
- Se implementó `spikes/cloudflare-d1/public/index.html`: dashboard Cuajada Studio responsive con sidebar, KPIs demo, gráfico SVG, salud del inventario, alertas, actividad reciente, radar de rentabilidad, filtros 7/30/90 días, navegación a placeholders y exportación CSV ficticia. Todos los números se identifican como simulados.
- Se configuró el binding `ASSETS` en `wrangler.jsonc` y Worker `/` para servir el dashboard; `/health` y `/health/db` permanecen disponibles.
- Se amplió `tests/worker.test.js`: ahora 8 pruebas (5 del Worker + 3 de UI/JS estático). Resultado final: 8/8 PASS; `node --check` para Worker y pruebas también PASS. Wrangler local sirvió `/` HTTP 200, `/health` HTTP 200 y `/health/db` HTTP 200.
- Durante la iteración, dos pruebas fallaron porque el `stage` esperado quedó desactualizado tras renombrar el spike; se corrigieron y la suite volvió a pasar. La primera prueba HTTP falló por usar `$HOME`, variable reservada en PowerShell; se cambió a `$page` y la verificación pasó.
- Se crearon `docs/24_DASHBOARD_UX.md`, `docs/25_MODELO_DATOS_Y_FASES.md` y `AGENT_HANDOFF.md`. Se actualizaron README, índice, plan maestro, arquitectura y README del spike.
- El dashboard es solamente UI; cifras y operaciones son ficticias, no hay CRUD, autenticación ni persistencia comercial. No se creó cuenta/base remota ni se desplegó. El servidor local se envió a detener tras las pruebas.
- Próximo paso: revisar modelo conceptual y decisiones que bloquean esquema; añadir pruebas de UI; implementar D1 local con migraciones de catálogo/auditoría, autenticación antes de operaciones reales y pruebas de paridad de CPP antes de integrar el dashboard.


### 2026-10-09 — Esquema fundacional D1 y pruebas de integridad
- Se creó `migrations/0002_business_foundation.sql` con tablas para unidades/conversiones, insumos, proveedores, cotizaciones/líneas, ubicaciones, lotes, movimientos de inventario, snapshots de CPP y eventos de auditoría. Incluye checks, índices e inmutabilidad de movimientos/auditoría mediante triggers; no incluye datos sembrados.
- Se creó `tests/test_schema.py`: comprueba existencia de tablas, unicidad de idempotency key, restricciones, fecha de vencimiento y bloqueo de UPDATE/DELETE de movimientos y auditoría. Suite Python total: 21/21 PASS.
- Wrangler 4.149.0 aplicó la migración 0002 exclusivamente a D1 local; 26 comandos SQL aplicados y consulta confirmó tablas clave. No se usó `--remote`.
- Suite Node del Worker/dashboard: 8/8 PASS. `node --check` para Worker y tests PASS; `python -m compileall -q app tests` PASS.
- Se actualizó `docs/25_MODELO_DATOS_Y_FASES.md`, arquitectura, índice y README del spike. Se documentó escala provisional de micro-unidades enteras para cantidades/importes; requiere revisión de precisión y redondeo antes de congelar el contrato.
- No se implementaron aún auth, autorización, CRUD, transacciones de negocio, recetas, producción, ventas ni backup/restauración. No se introdujeron datos comerciales, no se creó base remota ni se desplegó.
- Próximo paso: añadir tablas versionadas de recetas/productos/producción y luego servicios transaccionales; antes, resolver decisiones bloqueantes de unidades, monedas, usuarios y reglas de CPP. Mantener dashboard en modo demo hasta que la API segura esté conectada.


### 2026-10-09 — Esquema de productos, recetas y producción
- Se creó `migrations/0003_products_recipes_production.sql`: productos terminados/formatos, versiones de receta, líneas de receta, lotes, consumos, salidas, pérdidas, movimientos de producto terminado y snapshots de costo.
- Se añadieron restricciones para versiones de receta, estado completado de lotes, claves de idempotencia y triggers de inmutabilidad en consumos/salidas/movimientos terminados. Se enlazó el output al movimiento terminado mediante FK.
- Se amplió `tests/test_schema.py` a 8 pruebas de esquema (23 pruebas Python totales). Resultado `python -m unittest discover -s tests -v`: 23/23 PASS.
- Wrangler aplicó la migración 0003 exclusivamente en D1 local; 29 comandos SQL ejecutados correctamente y consulta confirmó tablas clave. No se usó base remota.
- El esquema todavía no implica CRUD ni lógica transaccional; falta servicio API, autenticación, costeo de lotes, unidades/monedas aprobadas, exportación y restauración. No se han introducido datos reales ni se ha desplegado.


### 2026-10-09 — Cierre de validación integral de sesión
- Última ejecución combinada completada con código 0: `python -m unittest discover -s tests -v` = 23/23 PASS; `python -m compileall -q app tests` PASS; `npm test` = 8/8 PASS; `node --check src/index.js` y `node --check tests/worker.test.js` PASS.
- Las tres migraciones `0001`, `0002`, `0003` se han aplicado solo en el D1 local; 0002/0003 y tablas clave verificadas por consulta. No existe base remota creada por esta sesión.
- Se detectó que Wrangler/`workerd.exe` seguía escuchando en el puerto local 8791 tras enviar Ctrl+C al proceso wrapper. Se identificó por línea de comando el proceso de este proyecto, se terminó el proceso Node padre y el hijo workerd, y se confirmó `PORT_8791_CLOSED`. No quedó servidor local de esta prueba escuchando.
- No se creó cuenta, no se cambió DNS, no se desplegó, no se compró dominio y no se insertaron datos reales de negocio.


### 2026-10-09 — Calculadora de margen objetivo por producto (dashboard v0.3)
- Se implementó una vista funcional local de Precios & márgenes en `spikes/cloudflare-d1/public/index.html`.
- Cada producto demo (yogurt natural 200 g, yogurt de fresa 200 g, quesillo por porción) tiene porcentaje de margen independiente y editable. Precio sugerido y contribución unitaria cambian al instante, y el radar del dashboard se sincroniza.
- Fórmula implementada: precio = costo variable unitario / (1 − margen objetivo). Se distingue margen sobre precio de venta de markup sobre costo. Se rechazan costo negativo/no finito y margen fuera del intervalo [0%, 100%).
- Prueba matemática: costo Bs. 820 y margen 35% → precio Bs. 1.261,54 y contribución Bs. 441,54 antes de redondeo comercial/otros costos. Es solo un caso de prueba, no una recomendación comercial.
- `spikes/cloudflare-d1/tests/worker.test.js` incorpora tres pruebas nuevas para fórmula, límites y controles UI. Resultado `npm test`: 11/11 PASS; `node --check src/index.js` y `node --check tests/worker.test.js` pasaron; proceso finalizó con código 0.
- Limitaciones deliberadas: el costo de cada producto sigue siendo ficticio; cambios de margen viven solo en la sesión del navegador; sin API, persistencia ni auditoría de cambios. La lógica de producción debe ejecutarse en backend con decimal seguro, persistencia versionada y control de permisos.
- No se creó D1 remoto, no se desplegó, no se usaron datos reales ni se modificó DNS.

- Verificación adicional posterior a la implementación: Wrangler local sirvió la página con `pricingGrid` y `calculatePriceForMargin`; `/health` y `/health/db` respondieron `ok`. El servidor se detuvo y se confirmó `PORT_8791_CLOSED`; no quedó escuchando el puerto local de prueba.

- Revalidación final tras los ajustes visuales: Python 23/23 PASS; `compileall` PASS; Node 11/11 PASS; `node --check` para Worker y tests PASS; proceso combinado finalizó con código 0. Se buscó automatización de navegador dentro de `node_modules` y no hay Playwright, Puppeteer ni jsdom; no se instaló ninguna dependencia adicional. Prueba real de interacción en navegador queda NOT RUN.


### 2026-10-09 — Motor de precios y política versionada (D-016)
- Se implementó `app/core/pricing.py` con Decimal: costo, margen objetivo, comisión porcentual, costo variable fijo por unidad, impuesto añadido como escenario explícito y redondeo configurable. Se recalcula la contribución usando el precio neto ya redondeado para no reportar un margen teórico irreal después del redondeo.
- Se añadieron 10 pruebas de motor de precios y se amplió la suite de esquema para políticas/snapshots versionados, única política activa por presentación, aprobación, retiro seguro, protección contra cambios de campos históricos e inmutabilidad de snapshots.
- Se crearon `0004_product_pricing_policies.sql` y `0005_pricing_policy_retirement_guard.sql` y se aplicaron a D1 local con Wrangler (11 y 5 comandos ejecutados). 0005 endurece el retiro seguro en una base que ya había aplicado 0004. Consulta local confirmó las tablas `product_pricing_policies`, `product_price_snapshots` y triggers de protección. No se usó `--remote`.
- Validación completa: Python 38/38 PASS, compileall PASS, Node 11/11 PASS, `node --check` del Worker y tests PASS. Comando combinado terminó con código 0.
- Actualizados `D-016_PRECIOS_MARGEN_VERSIONADO.md`, `docs/25_MODELO_DATOS_Y_FASES.md`, `docs/00_INDICE.md`, `app/README.md`, README del spike, PLAN MAESTRO y AGENT_HANDOFF.
- La UI aún no persiste margen y no llama a un endpoint. No hay auth/CRUD ni datos reales. No se desplegó ni se creó D1 remoto. La fiscalidad, moneda, canales y redondeo comercial siguen sin aprobar.

- Control de versiones: la raíz `C:\Users\Loro\Desktop\Analisis de Mercado de Yogurt` no contiene `.git`; `git status` y `git diff --check` no son aplicables hasta inicializar un repositorio. No se inicializó Git ni se hizo commit/push.


### 2026-10-09 — Conversión segura de micro-unidades y límites SQLite/D1 (D-017)
- Se añadió `app/core/storage_units.py`: conversión Decimal a entero micro-unidad sin redondeo implícito, conversión inversa y cálculo de costo extendido sin producto INTEGER potencialmente desbordado.
- Se validan no finitos, negativos cuando no proceden, pérdida de precisión por más de seis decimales, signed int64 y overflow de costo extendido. El redondeo requiere una regla explícita.
- Se añadieron 8 pruebas en `tests/test_storage_units.py`; última suite Python: 46/46 PASS y `python -m compileall -q app tests` PASS.
- Se creó `docs/decisiones/D-017_MICRO_UNIDADES_Y_OVERFLOW.md` y se actualizaron índice, README del motor, modelo de datos y handoff.
- No se modificó D1 con esta tarea; no hay API conectada ni despliegue. La escala micro-unidad sigue provisional hasta aprobar moneda y unidades.
- El proyecto no está dentro de un repositorio Git; no se inicializó ni se hizo commit/push.

### 2026-10-09 — Tasas de cambio BCV/Binance P2P y política independiente (D-018)

- Se añadió `app/core/exchange_rates.py` con cálculo Decimal de media/mediana de muestra P2P, filtros de anuncios, conversión con redondeo explícito e inversión de tasa validada. Se añadieron 7 pruebas.
- Se creó `spikes/cloudflare-d1/migrations/0006_exchange_rates.sql` para observaciones, políticas por finalidad y aplicaciones históricas. La primera comprobación encontró que USDT (4 caracteres) no pasaba la restricción inicial de 3; se corrigió el esquema para admitir códigos de activos de 3–5 caracteres. Antes de recrear las tres tablas locales, se comprobó que observaciones/políticas/aplicaciones tenían 0 filas. No se borró dato de negocio.
- Se creó `spikes/cloudflare-d1/src/exchange-rates.js`: extracción BCV USD/EUR; consulta de anuncios Binance P2P USDT/VES en dirección BUY/SELL; filtros y media de anuncios; timestamp/rango/cantidad. Se actualizó `src/index.js` con lectura `GET /api/exchange-rates/latest` y tarea programada de persistencia. `wrangler.jsonc` define cron cada 30 minutos.
- Pruebas de fuente reales desde el equipo: BCV HTML HTTP 200, tamaño 153636 bytes y parser extrajo USD 875.6505 y EUR 980.61472543 para fecha publicada “Viernes, 09 Octubre 2026”. Binance P2P respondió con `data.items`; muestra BUY media 1018.71128571 (7 anuncios) y SELL media 1014.091625 (8 anuncios). Valores puntuales, no datos persistidos ni cotizaciones garantizadas.
- Suites tras los cambios: Python 57/57 PASS; `python -m compileall -q app tests` PASS; Node 25/25 PASS; comprobación sintáctica del Worker/adaptador/tests PASS.
- Estado: migración aplicada solo en D1 local. No hay despliegue ni D1 remoto. El cron está configurado pero no activo en producción. El selector de tasas no está conectado a la UI ni a los motores de costos/precios; falta autenticación y aprobación operativa.
- Riesgos: endpoint P2P no garantizado como API estable; hay que monitorizar cambios de esquema, no publicar datos antiguos como actuales, mostrar dirección BUY/SELL y conservar la ventana de frescura. Ver D-018.

### 2026-10-09 — Aclaración de prueba end-to-end del cron local

- Wrangler indicó que los eventos programados no se disparan solos en desarrollo local; se usó el endpoint local documentado `/cdn-cgi/local/scheduled`.
- Resultado: el trigger respondió HTTP 200 y persistió en D1 local las observaciones Binance P2P BUY/SELL. `GET /api/exchange-rates/latest` devolvió ambas direcciones.
- La captura BCV falló desde el runtime local de Workers con error interno de fetch. La lectura directa por PowerShell de Windows obtuvo HTTP 200 y el parser extrajo USD/EUR del HTML real. No se desactivó TLS ni se usó un proxy de terceros. Estado correcto: BCV parser PASS; BCV fetch desde Worker BLOCKED; Binance consulta/persistencia local PASS.
- Se corrigió el criterio de aceptación en PLAN MAESTRO y D-018. Pendiente: encontrar un fetch compatible con el runtime objetivo o diseñar un recolector BCV separado autenticado. No desplegar todavía.
- El proceso Wrangler y los procesos hijos `workerd.exe` identificados se terminaron; una comprobación posterior confirmó `PORT_8791_CLOSED`.


### 2026-10-09 — Previsualización UI de tasas

- Se añadieron a Configuración dos selectores independientes (costos y precio de venta), lectura del endpoint `/api/exchange-rates/latest`, preferencia BCV EUR/VES si existe, detalle de fuente/antigüedad y conversión de ejemplo a VES. El conversor valida valores y redondea explícitamente a centavos.
- No es persistencia de políticas: el estado vive en memoria, no altera el motor de costos/precios y no autoriza operaciones. Se añadió advertencia visual. No hay autenticación ni API de mutación.
- La lectura de API local devolvió dos observaciones Binance P2P frescas en D1 local. BCV sigue sin persistir por error de fetch en runtime local. No se hizo deploy.


### 2026-10-09 — Fallback BCV validado localmente

- Se documentó `https://bcv.today/api/v1/rate.json` como respaldo cuando el fetch directo a `https://www.bcv.org.ve/` falla dentro de workerd. Es un espejo no oficial, no un endpoint oficial del Banco Central; expone tasas USD/EUR y fecha efectiva/actualización según su documentación pública. Fuente de referencia: https://bcv.today/api/.
- El fallback valida tasas positivas y fecha efectiva, guarda URL y notas de procedencia, y el endpoint calcula la frescura usando `mirror_updated_at`. La UI lo etiqueta explícitamente como espejo no oficial. Se rechaza el dato como fresco si falta timestamp o supera 36 horas.
- Smoke test local de la tarea programada: HTTP 200, persistencia de BCV USD/EUR y Binance P2P BUY/SELL. No es un despliegue ni prueba del cron productivo.


### Cierre de validación final — 2026-10-09

- Python: 57/57 PASS; `python -m compileall -q app tests` PASS. Node: 28/28 PASS; `node --check` de Worker, adaptador, tests y script inline de UI PASS.
- Prueba de extremo a extremo local tras los últimos cambios: `GET /cdn-cgi/local/scheduled` HTTP 200; `GET /api/exchange-rates/latest` respondió `status=ok` con 4 observaciones: BCV USD/EUR por espejo no oficial y Binance P2P BUY/SELL. D1 sigue siendo local.
- Valores de muestra al momento de la prueba (solo evidencia temporal): BCV USD 875.6505 VES/USD, EUR 980.61472543 VES/EUR; Binance P2P BUY 1006.79971429 y SELL 1010.60011111 VES/USDT. No fijar como tasas actuales permanentes.
- Wrangler/workerd se detuvo y se verificó `PORT_8791_CLOSED`. Sin despliegue, sin D1 remoto, sin commit/push.


### 2026-10-09 — Endurecimiento básico de respuestas API y contrato de identidad

- Se repitió la validación base antes del cambio: Python 57/57 PASS; `python -m compileall -q app tests` PASS; Node 28/28 PASS; `node --check` del Worker, adaptador y tests PASS.
- En `spikes/cloudflare-d1/src/index.js`, el helper JSON ahora añade `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` y `Referrer-Policy: no-referrer`. Se añadió prueba automatizada de estas cabeceras. Es hardening básico, no autenticación ni autorización.
- Se creó `docs/decisiones/D-019_SEGURIDAD_IDENTIDAD_Y_PERMISOS.md` con el contrato de identidad, roles propuestos, validación de JWT si se elige Cloudflare Access, auditoría, aprobación, manejo de secretos y criterios de aceptación previos a endpoints mutables.
- Se recomienda evaluar Cloudflare Access como primera opción para uso interno, sujeto a que el usuario configure y apruebe los recursos requeridos. No se configuró proveedor de identidad, no se crearon recursos remotos, no se desplegó ni se añadieron rutas de escritura.
- Pendiente: correr la suite tras los cambios, actualizar los totales con el resultado real y corregir cualquier fallo. Mantener la UI como previsualización sin persistencia operativa hasta cerrar autenticación/autorización y auditoría.


### Corrección y resultado de validación posterior — 2026-10-09

- La primera ejecución posterior al hardening falló porque la expresión regular añadida al test quedó escapada incorrectamente. Se cambió por una comprobación directa del prefijo `application/json`; no se ocultó el fallo inicial.
- Validación final tras la corrección: Python 57/57 PASS; `python -m compileall -q app tests` PASS; Node 29/29 PASS; `node --check src/index.js`, `src/exchange-rates.js` y `tests/worker.test.js` PASS. El proceso combinado terminó con código 0 (`ALL_LOCAL_CHECKS_PASS`).
- La prueba nueva confirma `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` y content-type JSON. No se inició servidor ni se creó recurso remoto.


### 2026-10-09 — Hallazgo de integridad: impedir reactivación de políticas retiradas

- Durante la revisión de las migraciones se detectó que una política en estado `retired` podía volver a `active` mediante UPDATE, reutilizando una versión histórica. Esto contradecía el contrato de versionado, aunque no había endpoint API para hacerlo.
- Se creó `spikes/cloudflare-d1/migrations/0008_no_policy_reactivation.sql`, con triggers terminales para `product_pricing_policies` y `exchange_rate_policies`. Cualquier cambio debe crear una nueva versión, con nueva aprobación.
- Se añadieron dos pruebas en `tests/test_schema.py`: `test_retired_pricing_policy_cannot_be_reactivated` y `test_retired_exchange_rate_policy_cannot_be_reactivated`. Suite completa tras el cambio: Python 59/59 PASS; compileall PASS; Node 29/29 PASS; comprobaciones sintácticas del Worker/adaptador/tests PASS.
- Se aplicó `npx wrangler d1 migrations apply yogurt-d1-spike --local`; Wrangler indicó recurso local y no se usó `--remote`. Ejecutó correctamente las migraciones 0006–0008. Consulta posterior confirmó 18 observaciones de tasas locales, 0 políticas de precio, 0 políticas de tasas y ambos triggers nuevos. No se borraron observaciones ni se añadieron datos de negocio.
- Se actualizaron `D-016`, `D-018`, índice de documentación, README del spike, plan maestro y handoff. No se desplegó ni se creó D1 remoto.


### 2026-10-09 — Migración 0009: inmutabilidad de snapshots CPP y mermas

- En revisión de esquema se encontró que los movimientos de inventario, auditoría, consumos/salidas y políticas ya tenían controles de inmutabilidad, pero los snapshots de costo ponderado de ingredientes/productos y los registros de merma por lote no estaban cubiertos.
- Se creó `0009_immutable_cost_snapshots_and_losses.sql` con triggers para bloquear UPDATE/DELETE en `inventory_cost_snapshots`, `finished_cost_snapshots` y `batch_losses`.
- Se agregaron tres pruebas que verifican UPDATE y DELETE rechazados en las tres tablas. La suite Python tras el cambio reportó 62 tests OK; pendiente completar la ejecución Node/sintaxis y aplicar la migración local tras validar todo.
- Esta es una protección de integridad a nivel de esquema; no implementa autenticación, auditoría transaccional ni endpoints de escritura.


### Resultado final de migración 0009 — 2026-10-09

- Validación final: Python 62/62 PASS, compileall PASS, Node 29/29 PASS, `node --check` del Worker/adaptador/tests PASS; exit code 0.
- Se aplicó 0009 en D1 local. Una consulta a `sqlite_master` confirmó los seis triggers de inmutabilidad en snapshots CPP de ingredientes, snapshots CPP de productos y mermas por lote.
- No se usó `--remote`, no se creó recurso remoto y no se cambiaron observaciones de tasas ni datos de negocio.


### 2026-10-09 — Migración 0010: congelar recetas aprobadas

- Hallazgo de auditoría: `recipe_versions` y `recipe_lines` podían editarse después de aprobar una receta, alterando retrospectivamente la composición usada como evidencia de producción/costos.
- Se creó `0010_immutable_approved_recipes.sql`: receta aprobada inmutable salvo transición a retirada sin cambios de campos; retirada terminal; recetas aprobadas/retiradas no se borran; las líneas solo se modifican mientras la receta está en borrador; aprobación requiere `approved_by` y `approved_at`.
- Se añadieron tres pruebas específicas. Python 65/65 PASS y `compileall` PASS. Pendiente resultado final Node/sintaxis y aplicación/verificación de migración local.


### Resultado final de migración 0010 — 2026-10-09

- Validación final: Python 65/65 PASS, compileall PASS, Node 29/29 PASS y comprobaciones `node --check` PASS; exit code 0.
- Migración 0010 aplicada solo a D1 local. Consulta `sqlite_master` confirmó los siete triggers de aprobación/inmutabilidad de recetas y líneas.
- No se añadieron recetas ni datos de negocio; no se usó `--remote` y no se desplegó.


### 2026-10-09 — Migración 0011: cierre de lotes y reversos de movimientos

- Se creó `0011_production_batch_finalization_and_movement_reversals.sql` después de encontrar que los lotes completados aún podían editarse y que el esquema no validaba rigurosamente los reversos.
- La migración impone transiciones permitidas de estado, bloquea actualización/eliminación de lotes completados o cancelados, prohíbe eliminar lotes y limita la inserción de consumos, salidas y mermas a lotes en curso. Los movimientos de inventario de insumos y productos terminados requieren reversos exactos y como máximo uno por original.
- Se añadieron siete pruebas a `tests/test_schema.py`; también se ajustó la prueba previa de merma para crearla con el lote en curso, que es el estado permitido.
- La primera ejecución dirigida de esquema detectó ese ajuste pendiente en la prueba antigua; se corrigió. Validación integral posterior: Python 72/72 PASS, compileall PASS, Node 29/29 PASS, checks sintácticos del Worker/adaptador/tests PASS. Resultado final `ALL_LOCAL_CHECKS_PASS`.
- Wrangler aplicó 0011 en D1 local (11 comandos SQL); no se usó `--remote`. No se crearon recursos externos ni se añadieron datos comerciales.
- Riesgo pendiente: no se ha implementado el servicio que valide saldo no negativo y escriba movimiento, CPP/snapshot y auditoría en una única transacción. Tampoco existe autenticación/RBAC; D-019 sigue bloqueando cualquier endpoint mutable.


### 2026-10-09 — Migración 0012: bloquear existencias negativas

- Se creó `0012_prevent_negative_inventory_balances.sql` con triggers para evitar saldos negativos agregados por insumo/ubicación/moneda, negativos por lote específico y negativos de producto terminado por presentación/ubicación/moneda. Se añadieron índices de soporte.
- Se añadieron tres pruebas a `tests/test_schema.py`. La primera ejecución completa detectó dos pruebas de reverso que chocaban correctamente con la nueva regla de saldo negativo antes de llegar al trigger de reverso; se ajustaron los escenarios para mantener existencias suficientes y probar cada invariante aisladamente.
- Resultado integral posterior: Python 75/75 PASS; `compileall` PASS; Node 29/29 PASS; checks sintácticos de Worker/adaptador/tests PASS; `ALL_LOCAL_CHECKS_PASS`.
- Wrangler aplicó la migración a D1 local. Verificación posterior PASS: los tres triggers de saldo no negativo aparecen en `sqlite_master` y `wrangler d1 migrations list ... --local` indica que no quedan migraciones pendientes.
- Pendiente crítico: servicio transaccional que agrupe movimiento, CPP/snapshot y auditoría; identidad/RBAC aún no implementados. No crear endpoints de escritura ni desplegar.


### 2026-10-09 — Migración 0013: saldo físico independiente de moneda

- Revisión posterior a 0012 detectó que filtrar la suma de cantidades por moneda del costo era conceptualmente incorrecto: el inventario físico no se divide por USD/VES.
- Se creó `0013_stock_balance_is_currency_independent.sql` para eliminar y recrear los triggers de saldo sin filtro de moneda, corregir índices y añadir soporte para balance por lote. El ledger histórico no se modifica.
- Se agregaron dos pruebas que rechazan sobreconsumo entre monedas para insumos y producto terminado. Suite final: Python 77/77 PASS; compileall PASS; Node 29/29 PASS; checks sintácticos PASS; `ALL_LOCAL_CHECKS_PASS`.
- Wrangler aplicó 0013 a D1 local (12 comandos). Consulta confirmó los tres triggers y la lista de migraciones indica que no quedan pendientes. Sin `--remote`, despliegue ni datos comerciales.
- La valoración CPP todavía necesita una regla explícita de moneda y conversión histórica; esta corrección solo resuelve el saldo físico. Siguiente tarea: diseñar transacción atómica/idempotente para movimiento, CPP/snapshot y auditoría. Auth/RBAC sigue pendiente.
