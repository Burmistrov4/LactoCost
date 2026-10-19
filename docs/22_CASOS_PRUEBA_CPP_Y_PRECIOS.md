# Casos de prueba de costos, CPP y precio de venta

**Fecha:** 2026-10-09  
**Estado:** criterios de aceptación para la futura aplicación. Los resultados son pruebas matemáticas, no datos comerciales reales.

## 1. Principios de cálculo

- Mantener precisión decimal internamente; redondear solo al presentar.
- No promediar precios sin ponderar cantidades.
- CPP móvil se actualiza con recepciones; las salidas consumen el CPP vigente.
- Cada movimiento queda auditado y los lotes cerrados conservan un snapshot de costos.
- Rechazar conversiones incompatibles sin factor explícito.
- Si falta un dato esencial, mostrar qué falta y separar cualquier escenario estimado.
- No permitir stock negativo silencioso.
- La compra sugerida nunca se convierte automáticamente en orden de compra.

## 2. Casos CPP e inventario

| ID | Entrada | Resultado esperado | Criterio |
|---|---|---|---|
| CPP-001 | 10 kg a US$1,60/kg y 30 kg a US$1,90/kg | Total US$73; 40 kg; CPP US$1,825/kg | No usar promedio simple US$1,75 |
| CPP-002 | Inventario previo 10 kg a US$2/kg; recepción 10 kg a US$2/kg con US$5 de flete | Recepción US$25; final 20 kg/US$45; CPP US$2,25/kg | Flete incluido una sola vez |
| CPP-003 | 5 kg a CPP US$2,25/kg; salida de 2 kg | Salida US$4,50; saldo 3 kg/US$6,75 | Salida usa CPP vigente |
| CPP-004 | 2 kg a US$2/kg y 2 kg a US$4/kg | CPP US$3/kg | Ponderación por cantidades |
| CPP-005 | Descuento documentado en compra | CPP usa precio neto de descuento una sola vez | No duplicar descuento |
| CPP-006 | Caja de 30 huevos por US$5,80 | US$0,193333… por huevo | Factor caja/unidad documentado |
| CPP-007 | Compra en Bs sin tasa/fecha/fuente | Equivalente USD queda pendiente | No inventar tasa ni usar la actual silenciosamente |
| CPP-008 | Convertir kg a L sin densidad específica | Bloquear conversión | No asumir equivalencia universal |
| CPP-009 | Receta requiere 200 g; stock útil 150 g | Advertir faltante 50 g y bloquear cierre normal | No crear saldo negativo |
| CPP-010 | 500 g de fresa cuestan Bs1.000; 115 g descartados; 385 g útiles | Costo sobre rendimiento útil ≈ Bs2,5974026/g si la merma fue previa a producción y no recuperable | Merma visible y supuesto explícito |
| CPP-011 | Lote US$12, 10 unidades vendibles | US$1,20 por unidad | Divide entre vendibles |
| CPP-012 | Lote US$12, se producen 12 unidades, 2 rechazadas | US$1,20 por unidad vendible si quedan 10 vendibles | No dividir entre 12 |
| CPP-013 | Costo variable US$1,20; margen objetivo 30% sobre ingreso neto | Precio mínimo US$1,714285… antes de redondeo/impuestos | Costo/(1−margen) |
| CPP-014 | Costo US$1,20; markup objetivo 30% sobre costo | Precio US$1,56 | Distinguir markup de margen |
| CPP-015 | Precio neto US$2; costo variable US$1,20 | Contribución US$0,80; margen 40% | No llamarlo ganancia neta |
| CPP-016 | Entra compra después de cerrar un lote | El lote conserva snapshot; CPP actual puede cambiar | Historial reproducible |
| CPP-017 | Falta costo del envase | Mostrar costo parcial y conceptos pendientes | No declarar costo completo |
| CPP-018 | Dos SKU con formatos/especificaciones distintas | Mantener CPP separado por SKU homogéneo | No mezclar productos incompatibles |
| CPP-019 | Conteo físico menor que saldo teórico | Proponer ajuste con motivo/aprobación | Sin mutación silenciosa |
| CPP-020 | Se corrige una tasa histórica después de cerrar operación | Operación conserva tasa original; corrección auditada | No reescribir en silencio |

## 3. Precio por canal

| ID | Escenario | Resultado esperado |
|---|---|---|
| CAN-001 | Venta directa, entrega cobrada aparte | Separar ingreso de producto y costo/ingreso de entrega |
| CAN-002 | Comisión porcentual más tarifa fija por pedido | Asignar ambas con regla explícita |
| CAN-003 | Venta mayorista con descuento | Mostrar precio del productor, precio final sugerido y contribución del productor; no inventar margen del comercio |
| CAN-004 | Unidades devueltas/no vendidas | Ajustar unidades cobradas y registrar merma/devolución aparte |
| CAN-005 | Precio incluye impuesto configurado | Desglosar base e impuesto según regla confirmada |
| CAN-006 | Precio en EUR y costo histórico en USD | Conversión con fecha/tasa/fuente explícitas; efecto cambiario separado del margen operativo |
| CAN-007 | Margen objetivo 100% | Rechazar precio finito: denominador cero |
| CAN-008 | Margen menor que 0% o mayor/igual a 100% | Validar entrada y explicar el rango permitido |

## 4. Compra sugerida

Fórmula base: cantidad sugerida = máximo de cero y (demanda durante plazo + stock de seguridad + pedidos comprometidos adicionales − stock útil − compras confirmadas pendientes).

La implementación debe definir si los pedidos comprometidos ya forman parte de la demanda prevista para no contarlos dos veces.

| ID | Escenario | Resultado esperado |
|---|---|---|
| BUY-001 | Demanda plazo 20, seguridad 5, pedidos adicionales 3, stock 10, compra pendiente 4 | Sugerencia 14 antes de MOQ/empaque |
| BUY-002 | Stock y compras pendientes cubren demanda y seguridad | Sugerencia 0 |
| BUY-003 | Sugerencia menor que MOQ | Mostrar cálculo base y ajuste por MOQ por separado |
| BUY-004 | Perecedero vence antes de la demanda proyectada | Advertir/reducir compra y explicar vencimiento |
| BUY-005 | Presupuesto insuficiente | Mostrar déficit/alternativas; no comprar |
| BUY-006 | Cotización vencida o sin vigencia | Marcar recomendación pendiente de confirmar |

## 5. Rendimiento y lotes

- Conciliar insumos consumidos contra movimientos de inventario.
- Registrar rendimiento bruto, merma normal/anormal, muestras, rechazos y unidades vendibles.
- Conservar receta versionada, fecha, operador, lote de insumos y costo snapshot.
- No asignar vencimiento comercial hasta validar proceso y plazo.
- Si hay cero unidades vendibles, mostrar pérdida y bloquear división entre cero.
- La diferencia física debe generar ajuste propuesto, no mutación silenciosa.

## 6. Definition of Done

La función CPP/precios no se considera lista hasta que:

1. CPP-001 a CPP-020 y CAN-001 a CAN-008 estén automatizados.
2. Las pruebas de compra sugerida estén automatizadas y no dupliquen demanda/pedidos.
3. Los importes persistidos usen aritmética decimal exacta, no coma flotante binaria para dinero.
4. Los movimientos sean auditables y los lotes cerrados reproducibles.
5. Cada precio muestre fuente, fecha, moneda, unidad y estado de evidencia.
6. Se prueben entradas inválidas, fallos de red/DB, exportación y restauración.
7. La UI distinga dato documentado, medido, estimado, hipótesis y pendiente.
8. No se llame utilidad neta a un cálculo que omita costos relevantes.
