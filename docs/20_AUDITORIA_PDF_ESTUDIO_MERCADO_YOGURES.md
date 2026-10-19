# Auditoría crítica del PDF «Estudio de Mercado de Yogures en Valencia»

**Archivo revisado:** `Estudio de Mercado de Yogures en Valencia.pdf`  
**Ubicación:** raíz del proyecto.  
**Extensión:** 19 páginas.  
**Fecha de revisión:** 2026-10-09.  
**Estado:** leído y auditado; no se asumen correctas sus cifras sin validación independiente.

## 1. Qué contiene el PDF

El documento compila una respuesta generada en Gemini a varias instrucciones del usuario y una cadena de recálculos posteriores. Incluye:
- hipótesis de precios y formatos para yogur en Valencia;
- una receta/costo hipotético de 10 litros;
- posibles zonas de proveedores y canales;
- recomendaciones de consignación, cobro y reinversión;
- datos de compras reales reportados por el usuario para yogur, quesillo y torta de pan;
- estimaciones de sobrantes, costo unitario y precios sugeridos;
- varias versiones contradictorias del costo, con conversiones USD/EUR/bolívares.

**Interpretación:** es un documento de trabajo y una fuente de los datos aportados por el usuario, no un estudio de mercado verificado. La primera sección contiene afirmaciones locales y márgenes sin referencias comprobables en el propio PDF. Los costos deben recalcularse desde las compras, consumos, unidades, rendimiento real y tasas documentadas.

## 2. Datos del usuario que conviene conservar como registros de origen

Estos son datos declarados en el documento, no cotizaciones verificadas externamente:

- 01/10/2026: azúcar Majaguas 2 kg por Bs 2.546,12; canela 250 g por Bs 1.597; 20 envases triangulares por Bs 825,76; cartón de 30 huevos por US$5,80; 6 L de leche por Bs 6.000; utensilio «miserable» por Bs 2.477; molde quesillera por Bs 4.051,45.
- 03/10/2026: yogur natural Yoka griego 170 g por Bs 2.439,84; leche en polvo La Campiña 200 g por Bs 3.842,74.
- 07/10/2026: fresa 500 g por Bs 1.000, de los cuales 385 g se usaron y 115 g se descartaron; tres limones por Bs 750; una piña por Bs 900; bolsa de pan por US$1,40; margarina anotada por Bs 2.107,44, pero no queda completamente claro si ese precio corresponde al paquete entero o a la cantidad de 80 g usada.
- Inventario/consumo informado: yogur, 3 L de leche, 200 g de leche en polvo, el pote completo de Yoka como iniciador (si efectivamente se utilizó completo), mermeladas con 385 g de fresa, 400 g de piña, 193 g y 200 g de azúcar respectivamente, y medio limón en cada mermelada; quesillo con 12 huevos, 650 g de azúcar, media cucharadita de canela y 8 envases triangulares; torta de pan con 2 L de leche, 5 huevos, 15 panes, una cucharada de vainilla, media cucharadita de canela, 80 g de margarina y 8 envases triangulares.
- El documento dice que quedaban 18 huevos después de la compra/primer uso. Si después se consumieron otros 5 para la torta, el saldo teórico sería 13; hay que confirmar el conteo físico actual.
- Los envases cuadrados ya estaban en inventario. Se desconoce su costo histórico y no existe evidencia en el PDF que confirme el precio de reposición de US$0,13/unidad.
- El aluminio y la vainilla ya estaban disponibles antes de estas tandas; para costeo se necesita su costo y cantidad real del rollo/botella, pero no debe contabilizarse otra vez el desembolso completo en esta tanda.

## 3. Errores y contradicciones detectados

### 3.1 No hay un costo único y consistente para cada producto

El yogur aparece con:
- total de lote US$15,714 y aproximadamente US$1,05 por unidad, al incluir envases cuadrados estimados a US$0,13 y US$0,50 de energía/frío;
- total de lote US$13,26 y US$0,88 por unidad, al excluir esos dos conceptos.

