# Modelo de costos — yogur

## Estado
Modelo estructural, no receta comercial ni cotización final. Todos los valores futuros deben guardar fuente y fecha.

## Segmentos a evaluar
Natural firme, natural batido, bebible, endulzado/frutal, griego/concentrado, alto en proteína o sin azúcar añadida solo si formulación/claims están justificados. Formatos individuales, familiares y gastronómicos. No lanzar toda la gama de una vez.

## Variables por lote
- Volumen/tipo de leche: cruda, pasteurizada, UHT o reconstituida.
- Costo entregado y pérdidas de recepción.
- Sólidos adicionales, leche en polvo o crema.
- Cultivo, cepa, dosificación, lote y costo por tanda.
- Azúcar, fruta/pulpa, saborizantes y estabilizantes permitidos.
- Agua, energía, calentamiento/enfriamiento y limpieza.
- Mano de obra, depreciación, mantenimiento y control de calidad.
- Envase, tapa, sello, etiqueta, lote/fecha y caja.
- Rendimiento real, unidades rechazadas, derrames, muestras y no vendidos.
- Cadena de frío, entrega, comisiones, descuentos, impuestos y costos de cobro.

## Fórmulas
- Costo ingredientes = suma de cantidad usada × costo unitario entregado.
- Empaque unitario = envase + tapa + sello + etiqueta + parte de caja.
- Costo completo del lote = ingredientes + trabajo + energía/agua + limpieza + empaque + control de calidad + frío + transporte + costos indirectos.
- Unidades vendibles = producidas − rechazadas − pérdidas − muestras no facturadas.
- Costo por unidad vendible = costo completo / unidades vendibles.
- Contribución unitaria = precio neto recibido − costo unitario − costos variables del canal.
- Margen de contribución = contribución / precio neto recibido.

## Ingeniería inversa inicial
NADBIO publicó US$0,71/L como promedio nacional de leche cruda a puerta de corral el 04-09-2026. No es cotización local ni equivale a leche pasteurizada. Una referencia de envases de 200 ml por 50 unidades a US$15 equivale a US$0,30 por envase o US$1,50 por litro si se usan cinco envases, antes de tapa/sello/etiqueta/flete. Sirve para ilustrar sensibilidad, no como costo final.
Fuentes: https://nadbio.com/datos/ y búsqueda de envases en https://www.mercadolibre.com.ve/

## Escenarios
- Conservador: insumos/envases más caros, menor rendimiento, mayor merma, menor precio y ventas lentas.
- Base: cotizaciones vigentes y rendimiento medido.
- Optimista: solo descuentos/rendimientos respaldados.
- Sensibilidad: leche, cultivo, envase, energía, merma, volumen y precio.
- Comparar fabricar vs revender, venta detallista vs mayorista y formato individual vs familiar.

## Seguridad y pruebas
Antes de vender, validar proceso con asesoría técnica, higiene, temperaturas y mediciones documentadas. No asignar vida útil por intuición ni copiar fechas de competidores.


## CPP obligatorio para la aplicación
Los ingredientes y empaques se valorarán con el método de inventario seleccionado y documentado; el método operativo propuesto es CPP móvil tras cada recepción. Una receta consumirá cantidades normalizadas al CPP vigente de cada insumo y guardará un snapshot de costos para el lote, sin que futuras compras cambien silenciosamente el costo histórico. Ver `12_COSTO_PROMEDIO_PONDERADO.md`.


## Cultivo y empaque: nuevas referencias, no cotizaciones
Ver `16_REFERENCIAS_CULTIVOS_ENVASES.md`: existen publicaciones con precios nominales de cultivo para 50 L y 500 L, y envases de aluminio para postres. No deben incorporarse como costos confirmados hasta validar SKU, dosis, conservación, vencimiento, aptitud alimentaria, flete y disponibilidad. En lotes pequeños, un cultivo sobredimensionado puede aumentar el costo útil por desperdicio.
