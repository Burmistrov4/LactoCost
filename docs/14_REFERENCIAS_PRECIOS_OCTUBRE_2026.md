# Investigación de precios y restricciones de despliegue — 09/10/2026

## Alcance y calidad

Esta captura añade referencias públicas observadas o publicadas recientemente. No equivale a un levantamiento presencial completo ni a cotizaciones B2B. No se contactó a tiendas, productores ni proveedores. Cada precio debe guardarse con fecha, canal, ubicación, formato, moneda y evidencia antes de usarlo en una decisión.

## Materias primas: leche en polvo

| Producto/referencia | Ventana publicada | Mínimo observado | Mediana | Promedio | Valencia | Calidad/limitación |
|---|---|---:|---:|---:|---:|---|
| San Simón completa 400 g | 31 ago–6 sep 2026 | $4,48 nacional | $6,78 nacional | $6,97 nacional | 5 tiendas; mediana local $7,57 | Comparador de precios de tiendas/farmacias, no mayorista ni cotización directa |
| La Campiña polvo 400 g | 14–20 sep 2026 | $4,29 nacional | $6,95 nacional | $7,03 nacional | 6 tiendas; mediana local $7,08 | Comparador; hay variación fuerte entre comercios |
| Upaca completa 400 g | 14–20 sep 2026 | $4,86 nacional | $4,94 nacional | $5,95 nacional | no se publicó mediana local en extracto | Solo 5 tiendas; media afectada por dispersión |
| La Pradera completa 500 g | 14–20 sep 2026 | $6,02 nacional | $7,20 nacional | $7,26 nacional | 4 tiendas; mediana local $7,20 | Comparador, formato distinto |

Fuentes:
- https://ahorrayya.com/precios/leche-en-polvo-san-simon-completa-400g/
- https://ahorrayya.com/precios/leche-la-campina-pvo-400g/
- https://ahorrayya.com/precios/leche-completa-en-polvo-upaca-400g/
- https://ahorrayya.com/precios/leche-completa-en-polvo-la-pradera-500g/

**Uso correcto:** son referencias minoristas por marca/formato, no una canasta homogénea de leche en polvo industrial. Para CPP, se registra cada SKU separado. No mezclar marcas ni presentaciones como si fueran un único precio sin normalizar gramos, composición y aptitud para receta.

## Huevos: referencia histórica local

Diario La Calle publicó el 26/01/2026 que en algunos mercados/negocios de Valencia se conseguía medio cartón de 15 huevos a $2,65, otras marcas a $3,25 y caja de 30 a $6,49. Es una observación de enero, no precio vigente de octubre ni precio mayorista confirmado.

Fuente: https://lacalle.com.ve/medio-carton-de-huevos-se-puede-conseguir-en-2-65-en-algunos-mercados-de-valencia/

## Quesillo

Farmatodo muestra en la ficha consultada Cremosillo tradicional de 150 g a Bs. 2.484,00 y el producto relacionado de 230 g a Bs. 3.717,00 (la captura anterior de 230 g tenía otro precio; esta discrepancia confirma que hay que volver a verificar el carrito y la zona de entrega al momento de compra).

Fuente: https://www.farmatodo.com.ve/producto/111914233-quesillo-cremosillo-tradicional-150gr

No usar este precio para estimar el costo de fabricación de quesillo artesanal. Es un producto de marca, retail, y la ficha puede mostrar precios dinámicos por zona/fecha. No existe aún muestra suficiente de ventas artesanales locales con peso neto y precio verificable para calcular una media representativa.

## Envases

Aún no se dispone de cotización pública comparable de envases alimentarios para Valencia con material, capacidad, tapa, sello, aptitud térmica, MOQ y flete confirmados. La referencia anterior de marketplace (50 unidades por $15, $0,30/unidad) queda como observación no verificada y no como mejor precio de mercado. Debe compararse costo por unidad utilizable incluyendo tapa, sello, etiqueta, transporte y pérdidas.

## Permisos sanitarios: avance documental, pendiente de confirmación oficial