Ambos resultados corresponden a supuestos diferentes; el PDF no los presenta siempre como escenarios claramente separados. El costo real debe informar qué conceptos incluye y distinguir **costo de desembolso histórico**, **costo de inventario consumido** y **costo de reposición**.

El quesillo aparece con un lote de US$4,963 (incluye 500 ml de leche, vainilla, aluminio y US$0,60 de gas), pero el recálculo posterior lo reduce a US$3,75 excluyendo la leche y algunos consumibles. La receta declarada inicialmente por el usuario no enumeraba esos 500 ml de leche; no se pueden agregar ni quitar sin confirmar la receta realmente ejecutada.

La torta de pan aparece con lote de US$6,473 y luego US$5,88. La diferencia principal parece derivarse de conceptos y empaques distintos, no de una nueva medición del lote. Debe reconstruirse una única ficha de costo con componentes marcados incluidos/excluidos.

### 3.2 Tasas y fechas mezcladas

El PDF usa tasas USD distintas por fecha de compra para convertir costos históricos, pero luego utiliza una tasa EUR distinta para simular precios de venta y otra tasa USD para expresar el ingreso. Eso solo puede compararse si se registra explícitamente cada fecha, fuente y propósito de la tasa. Las tasas históricas citadas por el PDF **no han sido verificadas en este documento** y no deben asumirse como tasas oficiales confirmadas.

No convertir todo a euros para después restar costos en dólares sin una regla de conversión explícita. Para la contabilidad interna:
1. guardar el monto original y la moneda;
2. convertir cada compra a USD con la tasa histórica documentada para esa compra, como pide la estrategia del usuario;
3. conservar el costo USD histórico de los insumos consumidos;
4. calcular el precio de venta en EUR usando la tasa EUR que esté verificada y vigente en la fecha de venta;
5. convertir los cobros en Bs y, si se necesita comparar, expresarlos en USD usando la tasa USD de esa misma fecha;
6. mostrar por separado el margen de operación y el efecto de conversión monetaria. No llamar “ganancia cambiaria” a una diferencia de referencia que no se haya realizado.

La razón `980,61472543 / 875,65 - 1 ≈ 11,99%` es una diferencia matemática entre las dos tasas citadas en el PDF, no una ganancia neta garantizada. Hay que verificar que ambas tasas correspondan a la misma fecha y al instrumento de referencia correcto.

### 3.3 Inconsistencias de unidades, compras y consumos

- El costo de leche indicado es Bs 6.000 por 6 L, por tanto Bs 1.000/L. Los 3 L usados en yogur representan Bs 3.000 y los 2 L de torta representan Bs 2.000; queda 1 L nominal antes de otras mermas/consumos. No debe confundirse el costo de 3 L con el costo de 6 L.
- Para huevos, el cartón de 30 a US$5,80 implica US$0,19333 por huevo, si realmente contenía 30 unidades. Doce huevos asignados al quesillo cuestan US$2,32; cinco a la torta, US$0,9667. Debe conciliarse el saldo físico.
- Las fresas: si se pagaron Bs 1.000 por 500 g, los 385 g aprovechables no deben valorarse como si los 115 g dañados fueran gratuitos. Para costo de producción, el costo de adquisición se distribuye sobre el rendimiento aprovechable: costo por gramo utilizable = Bs 1.000 / 385 g, si el descarte ocurrió antes de la producción y no existe valor recuperable.
- La cantidad de azúcar en torta (250 g) es una estimación del PDF; el usuario no había precisado esa cantidad en la lista inicial. Debe confirmarse o etiquetarse como supuesto.
- La cantidad de vainilla de 15 ml, el precio de una botella de 1 L por Bs 1.500, el costo del aluminio por 30 cm y el costo del gas/frío son aproximaciones sin medición completa.
- La nota de margarina mezcla “80 g usados” con “Bs 2.107,44” sin confirmar claramente el peso total del paquete. El PDF supone un envase estándar de 500 g; no usarlo como hecho hasta confirmarlo.
- Los 15 envases cuadrados no deben costearse como desembolso nuevo, pero sí registrar un costo histórico si se conoce o una estimación de reposición etiquetada como tal. El valor de US$0,13 por unidad no está sustentado por una cotización adjunta.

