"""Pruebas de aceptación del motor de costos (solo biblioteca estándar)."""
import unittest
from decimal import Decimal as D

from app.core.costing import (
    batch_unit_cost,
    contribution,
    moving_average_receipt,
    price_for_margin,
    price_for_markup,
    suggested_purchase_quantity,
    usable_unit_cost,
    value_issue,
    weighted_average_cost,
)


class CostingTests(unittest.TestCase):
    def test_cpp_weighted_not_simple_average(self):
        self.assertEqual(weighted_average_cost([(10, "1.60"), (30, "1.90")]), D("1.825"))

    def test_receipt_includes_freight_once(self):
        result = moving_average_receipt(10, 2, 10, 20, attributable_charges=5)
        self.assertEqual(result["receipt_value"], D("25"))
        self.assertEqual(result["ending_value"], D("45"))
        self.assertEqual(result["new_average_cost"], D("2.25"))

    def test_discount_subtracted_once(self):
        result = moving_average_receipt(0, 0, 2, 10, discounts=2)
        self.assertEqual(result["receipt_value"], D("8"))
        self.assertEqual(result["new_average_cost"], D("4"))

    def test_issue_uses_current_cpp(self):
        self.assertEqual(value_issue(2, "2.25")["issue_value"], D("4.50"))

    def test_usable_yield_cost_includes_discard(self):
        self.assertEqual(usable_unit_cost(1000, 500, 385), D(1000) / D(385))

    def test_batch_cost_divides_by_saleable_units(self):
        self.assertEqual(batch_unit_cost(12, 10), D("1.2"))

    def test_margin_and_markup_are_different(self):
        self.assertEqual(price_for_margin("1.20", ".30"), D("1.20") / D(".70"))
        self.assertEqual(price_for_markup("1.20", ".30"), D("1.560"))

    def test_contribution_not_net_profit(self):
        result = contribution(2, "1.20")
        self.assertEqual(result["contribution"], D(".80"))
        self.assertEqual(result["contribution_margin"], D(".40"))

    def test_purchase_suggestion(self):
        self.assertEqual(suggested_purchase_quantity(20, 5, 3, 10, 4), D("14"))

    def test_purchase_suggestion_never_negative(self):
        self.assertEqual(suggested_purchase_quantity(5, 1, 0, 20, 0), D("0"))

    def test_reject_zero_receipt(self):
        with self.assertRaises(ValueError):
            moving_average_receipt(0, 0, 0, 0)

    def test_reject_discount_over_invoice(self):
        with self.assertRaises(ValueError):
            moving_average_receipt(0, 0, 1, 2, discounts=3)

    def test_reject_invalid_margin(self):
        for margin in ("1", "-0.1", "1.2"):
            with self.subTest(margin=margin), self.assertRaises(ValueError):
                price_for_margin(1, margin)

    def test_reject_zero_saleable_units(self):
        with self.assertRaises(ValueError):
            batch_unit_cost(10, 0)

    def test_reject_incompatible_or_invalid_negative_data(self):
        with self.assertRaises(ValueError):
            weighted_average_cost([(1, -1)])
        with self.assertRaises(ValueError):
            usable_unit_cost(10, 10, 11)


if __name__ == "__main__":
    unittest.main(verbosity=2)
