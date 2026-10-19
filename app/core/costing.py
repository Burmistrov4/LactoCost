"""Motor financiero determinista inicial. Sin persistencia ni datos comerciales reales."""
from decimal import Decimal, InvalidOperation
from typing import Iterable

ZERO = Decimal("0")
ONE = Decimal("1")


def dec(value) -> Decimal:
    """Convierte entradas a Decimal sin pasar por aritmética float."""
    if isinstance(value, Decimal):
        result = value
    else:
        try:
            result = Decimal(str(value))
        except (InvalidOperation, ValueError, TypeError) as exc:
            raise ValueError(f"Valor decimal inválido: {value!r}") from exc
    if not result.is_finite():
        raise ValueError("El valor debe ser finito.")
    return result


def _non_negative(name: str, value) -> Decimal:
    result = dec(value)
    if result < ZERO:
        raise ValueError(f"{name} no puede ser negativo.")
    return result


def weighted_average_cost(lots: Iterable[tuple[object, object]]) -> Decimal:
    """CPP = suma(cantidad * costo unitario) / suma(cantidad)."""
    total_qty = ZERO
    total_value = ZERO
    for quantity, unit_cost in lots:
        qty = _non_negative("Cantidad", quantity)
        cost = _non_negative("Costo unitario", unit_cost)
        total_qty += qty
        total_value += qty * cost
    if total_qty == ZERO:
        raise ValueError("No se puede calcular CPP con cantidad total cero.")
    return total_value / total_qty


def moving_average_receipt(
    current_quantity,
    current_unit_cost,
    received_quantity,
    invoice_amount,
    attributable_charges=ZERO,
    discounts=ZERO,
) -> dict[str, Decimal]:
    """Integra una recepción; invoice_amount es el importe bruto de factura."""
    stock_qty = _non_negative("Existencia actual", current_quantity)
    stock_cost = _non_negative("CPP actual", current_unit_cost)
    received_qty = _non_negative("Cantidad recibida", received_quantity)
    gross = _non_negative("Importe bruto", invoice_amount)
    charges = _non_negative("Cargos atribuibles", attributable_charges)
    discount = _non_negative("Descuento", discounts)
    if received_qty == ZERO:
        raise ValueError("La cantidad recibida debe ser mayor que cero.")
    if discount > gross:
        raise ValueError("El descuento no puede superar el importe bruto.")
    receipt_value = gross - discount + charges
    ending_qty = stock_qty + received_qty
    ending_value = stock_qty * stock_cost + receipt_value
    return {
        "receipt_value": receipt_value,
        "ending_quantity": ending_qty,
        "ending_value": ending_value,
        "new_average_cost": ending_value / ending_qty,
    }


def value_issue(quantity, current_unit_cost) -> dict[str, Decimal]:
    qty = _non_negative("Cantidad de salida", quantity)
    cost = _non_negative("CPP vigente", current_unit_cost)
    return {"issue_value": qty * cost}


def usable_unit_cost(purchase_cost, purchased_quantity, usable_quantity) -> Decimal:
    """Distribuye el costo de adquisición entre la cantidad realmente aprovechable."""
    total = _non_negative("Costo de compra", purchase_cost)
    purchased = _non_negative("Cantidad comprada", purchased_quantity)
    usable = _non_negative("Cantidad aprovechable", usable_quantity)
    if purchased == ZERO:
        raise ValueError("La cantidad comprada debe ser mayor que cero.")
    if usable == ZERO:
        raise ValueError("La cantidad aprovechable debe ser mayor que cero.")
    if usable > purchased:
        raise ValueError("La cantidad aprovechable no puede superar la comprada.")
    return total / usable


def batch_unit_cost(total_batch_cost, saleable_units) -> Decimal:
    total = _non_negative("Costo del lote", total_batch_cost)
    units = _non_negative("Unidades vendibles", saleable_units)
    if units == ZERO:
        raise ValueError("No hay unidades vendibles; no se puede dividir entre cero.")
    return total / units


def price_for_margin(variable_unit_cost, target_margin) -> Decimal:
    """Precio neto requerido para margen sobre ingresos: costo / (1 - margen)."""
    cost = _non_negative("Costo variable unitario", variable_unit_cost)
    margin = dec(target_margin)
    if margin < ZERO or margin >= ONE:
        raise ValueError("El margen debe ser >= 0 y < 1.")
    return cost / (ONE - margin)


def price_for_markup(unit_cost, markup) -> Decimal:
    cost = _non_negative("Costo unitario", unit_cost)
    rate = dec(markup)
    if rate < ZERO:
        raise ValueError("El markup no puede ser negativo.")
    return cost * (ONE + rate)


def contribution(net_unit_revenue, variable_unit_cost) -> dict[str, Decimal]:
    revenue = _non_negative("Ingreso neto unitario", net_unit_revenue)
    cost = _non_negative("Costo variable unitario", variable_unit_cost)
    amount = revenue - cost
    return {
        "contribution": amount,
        "contribution_margin": (amount / revenue) if revenue else ZERO,
    }


def suggested_purchase_quantity(
    demand_during_lead_time,
    safety_stock,
    additional_committed_demand,
    usable_stock,
    confirmed_inbound,
) -> Decimal:
    values = [
        _non_negative("Demanda durante plazo", demand_during_lead_time),
        _non_negative("Stock de seguridad", safety_stock),
        _non_negative("Demanda comprometida adicional", additional_committed_demand),
        _non_negative("Stock útil", usable_stock),
        _non_negative("Compras confirmadas pendientes", confirmed_inbound),
    ]
    demand, safety, committed, stock, inbound = values
    return max(ZERO, demand + safety + committed - stock - inbound)