### 3.4 Ventas y “ganancia neta” están sobreestimadas o mal etiquetadas

El PDF resta costos de ingredientes/empaques estimados al ingreso convertido y llama al resultado “ganancia neta” o “dinero limpio”. No ha demostrado que incluya:
- mano de obra propia;
- gas/energía con medición o regla estable;
- agua, limpieza y sanitización;
- refrigeración y transporte;
- comisión de comercios/consignación, unidades no vendidas, devoluciones y deterioro;
- costos sanitarios, etiquetado, impuestos y costos fijos.

Por tanto, lo máximo que esos cálculos pueden representar es **margen bruto o contribución preliminar bajo supuestos**, no ganancia neta. También se confunden porcentaje sobre costo (markup/ROI) con margen sobre ventas. Deben presentarse como indicadores separados.

Los precios al detal y de reventa sugeridos (por ejemplo, quesillo €2,00, yogur €1,80 y torta €1,40) no están respaldados por una muestra local suficiente ni una prueba de demanda. No se consideran precios recomendados definitivos. Para reventa hay que calcular simultáneamente el precio cobrado por el productor, el precio final y el margen real del comercio.

### 3.5 Afirmaciones de mercado no demostradas

El PDF declara, sin datos de muestra citados, que ciertos formatos concentran 70% de las ventas en Flor Amarillo, que se pueden obtener descuentos mayoristas de 30–40%, que proveedores específicos venden los empaques mencionados, que el pago en moneda dura garantiza 5–10% de descuento y que el yogur con fruta cocida dura 21–30 días. Estas afirmaciones no deben trasladarse al plan como hechos.

La recomendación de reutilizar cultivo de una tanda anterior (“backslopping”), vender lactosuero o prometer vida útil extendida no debe implementarse sin validación técnica, controles sanitarios y confirmación regulatoria. El cultivo, el proceso térmico, la contaminación cruzada, el pH, el envasado y la cadena de frío afectan la inocuidad. No fijar vida útil comercial sin validación del proceso y pruebas pertinentes.

### 3.6 Recomendación financiera riesgosa

La regla “cero bolívares al cierre” y convertir excedentes a USDT/P2P no debe tratarse como universal ni libre de riesgo. Hay que mantener liquidez para pagos, reposición y emergencias, verificar comisiones, legalidad, riesgo de contraparte, tipo efectivo de conversión y disponibilidad de fondos. No usar una distribución automática 60/20/20 sin flujo de caja real y obligaciones registradas.

## 4. Método de recálculo que se adoptará

Para cada tanda y producto:
1. **Ficha de fuente:** cantidad comprada, monto pagado, moneda, fecha, tasa y fuente de tasa.
2. **Costo unitario de inventario:** costo de compra dividido entre cantidad neta comprada; en productos dañados, registrar por separado cantidad descartada y costo de merma.
3. **Consumo real:** cantidad efectivamente incorporada a la receta, con conversión de unidades documentada.
4. **Empaque:** usar costo histórico cuando se conoce y costo de reposición como indicador separado cuando no se conoce.
5. **Rendimiento vendible:** unidades reales y peso neto por unidad; no asumir ocho o quince unidades sin confirmación física.
6. **Costo del lote:** materias primas + empaques + energía/frío/limpieza + mano de obra + otros costos documentados. Las estimaciones deben aparecer como escenario y no como dato observado.
7. **Precio:** definir precio de venta en EUR a tasa EUR verificada en la fecha de venta; calcular equivalente en Bs y valor equivalente USD usando tasa USD de esa misma fecha.
8. **Resultado:** margen bruto, contribución, margen sobre ventas, markup sobre costo y ganancia neta estimada con sus exclusiones claramente visibles.
9. **Conciliación de inventario:** saldo inicial + compras − consumos − mermas = saldo final. Comparar con conteo físico.
10. **Sensibilidad:** mostrar precio mínimo bajo escenarios de merma, costo de reposición, canal y unidades no vendidas.

