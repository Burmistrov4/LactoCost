# LactoCost — Panel de Control y Operaciones Lácteas

Sistema de gestión operativa, costos, inventario y análisis de precios para derivados lácteos (yogurt y quesillo). Desarrollado en **React 18 + TypeScript + Vite**.

## Características Principales

1. **Dashboard Operativo**:
   - KPIs en tiempo real: Ventas netas, Margen de contribución, Valoración total del inventario y Costo Promedio Ponderado (CPP).
   - Gráfico de rendimiento: Evolución de ingresos netos vs. costo variable con selectores de período (7, 30 y 90 días).
   - Salud del inventario con gráfico de distribución y panel de alertas prioritarias inteligentes.
   - Radar de rentabilidad por producto con precios sugeridos dinámicos.

2. **Inventario & Stock**:
   - Catálogo clasificado: Lácteos, ingredientes, empaques e insumos.
   - Control de stock físico, niveles mínimos y stock de seguridad.
   - Valoración continua en Bolívares (VES) y Dólares (USD).
   - Trazabilidad por ubicación en cava y almacenes.

3. **Control de Producción & Recetas**:
   - Formulación versionada para Yogurt Natural, Yogurt de Fresa y Quesillo tradicional.
   - Simulador y ejecutor de lotes con factor de escala y estimación de mermas de proceso.
   - Cálculo automático del costo unitario vendible (`batchUnitCost`) imputando materias primas y mano de obra directa.
   - Snapshots inmutables de lotes finalizados.

4. **Costos & CPP (Costo Promedio Ponderado)**:
   - Simulador de recepciones (`movingAverageReceipt`): integra factura bruta, fletes atribuibles y descuentos comerciales.
   - Costo unitario aprovechable (`usableUnitCost`): ajuste exacto por mermas de limpieza y rendimiento útil.
   - Valoración de salidas y consumos a CPP vigente.

5. **Compras Sugeridas**:
   - Planificador racional de compras (`suggestedPurchaseQuantity`) según demanda durante plazo de entrega, stock de seguridad, demanda comprometida e inventario en tránsito.
   - Listado de alertas de reabastecimiento para insumos en stock crítico o bajo mínimo.

6. **Precios & Márgenes Auditables**:
   - Cálculo de precio neto con margen sobre ingresos (`(precio − costo) ÷ precio`).
   - Soporte para comisiones variables por canal, costos fijos por unidad, tasas de IVA y cuantum de redondeo.
   - Visualización de margen real resultante y contribución marginal unitaria.

7. **Configuración de Tasas de Cambio**:
   - Observaciones de tasas oficiales BCV (USD / EUR) y referencias de mercado Binance P2P (USDT compra y venta).
   - Políticas desacopladas: selección independiente de tasa para valoración de insumos (costos) y para precios de venta.
   - Conversor con auditoría de fuente, fecha de publicación y frescura de la tasa.

8. **Informes & Exportación**:
   - Exportación de datos a formato CSV (Inventario, Historial de Operaciones y Precios de Venta).
   - Auditoría completa de movimientos con operador, referencia y motivo.

## Comandos del Proyecto

- `npm run dev`: Inicia el servidor de desarrollo en el puerto 3000 (`http://0.0.0.0:3000`).
- `npm run build`: Compila la aplicación con TypeScript y Vite.
- `npm run preview`: Previsualiza la versión compilada en producción.
