import unittest
from decimal import Decimal

from app.core.exchange_rates import RateQuote, aggregate_p2p_quotes, convert_amount, invert_rate


class ExchangeRateTests(unittest.TestCase):
    def test_average_only_accepted_quotes_and_respects_limit(self):
        quotes = [
            RateQuote(Decimal("36"), Decimal("500"), Decimal("0.99"), 500),
            RateQuote(Decimal("37"), Decimal("500"), Decimal("0.95"), 200),
            RateQuote(Decimal("40"), Decimal("500"), Decimal("0.50"), 800),
            RateQuote(Decimal("38"), Decimal("1"), Decimal("0.99"), 500),
            RateQuote(Decimal("39"), Decimal("500"), Decimal("0.99"), 500),
        ]
        result = aggregate_p2p_quotes(
            quotes, minimum_available="100", minimum_completion_rate="0.90",
            minimum_orders=100, max_quotes=2,
        )
        self.assertEqual(result.count, 2)
        self.assertEqual(result.rate, Decimal("36.5"))
        self.assertEqual(result.minimum, Decimal("36"))
        self.assertEqual(result.maximum, Decimal("37"))
        self.assertEqual(result.method, "arithmetic_mean")

    def test_median_method(self):
        result = aggregate_p2p_quotes(
            [RateQuote("10"), RateQuote("12"), RateQuote("100")],
            method="median", max_quotes=3,
        )
        self.assertEqual(result.rate, Decimal("12"))

    def test_no_eligible_offers_is_error(self):
        with self.assertRaises(ValueError):
            aggregate_p2p_quotes([RateQuote("10", advertiser_completion_rate="0.2")])

    def test_invalid_and_nonfinite_prices_are_rejected_or_filtered(self):
        with self.assertRaises(ValueError):
            aggregate_p2p_quotes([RateQuote("NaN")])
        with self.assertRaises(ValueError):
            aggregate_p2p_quotes([RateQuote("-1")])

    def test_conversion_uses_explicit_half_up_rounding(self):
        self.assertEqual(convert_amount("2.5", "36.5", rounding_quantum="1"), Decimal("91"))
        self.assertEqual(convert_amount("1.23", "2", rounding_quantum="0.01"), Decimal("2.46"))

    def test_conversion_rejects_invalid_inputs(self):
        for args in [("-1", "2"), ("1", "0"), ("1", "Infinity")]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                convert_amount(*args)

    def test_rate_inversion(self):
        self.assertEqual(invert_rate("4"), Decimal("0.25"))
        with self.assertRaises(ValueError):
            invert_rate("0")


if __name__ == "__main__":
    unittest.main()