## 5. Prioridad inmediata para corregir el modelo

Antes de declarar el costo definitivo, confirmar:
- tasa USD BCV y tasa EUR BCV exactas para cada fecha de compra/venta usada;
- si la receta de quesillo incluye leche y cuánta;
- peso total del paquete de margarina por Bs 2.107,44;
- si se consumió completo el yogur Yoka de 170 g;
- gramos de azúcar realmente usados en la torta;
- rendimiento real y peso neto de cada producto;
- precio de reposición de envases cuadrados con una fuente fechada;
- si las ocho unidades de cada postre se llenaron con porciones comparables;
- costos reales o prorrateo transparente de gas, frío, agua, limpieza, mano de obra y entrega;
- conteo físico actual de huevos, leche, azúcar, envases, frutas, aluminio y vainilla.

Hasta confirmar estos puntos, las cifras del PDF se mantienen como **escenarios provisionales, no como contabilidad final ni prueba de rentabilidad**.

## 6. Referencia al archivo original

El PDF se conserva intacto en la raíz del proyecto. Este informe no reemplaza el original: registra sus contradicciones y define el procedimiento para corregirlas sin borrar los datos aportados por el usuario.


## 7. Contraste externo de tasas de cambio (consulta del 09/10/2026)

Se hizo un contraste web adicional después de leer el PDF. Dos páginas secundarias que presentan históricos atribuidos al BCV coinciden en estos valores redondeados:

| Fecha valor | USD (Bs/USD) | EUR (Bs/EUR) | Observación |
|---|---:|---:|---|
| 01/10/2026 | 860,18 | 976,84 | El PDF cita el USD redondeado; el euro no aparece en su tabla de compras. |
| 02/10/2026 | 866,56 | 973,93 | Es la fecha valor hábil que corresponde al dato USD 866,56 que el PDF asigna a la compra del 03/10, sábado. Mantener la fecha real de compra y registrar la fecha valor de tasa utilizada por separado. |
| 07/10/2026 | 873,87 | 984,26 | El USD del PDF coincide redondeado; el EUR era distinto del valor de 09/10. |
| 08/10/2026 | 874,73 | 979,08 | En el PDF aparece 874,73 como USD, no debe confundirse con EUR. |
| 09/10/2026 | 875,65 | 980,61472543 | Coincide con la tasa EUR exacta que el usuario citó para esa fecha; el USD es 875,65. |

Fuentes secundarias de contraste: https://finanzasdigital.com/tasa-de-cambio-bcv-01-octubre-2026/ ; https://finanzasdigital.com/tasa-de-cambio-bcv-09-octubre-2026/ ; https://calculadorabcv.com/tasa-bcv-hoy . Se trata de fuentes que reproducen tasas atribuidas al BCV; guardar la captura o publicación primaria del BCV en cada cierre contable para una trazabilidad definitiva.

**Corrección importante:** el PDF no puede usar 980,61472543 Bs/EUR para todas las ventas futuras. Debe usar la tasa EUR correspondiente a la fecha efectiva de venta (o la regla de facturación aplicable que se confirme), y la tasa USD correspondiente a esa misma fecha si se expresa el cobro en USD. Para compras, guardar tasa USD y fecha valor realmente usada; una compra física del 03/10 puede referenciar la última tasa hábil disponible del 02/10, pero la base debe quedar documentada.

La relación de tasas del 09/10 es aproximadamente 980,61472543 / 875,65 = 1,1199 EUR/USD en términos de bolívares por unidad. La diferencia de alrededor del 12% entre el valor en Bs de 1 EUR y 1 USD no es beneficio asegurado: solo se convierte en resultado económico después de considerar el precio de reposición real, la moneda efectivamente recibida, comisiones, impuestos, disponibilidad de cambio y el resto de costos.
