"""Pruebas de precisión, conversión y límites de SQLite/D1 INTEGER."""
import unittest
from decimal import Decimal as D, ROUND_HALF_UP

from app.core.storage_units import (
    SQLITE_INT_MAX,
    SQLITE_INT_MIN,
    extended_cost_micro,
    from_micro_units,
    to_micro_units,
)


class StorageUnitTests(unittest.TestCase):
    def test_round_trip_micro_units_exactly(self):
        for value in ("0", "1", "1.234567", "999999.123456"):
            with self.subTest(value=value):
                self.assertEqual(from_micro_units(to_micro_units(value)), D(value))

    def test_rejects_implicit_precision_loss(self):
        with self.assertRaisesRegex(ValueError, "excede seis decimales"):
            to_micro_units("1.0000001")

    def test_explicit_rounding_is_required_for_precision_loss(self):
        self.assertEqual(to_micro_units("1.0000005", rounding=ROUND_HALF_UP), 1000001)

    def test_rejects_negative_by_default_but_supports_signed_movements(self):
        with self.assertRaises(ValueError):
            to_micro_units("-1")
        self.assertEqual(to_micro_units("-1.25", allow_negative=True), -1250000)

    def test_rejects_non_finite_or_invalid_values(self):
        for value in ("NaN", "Infinity", "not-money"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                to_micro_units(value)

    def test_enforces_sqlite_int64_limits(self):
        self.assertEqual(to_micro_units(D(SQLITE_INT_MAX) / D(1000000)), SQLITE_INT_MAX)
        with self.assertRaises(OverflowError):
            to_micro_units(D(SQLITE_INT_MAX + 1) / D(1000000))
        with self.assertRaises(OverflowError):
            from_micro_units(SQLITE_INT_MAX + 1)
        with self.assertRaises(OverflowError):
            from_micro_units(SQLITE_INT_MIN - 1)

    def test_extended_cost_uses_scale_and_half_up(self):
        # 1.5 units * 2.25 currency/unit = 3.375 currency.
        self.assertEqual(extended_cost_micro(1500000, 2250000), 3375000)
        # Half a micro-unit rounds upward, not using binary floating point.
        self.assertEqual(extended_cost_micro(1, 500000), 1)

    def test_extended_cost_rejects_invalid_inputs_and_overflow(self):
        with self.assertRaises(ValueError):
            extended_cost_micro(-1, 1000000)
        with self.assertRaises(ValueError):
            extended_cost_micro(1000000, -1)
        with self.assertRaises(ValueError):
            extended_cost_micro(True, 1000000)
        with self.assertRaises(OverflowError):
            extended_cost_micro(SQLITE_INT_MAX, SQLITE_INT_MAX)


if __name__ == "__main__":
    unittest.main(verbosity=2)
