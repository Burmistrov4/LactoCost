"""Pruebas del motor de precios: margen, cargos variables, impuestos y redondeo."""
import unittest
from decimal import Decimal as D

from app.core.pricing import calculate_target_price


class PricingTests(unittest.TestCase):
    def test_basic_target_margin(self):
        result = calculate_target_price("820", ".35")
        self.assertEqual(result.net_price, D("1261.54"))
        self.assertEqual(result.contribution, D("441.54"))
        self.assertEqual(result.actual_contribution_margin, D("441.54") / D("1261.54"))

    def test_channel_commission_is_included_in_required_price(self):
        result = calculate_target_price("100", ".30", variable_fee_rate=".10")
        self.assertEqual(result.net_price, D("166.67"))
        self.assertAlmostEqual(float(result.actual_contribution_margin), .30, places=4)

    def test_fixed_variable_cost_is_included(self):
        result = calculate_target_price("100", ".25", fixed_variable_cost="20")
        self.assertEqual(result.net_price, D("160.00"))
        self.assertEqual(result.contribution, D("40.00"))

    def test_tax_is_added_on_top_and_excluded_from_contribution(self):
        result = calculate_target_price("100", ".20", tax_rate=".16")
        self.assertEqual(result.net_price, D("125.00"))
        self.assertEqual(result.customer_price, D("145.00"))
        self.assertEqual(result.contribution, D("25.00"))

    def test_custom_rounding_increment(self):
        result = calculate_target_price("100", ".20", price_quantum=".05")
        self.assertEqual(result.net_price, D("125.00"))

    def test_round_half_up_is_explicit(self):
        result = calculate_target_price("1.025", "0", price_quantum=".05")
        self.assertEqual(result.net_price, D("1.05"))

    def test_rejects_margin_plus_fee_at_or_above_one(self):
        for margin, fee in ((".9", ".1"), (".8", ".3")):
            with self.subTest(margin=margin, fee=fee), self.assertRaises(ValueError):
                calculate_target_price(100, margin, variable_fee_rate=fee)

    def test_rejects_invalid_rates_and_negative_costs(self):
        cases = [
            {"unit_cost": -1, "target_margin": ".3"},
            {"unit_cost": 1, "target_margin": "1"},
            {"unit_cost": 1, "target_margin": ".3", "variable_fee_rate": "-.1"},
            {"unit_cost": 1, "target_margin": ".3", "fixed_variable_cost": "-1"},
            {"unit_cost": 1, "target_margin": ".3", "tax_rate": "-.1"},
            {"unit_cost": 1, "target_margin": ".3", "price_quantum": "0"},
            {"unit_cost": "NaN", "target_margin": ".3"},
        ]
        for kwargs in cases:
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                calculate_target_price(**kwargs)

    def test_zero_cost_and_zero_margin_are_supported(self):
        result = calculate_target_price(0, 0)
        self.assertEqual(result.net_price, D("0.00"))
        self.assertEqual(result.contribution, D("0.00"))

    def test_result_is_immutable(self):
        from dataclasses import FrozenInstanceError
        result = calculate_target_price(100, ".2")
        with self.assertRaises(FrozenInstanceError):
            result.net_price = D("1")


if __name__ == "__main__":
    unittest.main(verbosity=2)
