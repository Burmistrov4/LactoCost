"""Conversión segura entre Decimal y enteros micro-unidad para SQLite/D1.

Una unidad monetaria o unidad base = 1_000_000 micro-unidades.
No se debe multiplicar cantidad_micro * costo_unitario_micro en SQL/INTEGER;
use extended_cost_micro() con Decimal y control explícito de rango.
"""
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, localcontext
from typing import Any

MICRO_SCALE = Decimal("1000000")
MICRO_SCALE_INT = 1_000_000
SQLITE_INT_MIN = -(2**63)
SQLITE_INT_MAX = 2**63 - 1


def _decimal(value: Any) -> Decimal:
    try:
        result = value if isinstance(value, Decimal) else Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError(f"Valor decimal inválido: {value!r}") from exc
    if not result.is_finite():
        raise ValueError("El valor debe ser finito.")
    return result


def _check_sqlite_integer(value: int) -> int:
    if value < SQLITE_INT_MIN or value > SQLITE_INT_MAX:
        raise OverflowError("El valor supera el rango INTEGER de SQLite/D1 (int64).")
    return value


def to_micro_units(value: Any, *, allow_negative: bool = False, rounding=None) -> int:
    """Convierte un Decimal a micro-unidades; sin redondeo implícito por defecto."""
    amount = _decimal(value)
    if not allow_negative and amount < 0:
        raise ValueError("El valor no puede ser negativo.")
    scaled = amount * MICRO_SCALE
    integral = scaled.to_integral_value()
    if scaled != integral:
        if rounding is None:
            raise ValueError("El valor excede seis decimales; indique una regla de redondeo explícita.")
        integral = scaled.to_integral_value(rounding=rounding)
    result = int(integral)
    _check_sqlite_integer(result)
    return result


def from_micro_units(value: int) -> Decimal:
    """Convierte un INTEGER int64 a Decimal exacto en unidades base."""
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("El valor almacenado debe ser un entero.")
    _check_sqlite_integer(value)
    return Decimal(value) / MICRO_SCALE


def extended_cost_micro(quantity_micro: int, unit_cost_micro: int) -> int:
    """Calcula costo extendido: qty_micro * costo_micro / escala, con redondeo half-up."""
    for name, value in (("Cantidad", quantity_micro), ("Costo unitario", unit_cost_micro)):
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValueError(f"{name} debe ser un entero micro-unidad.")
        _check_sqlite_integer(value)
        if value < 0:
            raise ValueError(f"{name} no puede ser negativo.")
    with localcontext() as context:
        context.prec = 60
        exact_micro = Decimal(quantity_micro) * Decimal(unit_cost_micro) / MICRO_SCALE
        rounded = exact_micro.to_integral_value(rounding=ROUND_HALF_UP)
    result = int(rounded)
    _check_sqlite_integer(result)
    return result
