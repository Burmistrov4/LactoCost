# Especificación de costos — costo promedio ponderado (CPP)

**Estado:** requisito obligatorio de negocio; pendiente de implementación y pruebas.  
**Moneda de referencia inicial:** USD para comparar; conservar moneda original y tipo de cambio aplicado.

## 1. Objetivo

Calcular costos reproducibles para compras, inventario de insumos, empaques, fabricación por lote y venta por canal. El sistema nunca debe confundir promedio simple, CPP de inventario, costo de receta ni costo unitario de producto terminado.

## 2. CPP de compras

Para partidas comparables y unidades normalizadas:

CPP = suma(cantidad_i × costo_unitario_completo_i) / suma(cantidad_i)

El costo unitario completo de entrada puede incluir precio neto de descuentos + flete atribuible + carga/descarga + seguro + otros costos de adquisición documentados. Impuestos recuperables se registran por separado; impuestos no recuperables pueden formar parte del costo según el tratamiento contable aplicable. La app debe permitir configurar el tratamiento y no asumir asesoría fiscal.

Ejemplo: 10 kg a $1,60/kg y 30 kg a $1,90/kg => costo total $73; cantidad 40 kg; CPP $1,825/kg. El promedio simple de $1,75 es incorrecto para ponderar esas cantidades.

## 3. Métodos de inventario

- **Promedio ponderado móvil:** tras cada recepción, CPP nuevo = (valor inventario anterior + costo total de nueva recepción) / (cantidad anterior + cantidad recibida). La salida consume el CPP vigente en ese momento.
- **Promedio ponderado periódico:** costo disponible del período / cantidad disponible del período. Útil para análisis, pero debe declararse el período y no confundirse con el método móvil.
- **Histórico inmutable:** cada compra, ajuste, consumo, merma y producción se guarda como movimiento; no recalcular silenciosamente movimientos ya cerrados cuando llega una cotización nueva.
- La aplicación debe mostrar qué método se está usando, la fecha de corte y el historial que explica cada resultado.

## 4. Normalización obligatoria

Convertir solo unidades compatibles y con factores explícitos: kg↔g, L↔ml, unidad↔docena/caja cuando se conoce el contenido. No convertir kg a L sin densidad específica registrada. Cada SKU/insumo debe tener unidad base, unidad de compra y factor de conversión con evidencia.

## 5. Monedas y tasas

Guardar monto original, moneda, fecha/hora de la tasa, fuente de la tasa, tasa aplicada y equivalente de referencia. No mezclar bolívares y dólares ni aplicar tasa actual a operaciones históricas sin dejarlo indicado. Ofrecer vistas en moneda original y moneda de análisis. Flete pagado en otra moneda debe convertirse con tasa documentada.

## 6. Costo por lote de fabricación

Costo atribuible del lote = ingredientes consumidos valorados al costo de inventario definido + empaques usados + mano de obra directa + energía/agua + limpieza/sanitización + frío + control de calidad + transporte atribuible + costos indirectos asignados según regla visible.

Costo por unidad vendible = costo atribuible del lote / cantidad vendible real. Registrar por separado producción bruta, muestras, rechazos, pérdidas, unidades vendibles y peso neto final. No dividir entre unidades planificadas si el rendimiento real es distinto.

Las mermas normales pueden asignarse al costo de unidades vendibles según política; mermas anormales, vencimientos y daños deben aparecer también como indicador separado para no ocultar problemas.

## 7. Costeo de producto terminado

Para lotes homogéneos de producto terminado, se podrá calcular CPP por cantidad y costo total de lotes incorporados al inventario. Cada lote mantiene receta/versionado, fecha, rendimiento, calidad, vencimiento y trazabilidad. No mezclar producto con distinta especificación o estado sanitario solo para bajar el costo promedio.

## 8. Precio de venta y canal

Calcular por separado:
- costo de fabricación por unidad vendible;
- costo variable de vender por canal (comisión, entrega subsidiada, cobro, descuento, empaque de despacho, merma comercial);
- contribución unitaria y porcentaje de contribución;
- precio mínimo para margen objetivo;
- precio mayorista y detallista;
- impuestos incluidos/excluidos según configuración;
- punto de equilibrio y caja necesaria.

Para un margen objetivo m sobre ingreso neto, precio mínimo = costo variable unitario / (1 − m). No confundir margen sobre ventas con markup sobre costo. Mostrar ambas métricas con nombre inequívoco.

## 9. Plan de compra automática

La sugerencia de compra combinará existencias útiles, consumo estimado, plazo de entrega, stock de seguridad, pedidos comprometidos, vencimiento y presupuesto. Cantidad sugerida = máximo(0, demanda durante plazo + stock seguridad + pedidos comprometidos − stock útil − compras confirmadas pendientes), ajustada a MOQ y empaque de proveedor.

No comprar automáticamente ni emitir órdenes sin aprobación humana. Mostrar recomendación, supuestos, proveedor, CPP actual, precio cotizado, diferencia frente al CPP, fecha de precio y escenario de caja. Para perecederos, limitar compra a demanda y capacidad de frío.

## 10. Datos y auditoría

Toda cifra de precio debe conservar: proveedor/fuente, fecha, cantidad, unidad, moneda, impuestos, descuento, flete, vigencia, MOQ, evidencia y estado (publicado, cotizado, estimado, supuesto, vencido). Las cotizaciones no confirmadas no se etiquetarán como ofertas firmes.

## 11. Pruebas obligatorias

- Cantidades distintas y precios distintos producen CPP correcto.
- Precio unitario con flete prorrateado y descuentos aplicados una sola vez.
- Compra parcial, devolución, ajuste, pérdida y salida.
- Conversión de unidades y rechazo de conversiones inválidas.
- Monedas y tasas históricas.
- Rendimiento real inferior al esperado.
- Margen vs markup y precio mínimo.
- Redondeo solo al presentar; mantener precisión interna decimal.
- Recalcular informe sin alterar movimientos históricos cerrados.
