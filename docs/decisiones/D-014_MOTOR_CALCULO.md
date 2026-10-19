# Decisión técnica D-014 — motor de cálculo separado

**Fecha:** 2026-10-09  
**Estado:** adoptada para prototipo, pendiente de revisión antes de producción.

## Decisión
Implementar primero las fórmulas de costo como funciones puras en Python, usando `Decimal` y la biblioteca estándar. Mantenerlas independientes de Flask, plantillas, base de datos y datos reales.

## Motivos
- Facilita probar fórmulas antes de conectarlas al inventario.
- Reduce errores por coma flotante binaria en importes.
- Permite reutilizar la lógica en formularios, reportes y tareas automáticas.
- Los escenarios matemáticos no requieren inventar el conteo físico ni cotizaciones pendientes.

## Límites
- No persiste movimientos ni controla concurrencia.
- No sustituye revisión contable/fiscal.
- No aplica conversiones de moneda/unidad sin parámetros y evidencia.
- No crea órdenes de compra.
- No debe usarse para declarar rentabilidad neta ni para fijar precios comerciales definitivos sin costos completos.

## Criterio de revisión
Los casos unitarios deben pasar y los resultados de referencia coincidir con `docs/22_CASOS_PRUEBA_CPP_Y_PRECIOS.md`. Antes de integrar con inventario se diseñarán transacciones, auditoría, autorización, respaldo y migraciones.
