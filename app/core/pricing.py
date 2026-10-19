"""Motor de precios auditable: Decimal, margen sobre ingreso neto y redondeo explícito.

No representa una política fiscal. Los impuestos se modelan solo como una tasa
añadida al precio neto; validar tratamiento legal y contratos del canal antes de uso.
"""
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Any

ZERO = Decimal("0")
ONE = Decimal("1")


def _decimal(name: str, value: Any) -> Decimal:
    try:
        result = value if isinstance(value, Decimal) else Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"{name} debe ser un decimal válido.") from exc
    if not result.is_finite():
        raise ValueError(f"{name} debe ser finito.")
    return result


def _non_negative(name: str, value: Any) -> Decimal:
    result = _decimal(name, value)
    if result < ZERO:
        raise ValueError(f"{name} no puede ser negativo.")
    return result


def _rate(name: str, value: Any, *, allow_one: bool = False) -> Decimal:
    result = _decimal(name, value)
    if result < ZERO or (result > ONE if allow_one else result >= ONE):
        condition = ">= 0 y <= 1" if allow_one else ">= 0 y < 1"
        raise ValueError(f"{name} debe ser {condition}.")
    return result


def _round_to_increment(amount: Decimal, increment: Decimal) -> Decimal:
    """Redondea al múltiplo más cercano del incremento, ROUND_HALF_UP."""
    return (amount / increment).quantize(ONE, rounding=ROUND_HALF_UP) * increment


@dataclass(frozen=True)
class PriceCalculation:
    unit_cost: Decimal
    target_margin: Decimal
    variable_fee_rate: Decimal
    fixed_variable_cost: Decimal
    tax_rate: Decimal
    price_quantum: Decimal
    unrounded_net_price: Decimal
    net_price: Decimal
    variable_fee: Decimal
    contribution: Decimal
    actual_contribution_margin: Decimal
    customer_price: Decimal


def calculate_target_price(
    unit_cost: Any,
    target_margin: Any,
    *,
    variable_fee_rate: Any = ZERO,
    fixed_variable_cost: Any = ZERO,
    tax_rate: Any = ZERO,
    price_quantum: Any = "0.01",
) -> PriceCalculation:
    """Calcula un precio con margen objetivo después de comisión/cargos variables.

    Supuestos:
    - target_margin y variable_fee_rate se aplican sobre el precio neto (sin impuesto).
    - fixed_variable_cost es un costo variable fijo por unidad, en la misma moneda.
    - tax_rate se añade al precio neto y no se considera ingreso/contribución.
    - price_quantum y ROUND_HALF_UP son explícitos y deben ajustarse a moneda/regla real.
    """
    cost = _non_negative("Costo unitario", unit_cost)
    margin = _rate("Margen objetivo", target_margin)
    fee_rate = _rate("Tasa de comisión", variable_fee_rate)
    fixed_cost = _non_negative("Costo variable fijo", fixed_variable_cost)
    tax = _rate("Tasa de impuesto", tax_rate, allow_one=True)
    quantum = _decimal("Incremento de redondeo", price_quantum)
    if quantum <= ZERO:
        raise ValueError("El incremento de redondeo debe ser mayor que cero.")
    denominator = ONE - margin - fee_rate
    if denominator <= ZERO:
        raise ValueError("Margen objetivo más comisión porcentual debe ser menor que 100%.")

    raw_price = (cost + fixed_cost) / denominator
    net_price = _round_to_increment(raw_price, quantum)
    fee = net_price * fee_rate
    contribution_value = net_price - cost - fixed_cost - fee
    actual_margin = contribution_value / net_price if net_price > ZERO else ZERO
    customer_price = _round_to_increment(net_price * (ONE + tax), quantum)
    return PriceCalculation(
        unit_cost=cost,
        target_margin=margin,
        variable_fee_rate=fee_rate,
        fixed_variable_cost=fixed_cost,
        tax_rate=tax,
        price_quantum=quantum,
        unrounded_net_price=raw_price,
        net_price=net_price,
        variable_fee=fee,
        contribution=contribution_value,
        actual_contribution_margin=actual_margin,
        customer_price=customer_price,
    )
