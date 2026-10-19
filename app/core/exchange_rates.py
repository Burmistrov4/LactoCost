"""Auditable exchange-rate domain logic; no network access in this module.

All rates mean: units of quote_currency per one unit of base_currency.
For Binance P2P, BUY means the app's user is buying USDT; SELL means selling USDT.
"""
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from statistics import median
from typing import Any, Iterable

ZERO = Decimal("0")
ONE = Decimal("1")


def decimal_value(name: str, value: Any) -> Decimal:
    try:
        result = value if isinstance(value, Decimal) else Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError(f"{name} debe ser un decimal válido.") from exc
    if not result.is_finite():
        raise ValueError(f"{name} debe ser finito.")
    return result


@dataclass(frozen=True)
class RateQuote:
    price: Decimal
    available_amount: Decimal | None = None
    advertiser_completion_rate: Decimal | None = None
    advertiser_orders: int | None = None
    payment_methods: tuple[str, ...] = ()
    advertiser_id: str | None = None


@dataclass(frozen=True)
class RateAggregate:
    rate: Decimal
    count: int
    method: str
    minimum: Decimal
    maximum: Decimal


def aggregate_p2p_quotes(
    quotes: Iterable[RateQuote],
    *,
    minimum_price: Any = ZERO,
    maximum_price: Any | None = None,
    minimum_available: Any = ZERO,
    minimum_completion_rate: Any = "0.90",
    minimum_orders: int = 0,
    max_quotes: int = 20,
    method: str = "arithmetic_mean",
) -> RateAggregate:
    """Aggregate a bounded, filtered sample of P2P ads.

    The result is a sample average, NOT an official exchange rate or executable quote.
    Input ordering should be the provider's price-sorted order; filters are applied first.
    """
    low = decimal_value("Precio mínimo", minimum_price)
    high = None if maximum_price is None else decimal_value("Precio máximo", maximum_price)
    available_floor = decimal_value("Disponibilidad mínima", minimum_available)
    completion_floor = decimal_value("Tasa mínima de finalización", minimum_completion_rate)
    if low < ZERO or (high is not None and high < low):
        raise ValueError("El rango de precios es inválido.")
    if available_floor < ZERO or not ZERO <= completion_floor <= ONE:
        raise ValueError("Los filtros de disponibilidad/finalización son inválidos.")
    if minimum_orders < 0 or max_quotes < 1:
        raise ValueError("Los límites de órdenes y anuncios son inválidos.")
    if method not in {"arithmetic_mean", "median"}:
        raise ValueError("Método de agregación no admitido.")

    accepted: list[Decimal] = []
    for quote in quotes:
        price = decimal_value("Precio de anuncio", quote.price)
        if price <= ZERO or price < low or (high is not None and price > high):
            continue
        if quote.available_amount is not None and decimal_value("Monto disponible", quote.available_amount) < available_floor:
            continue
        if quote.advertiser_completion_rate is not None and decimal_value(
            "Finalización del anunciante", quote.advertiser_completion_rate
        ) < completion_floor:
            continue
        if quote.advertiser_orders is not None and quote.advertiser_orders < minimum_orders:
            continue
        accepted.append(price)
        if len(accepted) >= max_quotes:
            break
    if not accepted:
        raise ValueError("No hay anuncios que cumplan los filtros; no se puede publicar una tasa.")
    rate = sum(accepted, ZERO) / Decimal(len(accepted)) if method == "arithmetic_mean" else Decimal(str(median(accepted)))
    return RateAggregate(
        rate=rate,
        count=len(accepted),
        method=method,
        minimum=min(accepted),
        maximum=max(accepted),
    )


def convert_amount(
    amount: Any,
    rate: Any,
    *,
    rounding_quantum: Any = "0.01",
) -> Decimal:
    """Convert amount using quote units per base unit, with explicit ROUND_HALF_UP."""
    source_amount = decimal_value("Importe", amount)
    exchange_rate = decimal_value("Tasa", rate)
    quantum = decimal_value("Incremento de redondeo", rounding_quantum)
    if source_amount < ZERO:
        raise ValueError("El importe no puede ser negativo.")
    if exchange_rate <= ZERO:
        raise ValueError("La tasa debe ser mayor que cero.")
    if quantum <= ZERO:
        raise ValueError("El incremento de redondeo debe ser mayor que cero.")
    return (source_amount * exchange_rate / quantum).quantize(Decimal("1"), rounding=ROUND_HALF_UP) * quantum


def invert_rate(rate: Any) -> Decimal:
    """Invert a positive rate, for displaying the reverse currency pair only."""
    value = decimal_value("Tasa", rate)
    if value <= ZERO:
        raise ValueError("La tasa debe ser mayor que cero.")
    return ONE / value
