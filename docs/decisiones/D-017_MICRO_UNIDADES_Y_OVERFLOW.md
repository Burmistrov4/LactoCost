# D-017 — Conversión segura a micro-unidades y límites SQLite/D1

**Fecha:** 2026-10-09  
**Estado:** implementado y probado como biblioteca de referencia; aún no conectado a una API.

## Decisión
- Las cantidades e importes persistidos usan enteros con escala 1.000.000 por unidad. Las tasas/porcentajes se conservan como texto decimal y se procesan con Decimal.
- Convertir de Decimal a entero micro-unidad no redondea silenciosamente: si hay más de seis decimales, la función falla salvo que el llamador especifique explícitamente una regla de redondeo.
- Se valida el rango signed int64 de SQLite/D1: -9.223.372.036.854.775.808 a 9.223.372.036.854.775.807 micro-unidades.
- Los movimientos firmados pueden permitir cantidades negativas, pero importes y costos unitarios normalmente deben ser no negativos según el tipo de campo.
- No calcular el costo extendido mediante multiplicación INTEGER en SQL. Cantidad_micro × costo_unitario_micro puede desbordar antes de dividir por la escala. Usar Decimal con precisión ampliada, dividir por 1.000.000, aplicar ROUND_HALF_UP a la micro-unidad y validar el resultado antes de persistir.

## Implementación
- app/core/storage_units.py: to_micro_units, from_micro_units y extended_cost_micro.
- tests/test_storage_units.py: conversión exacta, precisión explícita, números no finitos, signos, redondeo y overflow.

## Límites
La escala de micro-unidades es provisional hasta aprobar unidades base, moneda y regla comercial. Esta biblioteca no decide equivalencias entre unidades, tasas de cambio ni tratamiento fiscal. El backend debe aplicar los mismos controles en todos los endpoints y probar valores de frontera.

## Validación
La suite Python completa posterior a esta implementación: 46/46 PASS; compileall PASS. No se modificó D1, no se añadió endpoint y no se desplegó.


## Evidencia histórica inmutable — 2026-10-09

La migración `0009_immutable_cost_snapshots_and_losses.sql` añade triggers para impedir UPDATE/DELETE de `inventory_cost_snapshots` y `finished_cost_snapshots`. Los snapshots CPP son evidencia de una valoración en un instante/version de cálculo; si se recalcula, se inserta otro snapshot. También protege los registros `batch_losses` de edición/borrado; las correcciones deben representarse como registros nuevos de corrección, no sobrescribir la merma original. Pruebas en `tests/test_schema.py`.


**Validación aplicada:** migración 0009 aplicada solo en D1 local; seis triggers confirmados por consulta. Python 62/62 y Node 29/29 PASS el 2026-10-09.


## Recetas aprobadas como evidencia histórica — migración 0010

La migración `0010_immutable_approved_recipes.sql` protege el costo futuro y la trazabilidad: una receta aprobada no puede cambiar cantidades, rendimiento, unidad, método ni evidencia. Sus líneas quedan congeladas en INSERT/UPDATE/DELETE; solo se permite retirar la versión aprobada sin alterar otros campos. Una versión retirada no se reactiva ni se elimina. La aprobación requiere identidad y fecha del aprobador. Cualquier cambio de receta exige crear una nueva versión en borrador. Tests: `test_approved_recipe_version_is_immutable_except_retirement`, `test_recipe_lines_are_locked_after_approval`, `test_recipe_approval_requires_actor_and_timestamp`.