Se encontró una copia secundaria de la Providencia Administrativa 165/2016 relativa a alimentos artesanales, que describe permiso sanitario del establecimiento y registro sanitario del producto, además de condiciones higiénico-sanitarias y rotulado. También se encontró material de requisitos de registro de alimentos nacionales atribuido al SACS. Las copias consultadas no sustituyen la confirmación de vigencia ni la instrucción actual de la autoridad competente.

Fuentes secundarias para ubicar la normativa:
- https://es.scribd.com/document/539753666/Providencia-Administrativa-165-2
- https://safeintl.com/normas-reglamentos-y-documentos-de-interes-para-la-industria-de-alimentos/
- https://www.scribd.com/document/770893988/1-Registro-Sanitario-de-Alimentos-Nacionales-julio2024

Fuente normativa general primaria:
- https://www.wipo.int/wipolex/es/legislation/details/4007

**Pendiente obligatorio:** confirmar con SACS/Contraloría Sanitaria de Carabobo qué trámite vigente corresponde exactamente a producción de yogur y quesillo, clasificación artesanal o industrial, permiso del establecimiento, registro por producto, análisis requeridos, rotulado, cadena de frío y venta a comercios. No fabricar para venta hasta aclarar y cumplir lo aplicable.

## Render: corrección importante para el presupuesto

La documentación oficial de Render indica que los servicios web gratuitos se suspenden tras 15 minutos sin tráfico y pierden cambios en su filesystem local al reiniciar, desplegar o suspenderse. Más importante: **Render Postgres gratuito vence a los 30 días**, tiene 1 GB y no incluye backups administrados ni recuperación PITR. Por tanto, no se debe describir la combinación gratuita como una solución de producción persistente.

Fuente oficial: https://render.com/docs/free

Decisión de arquitectura:
- Desarrollo: Flask + SQLite local permitido.
- Prueba temporal: Render free puede servir para prototipo no crítico con datos desechables, exportaciones manuales y fecha de expiración visible.
- Producción real: elegir Postgres de pago u otra base persistente aprobada y calcular el costo mensual total antes del lanzamiento; el backend puede usar un plan gratuito solo si se aceptan sus restricciones de suspensión y latencia.
- La app debe alertar si no existe backup probado o si la base tiene fecha de expiración.
- No desplegar inventario/finanzas reales en Postgres gratuito de 30 días sin un plan de migración y respaldo validado.

## Próxima investigación prioritaria

1. Levantar al menos 10 precios comparables de yogur por estilo, marca, gramos/ml y canal, separando natural, saborizado, griego y bebible.
2. Levantar 10–15 precios de quesillo artesanal local con peso neto, tamaño, fecha, canal y evidencia.
3. Cotizar empaques por 100/500/1.000/5.000 unidades y calcular costo entregado por unidad.
4. Obtener al menos dos fuentes por ingrediente clave y al menos una cotización directa por volumen cuando el usuario autorice contacto.
5. Construir CPP con datos de ejemplo claramente marcados; no usar estimaciones como precios confirmados.


## Corrección de calidad de fuente tras apertura directa (09/10/2026)
Al abrir directamente algunas páginas, se detectaron discrepancias entre el resumen del buscador y el contenido accesible de la ficha. La página de San Simón 400 g muestra ahora un encabezado de semana del 27 de julio al 2 de agosto de 2026 y mediana Valencia $7,03 (4 tiendas), mientras que el resumen indexado devolvía otra ventana y valor. Farmatodo muestra en su página abierta Bs. 340,00 para Cremosillo 150 g, mientras que el resumen indexado anterior devolvía Bs. 2.484,00. Esto demuestra que las cifras pueden variar por caché, ubicación, fecha o estado del catálogo.

**Regla actualizada:** no tratar estos valores concretos como precio vigente confirmado hasta volver a consultar en la tienda con la ciudad de entrega seleccionada y registrar fecha/hora, captura y disponibilidad. En el análisis comparativo se conservará la discrepancia como observación de calidad de datos y no se mezclará con precios mayoristas ni se usará para cerrar la rentabilidad.
Fuentes consultadas: https://ahorrayya.com/precios/leche-en-polvo-san-simon-completa-400g/ ; https://www.farmatodo.com.ve/producto/111914233-quesillo-cremosillo-tradicional-150gr.
