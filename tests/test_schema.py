"""Pruebas de integridad para migraciones SQLite/D1 locales."""
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "spikes" / "cloudflare-d1" / "migrations"


class BusinessFoundationSchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys = ON")
        for filename in (
            "0001_spike_probe.sql",
            "0002_business_foundation.sql",
            "0003_products_recipes_production.sql",
            "0004_product_pricing_policies.sql",
            "0005_pricing_policy_retirement_guard.sql",
            "0006_exchange_rates.sql",
            "0007_exchange_rate_policy_retirement_guard.sql",
            "0008_no_policy_reactivation.sql",
            "0009_immutable_cost_snapshots_and_losses.sql",
            "0010_immutable_approved_recipes.sql",
            "0011_production_batch_finalization_and_movement_reversals.sql",
            "0012_prevent_negative_inventory_balances.sql",
            "0013_stock_balance_is_currency_independent.sql",
        ):
            self.db.executescript((MIGRATIONS / filename).read_text(encoding="utf-8"))
        self.db.execute("INSERT INTO units(id,code,label,dimension,is_base) VALUES ('g','g','gramo','mass',1)")
        self.db.execute("INSERT INTO units(id,code,label,dimension,is_base) VALUES ('unit','unit','unidad','count',1)")
        self.db.execute("INSERT INTO stock_locations(id,name,location_type) VALUES ('main','Principal','general')")
        self.db.execute(
            "INSERT INTO ingredients(id,name,category,base_unit_id) VALUES ('milk','Leche pasteurizada','dairy','g')"
        )
        self.db.execute(
            "INSERT INTO inventory_lots(id,ingredient_id,location_id,received_at,received_quantity_micros,received_unit_cost_micros,currency_code) "
            "VALUES ('lot1','milk','main','2026-10-09T10:00:00Z',1000000,1250000,'VES')"
        )
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def add_finished_product(self):
        self.db.execute(
            "INSERT INTO finished_products(id,sku,name,category,base_unit_id) "
            "VALUES ('yogurt','YOG-001','Yogurt demo','yogurt','unit')"
        )

    def add_draft_recipe(self):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO recipe_versions(id,product_id,version_number,status,target_yield_micros,yield_unit_id,"
            "method_notes,evidence_status) VALUES ('recipe-1','yogurt',1,'draft',1000000,'g','Proceso demo','declared')"
        )
        self.db.execute(
            "INSERT INTO recipe_lines(id,recipe_version_id,ingredient_id,quantity_micros,unit_id) "
            "VALUES ('recipe-line-1','recipe-1','milk',500000,'g')"
        )

    def approve_recipe(self):
        self.db.execute(
            "UPDATE recipe_versions SET status='approved',approved_by='approver-1',"
            "approved_at='2026-10-09T12:00:00Z' WHERE id='recipe-1'"
        )

    def test_required_foundation_tables_exist(self):
        names = {
            row[0] for row in self.db.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
        }
        for required in (
            "units", "unit_conversions", "ingredients", "suppliers",
            "supplier_quotes", "supplier_quote_lines", "stock_locations",
            "inventory_lots", "inventory_movements", "inventory_cost_snapshots",
            "audit_events", "finished_products", "product_formats",
            "recipe_versions", "recipe_lines", "production_batches",
            "batch_consumptions", "batch_outputs", "batch_losses",
            "finished_inventory_movements", "finished_cost_snapshots",
            "product_pricing_policies", "product_price_snapshots",
            "exchange_rate_observations", "exchange_rate_policies",
            "exchange_rate_applications", "spike_probe",
        ):
            self.assertIn(required, names)

    def test_movement_can_be_inserted_with_unique_idempotency_key(self):
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('m1','milk','lot1','main','receipt',1000000,1250000,1250000,'VES','2026-10-09T10:00:00Z','request-1')"
        )
        self.db.commit()
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
                "VALUES ('m2','milk','lot1','main','receipt',1000000,1250000,1250000,'VES','2026-10-09T10:01:00Z','request-1')"
            )

    def test_movement_history_is_immutable(self):
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('m1','milk','lot1','main','receipt',1000000,1250000,1250000,'VES','2026-10-09T10:00:00Z','request-1')"
        )
        self.db.commit()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE inventory_movements SET quantity_delta_micros=0 WHERE id='m1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM inventory_movements WHERE id='m1'")

    def test_inventory_cost_snapshots_are_immutable(self):
        self.db.execute(
            "INSERT INTO inventory_cost_snapshots(id,ingredient_id,currency_code,quantity_on_hand_micros,"
            "weighted_average_unit_cost_micros,effective_at,calculation_version) "
            "VALUES ('ics-1','milk','VES',1000000,1250000,'2026-10-09T10:00:00Z','cpp-v1')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE inventory_cost_snapshots SET weighted_average_unit_cost_micros=2 WHERE id='ics-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM inventory_cost_snapshots WHERE id='ics-1'")

    def test_finished_cost_snapshots_are_immutable(self):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO finished_cost_snapshots(id,product_id,currency_code,quantity_on_hand_micros,"
            "weighted_average_unit_cost_micros,effective_at,calculation_version) "
            "VALUES ('fcs-1','yogurt','VES',1000000,500000,'2026-10-09T10:00:00Z','cpp-v1')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE finished_cost_snapshots SET weighted_average_unit_cost_micros=2 WHERE id='fcs-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM finished_cost_snapshots WHERE id='fcs-1'")

    def test_batch_loss_records_are_immutable(self):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO production_batches(id,batch_code,product_id,status) VALUES ('batch-1','B-001','yogurt','in_progress')"
        )
        self.db.execute(
            "INSERT INTO batch_losses(id,batch_id,loss_type,quantity_micros,unit_id,reason,occurred_at) "
            "VALUES ('loss-1','batch-1','process',1000000,'g','Merma de prueba','2026-10-09T10:00:00Z')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE batch_losses SET quantity_micros=2 WHERE id='loss-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM batch_losses WHERE id='loss-1'")

    def test_audit_events_are_immutable(self):
        self.db.execute(
            "INSERT INTO audit_events(id,action,entity_type,entity_id) VALUES ('a1','create','ingredient','milk')"
        )
        self.db.commit()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE audit_events SET action='erase' WHERE id='a1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM audit_events WHERE id='a1'")

    def test_finished_inventory_movements_are_immutable(self):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,quantity_delta_micros,"
            "unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('fm1','yogurt','main','production_output',1000000,500000,500000,'VES','2026-10-09T10:00:00Z','finished-1')"
        )
        self.db.commit()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE finished_inventory_movements SET quantity_delta_micros=0 WHERE id='fm1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM finished_inventory_movements WHERE id='fm1'")

    def test_approved_recipe_version_is_immutable_except_retirement(self):
        self.add_draft_recipe()
        self.approve_recipe()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE recipe_versions SET method_notes='Alterada' WHERE id='recipe-1'")
        self.db.execute("UPDATE recipe_versions SET status='retired' WHERE id='recipe-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE recipe_versions SET status='approved' WHERE id='recipe-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "cannot be deleted"):
            self.db.execute("DELETE FROM recipe_versions WHERE id='recipe-1'")

    def test_recipe_lines_are_locked_after_approval(self):
        self.add_draft_recipe()
        self.approve_recipe()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "only be changed while recipe is draft"):
            self.db.execute("UPDATE recipe_lines SET quantity_micros=600000 WHERE id='recipe-line-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "only be changed while recipe is draft"):
            self.db.execute("DELETE FROM recipe_lines WHERE id='recipe-line-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "only be changed while recipe is draft"):
            self.db.execute(
                "INSERT INTO recipe_lines(id,recipe_version_id,ingredient_id,quantity_micros,unit_id) "
                "VALUES ('recipe-line-2','recipe-1','milk',100000,'g')"
            )

    def test_recipe_approval_requires_actor_and_timestamp(self):
        self.add_draft_recipe()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "requires approver identity"):
            self.db.execute(
                "UPDATE recipe_versions SET status='approved',approved_at='2026-10-09T12:00:00Z' "
                "WHERE id='recipe-1'"
            )

    def test_approved_recipe_requires_approval_timestamp(self):
        self.add_finished_product()
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO recipe_versions(id,product_id,version_number,status,target_yield_micros,yield_unit_id) "
                "VALUES ('recipe1','yogurt',1,'approved',1000000,'unit')"
            )

    def test_invalid_negative_stock_minimum_is_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO ingredients(id,name,category,base_unit_id,minimum_stock_micros) "
                "VALUES ('bad','Inválido','dairy','g',-1)"
            )

    def test_expiry_before_receipt_is_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO inventory_lots(id,ingredient_id,location_id,received_at,declared_expiry_date,"
                "received_quantity_micros,received_unit_cost_micros,currency_code) "
                "VALUES ('badlot','milk','main','2026-10-09T10:00:00Z','2026-10-08',1,1,'VES')"
            )


    def add_format(self):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO product_formats(id,product_id,sku,label,net_quantity_micros,net_unit_id) "
            "VALUES ('format-yogurt','yogurt','YOG-200','200 g',200000000,'g')"
        )

    def add_active_pricing_policy(self):
        self.add_format()
        self.db.execute(
            "INSERT INTO product_pricing_policies(id,product_id,product_format_id,version_number,status,"
            "currency_code,target_margin_decimal,variable_fee_rate_decimal,fixed_variable_cost_micros,"
            "tax_rate_decimal,price_quantum_micros,rounding_mode,cost_basis,reason,created_by,approved_by,"
            "approved_at,effective_at) VALUES "
            "('policy-1','yogurt','format-yogurt',1,'draft','VES','0.35','0',0,'0',10000,"
            "'half_up','partial','Test policy','user-1',NULL,NULL,'2026-10-09T10:00:00Z')"
        )
        self.db.execute(
            "UPDATE product_pricing_policies SET status='active',approved_by='approver-1',"
            "approved_at='2026-10-09T10:01:00Z' WHERE id='policy-1'"
        )

    def test_pricing_policy_active_is_unique_per_format(self):
        self.add_active_pricing_policy()
        self.db.execute(
            "INSERT INTO product_pricing_policies(id,product_id,product_format_id,version_number,status,"
            "currency_code,target_margin_decimal,variable_fee_rate_decimal,fixed_variable_cost_micros,"
            "tax_rate_decimal,price_quantum_micros,rounding_mode,cost_basis,reason,effective_at) VALUES "
            "('policy-2','yogurt','format-yogurt',2,'draft','VES','0.4','0',0,'0',10000,"
            "'half_up','partial','Draft new policy','2026-10-10T10:00:00Z')"
        )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "UPDATE product_pricing_policies SET status='active',approved_by='a',"
                "approved_at='2026-10-10T10:01:00Z' WHERE id='policy-2'"
            )

    def test_active_pricing_policy_cannot_be_mutated_or_deleted(self):
        self.add_active_pricing_policy()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE product_pricing_policies SET target_margin_decimal='0.5' WHERE id='policy-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "versioned"):
            self.db.execute("DELETE FROM product_pricing_policies WHERE id='policy-1'")

    def test_active_policy_can_be_retired_without_rewriting_history(self):
        self.add_active_pricing_policy()
        self.db.execute("UPDATE product_pricing_policies SET status='retired' WHERE id='policy-1'")
        row = self.db.execute(
            "SELECT status,target_margin_decimal FROM product_pricing_policies WHERE id='policy-1'"
        ).fetchone()
        self.assertEqual(row, ("retired", "0.35"))

    def test_retirement_cannot_change_policy_fields(self):
        self.add_active_pricing_policy()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "historical fields"):
            self.db.execute(
                "UPDATE product_pricing_policies SET status='retired',target_margin_decimal='0.50' "
                "WHERE id='policy-1'"
            )

    def test_retired_pricing_policy_cannot_be_reactivated(self):
        self.add_active_pricing_policy()
        self.db.execute("UPDATE product_pricing_policies SET status='retired' WHERE id='policy-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "cannot be reactivated"):
            self.db.execute("UPDATE product_pricing_policies SET status='active' WHERE id='policy-1'")

    def test_price_snapshots_are_append_only(self):
        self.add_active_pricing_policy()
        self.db.execute(
            "INSERT INTO product_price_snapshots(id,pricing_policy_id,product_id,product_format_id,"
            "currency_code,unit_cost_micros,target_margin_decimal,variable_fee_rate_decimal,"
            "fixed_variable_cost_micros,tax_rate_decimal,net_price_micros,customer_price_micros,"
            "contribution_micros,cost_completeness,calculation_version,effective_at,idempotency_key) "
            "VALUES ('price-1','policy-1','yogurt','format-yogurt','VES',820000000,'0.35','0',0,'0',"
            "1261540000,1261540000,441540000,'partial','pricing-v1','2026-10-09T10:02:00Z','price-key-1')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE product_price_snapshots SET net_price_micros=1 WHERE id='price-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM product_price_snapshots WHERE id='price-1'")

    def add_rate_observation(self, observation_id="bcv-eur"):
        self.db.execute(
            "INSERT INTO exchange_rate_observations(id,provider,base_currency,quote_currency,rate_decimal,"
            "quote_side,observation_kind,observation_count,aggregation_method,source_url,observed_at,fetched_at) "
            "VALUES (?, 'bcv','EUR','VES','42.50','official','official_reference',1,'official',"
            "'https://www.bcv.org.ve/','2026-10-09T10:00:00Z','2026-10-09T10:00:05Z')",
            (observation_id,),
        )

    def test_exchange_rate_observations_are_immutable(self):
        self.add_rate_observation()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE exchange_rate_observations SET rate_decimal='43' WHERE id='bcv-eur'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("DELETE FROM exchange_rate_observations WHERE id='bcv-eur'")

    def test_exchange_rate_policy_requires_approval_and_is_unique_by_purpose_scope(self):
        self.db.execute(
            "INSERT INTO exchange_rate_policies(id,purpose,scope_key,provider,base_currency,quote_currency,"
            "quote_side,selection_mode,max_age_seconds,status,reason,approved_by,approved_at,effective_at) "
            "VALUES ('cost-rate','cost_conversion','global','bcv','EUR','VES','official',"
            "'latest_eligible',86400,'active','Prueba','admin','2026-10-09T10:00:00Z','2026-10-09T10:00:00Z')"
        )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO exchange_rate_policies(id,purpose,scope_key,provider,base_currency,quote_currency,"
                "quote_side,selection_mode,max_age_seconds,status,reason,approved_by,approved_at,effective_at) "
                "VALUES ('cost-rate-2','cost_conversion','global','binance_p2p','USDT','VES','usdt_buy',"
                "'latest_eligible',900,'active','Segunda política','admin','2026-10-09T10:00:00Z',"
                "'2026-10-09T10:00:00Z')"
            )
        self.db.execute(
            "INSERT INTO exchange_rate_policies(id,purpose,scope_key,provider,base_currency,quote_currency,"
            "quote_side,selection_mode,max_age_seconds,status,reason,approved_by,approved_at,effective_at) "
            "VALUES ('sale-rate','sale_pricing','global','binance_p2p','USDT','VES','usdt_sell',"
            "'latest_eligible',900,'active','Tasa de venta independiente','admin',"
            "'2026-10-09T10:00:00Z','2026-10-09T10:00:00Z')"
        )

    def test_exchange_rate_policy_retirement_cannot_rewrite_history(self):
        self.db.execute(
            "INSERT INTO exchange_rate_policies(id,purpose,scope_key,provider,base_currency,quote_currency,"
            "quote_side,selection_mode,max_age_seconds,status,reason,approved_by,approved_at,effective_at) "
            "VALUES ('rate-policy','cost_conversion','global','bcv','EUR','VES','official',"
            "'latest_eligible',86400,'active','Original','admin','2026-10-09T10:00:00Z','2026-10-09T10:00:00Z')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "rewrite its history"):
            self.db.execute(
                "UPDATE exchange_rate_policies SET status='retired',provider='manual' WHERE id='rate-policy'"
            )
        self.db.execute("UPDATE exchange_rate_policies SET status='retired' WHERE id='rate-policy'")
        row = self.db.execute(
            "SELECT status,provider,reason FROM exchange_rate_policies WHERE id='rate-policy'"
        ).fetchone()
        self.assertEqual(row, ("retired", "bcv", "Original"))

    def test_retired_exchange_rate_policy_cannot_be_reactivated(self):
        self.db.execute(
            "INSERT INTO exchange_rate_policies(id,purpose,scope_key,provider,base_currency,quote_currency,"
            "quote_side,selection_mode,max_age_seconds,status,reason,approved_by,approved_at,effective_at) "
            "VALUES ('retired-rate','cost_conversion','global','bcv','EUR','VES','official',"
            "'latest_eligible',86400,'active','Original','admin','2026-10-09T10:00:00Z','2026-10-09T10:00:00Z')"
        )
        self.db.execute("UPDATE exchange_rate_policies SET status='retired' WHERE id='retired-rate'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "cannot be reactivated"):
            self.db.execute("UPDATE exchange_rate_policies SET status='active' WHERE id='retired-rate'")

    def test_exchange_rate_application_is_immutable_and_idempotent(self):
        self.add_rate_observation()
        self.db.execute(
            "INSERT INTO exchange_rate_applications(id,observation_id,purpose,entity_type,entity_id,"
            "original_amount_micros,original_currency,rate_decimal,converted_amount_micros,"
            "converted_currency,rounding_rule,applied_at,idempotency_key) VALUES "
            "('conversion-1','bcv-eur','cost_conversion','manual_scenario','scenario-1',1000000,"
            "'EUR','42.50',42500000,'VES','half_up_2dp','2026-10-09T10:01:00Z','conversion-key-1')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "immutable"):
            self.db.execute("UPDATE exchange_rate_applications SET converted_amount_micros=1 WHERE id='conversion-1'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO exchange_rate_applications(id,observation_id,purpose,entity_type,entity_id,"
                "original_amount_micros,original_currency,rate_decimal,converted_amount_micros,"
                "converted_currency,rounding_rule,applied_at,idempotency_key) VALUES "
                "('conversion-2','bcv-eur','cost_conversion','manual_scenario','scenario-2',1000000,"
                "'EUR','42.50',42500000,'VES','half_up_2dp','2026-10-09T10:01:00Z','conversion-key-1')"
            )


    def add_production_batch(self, batch_id="batch-1"):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO production_batches(id,batch_code,product_id) VALUES (?,?,'yogurt')",
            (batch_id, f"CODE-{batch_id}"),
        )

    def complete_production_batch(self, batch_id="batch-1"):
        self.db.execute(
            "UPDATE production_batches SET status='in_progress',started_at='2026-10-09T10:00:00Z' WHERE id=?",
            (batch_id,),
        )
        self.db.execute(
            "UPDATE production_batches SET status='completed',completed_at='2026-10-09T11:00:00Z',"
            "saleable_quantity_micros=1000000,total_cost_micros=500000 WHERE id=?",
            (batch_id,),
        )

    def test_inventory_movement_reversal_must_be_exact_opposite(self):
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('im-original','milk','lot1','main','receipt',1000000,1250000,1250000,'VES',"
            "'2026-10-09T10:00:00Z','im-key-1')"
        )
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,"
            "idempotency_key,reverses_movement_id) VALUES ('im-reversal','milk','lot1','main','reversal',"
            "-1000000,1250000,1250000,'VES','2026-10-09T11:00:00Z','im-key-2','im-original')"
        )
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('im-extra-stock','milk','lot1','main','receipt',1000000,1250000,1250000,'VES',"
            "'2026-10-09T11:30:00Z','im-key-extra')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "invalid inventory movement reversal"):
            self.db.execute(
                "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,"
                "idempotency_key,reverses_movement_id) VALUES ('im-bad-reversal','milk','lot1','main','reversal',"
                "-500000,1250000,1250000,'VES','2026-10-09T12:00:00Z','im-key-3','im-original')"
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,"
                "idempotency_key,reverses_movement_id) VALUES ('im-second-reversal','milk','lot1','main','reversal',"
                "-1000000,1250000,1250000,'VES','2026-10-09T12:00:00Z','im-key-4','im-original')"
            )

    def test_reversal_reference_requires_reversal_type(self):
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('im-original','milk','lot1','main','receipt',1000000,1250000,1250000,'VES',"
            "'2026-10-09T10:00:00Z','im-key-1')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "invalid inventory movement reversal"):
            self.db.execute(
                "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,"
                "idempotency_key,reverses_movement_id) VALUES ('im-not-reversal','milk','lot1','main','receipt',"
                "-1000000,1250000,1250000,'VES','2026-10-09T11:00:00Z','im-key-2','im-original')"
            )

    def test_finished_movement_reversal_must_match_original(self):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,quantity_delta_micros,"
            "unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) VALUES "
            "('fm-original','yogurt','main','production_output',1000000,500000,500000,'VES',"
            "'2026-10-09T10:00:00Z','fm-key-1')"
        )
        self.db.execute(
            "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,quantity_delta_micros,"
            "unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key,reverses_movement_id) VALUES "
            "('fm-reversal','yogurt','main','reversal',-1000000,500000,500000,'VES',"
            "'2026-10-09T11:00:00Z','fm-key-2','fm-original')"
        )
        self.db.execute(
            "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,quantity_delta_micros,"
            "unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) VALUES "
            "('fm-extra-stock','yogurt','main','production_output',1000000,500000,500000,'VES',"
            "'2026-10-09T11:30:00Z','fm-key-extra')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "invalid finished movement reversal"):
            self.db.execute(
                "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,quantity_delta_micros,"
                "unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key,reverses_movement_id) VALUES "
                "('fm-bad-reversal','yogurt','main','reversal',-500000,500000,500000,'VES',"
                "'2026-10-09T12:00:00Z','fm-key-3','fm-original')"
            )

    def test_completed_production_batch_is_immutable(self):
        self.add_production_batch()
        self.complete_production_batch()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "completed or cancelled production batches are immutable"):
            self.db.execute("UPDATE production_batches SET notes='late edit' WHERE id='batch-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "completed or cancelled production batches are immutable"):
            self.db.execute("UPDATE production_batches SET status='in_progress' WHERE id='batch-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "cannot be deleted"):
            self.db.execute("DELETE FROM production_batches WHERE id='batch-1'")

    def test_invalid_production_batch_transition_is_rejected(self):
        self.add_production_batch()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "invalid production batch status transition"):
            self.db.execute(
                "UPDATE production_batches SET status='completed',started_at='2026-10-09T10:00:00Z',"
                "completed_at='2026-10-09T11:00:00Z',saleable_quantity_micros=1,total_cost_micros=1 "
                "WHERE id='batch-1'"
            )

    def test_batch_loss_cannot_be_added_after_completion(self):
        self.add_production_batch()
        self.complete_production_batch()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "batch losses require an in-progress batch"):
            self.db.execute(
                "INSERT INTO batch_losses(id,batch_id,loss_type,quantity_micros,unit_id,reason,occurred_at) "
                "VALUES ('late-loss','batch-1','process',100,'g','Late correction','2026-10-09T12:00:00Z')"
            )

    def test_batch_can_be_paused_and_resumed_before_completion(self):
        self.add_production_batch()
        self.db.execute("UPDATE production_batches SET status='in_progress' WHERE id='batch-1'")
        self.db.execute("UPDATE production_batches SET status='on_hold' WHERE id='batch-1'")
        self.db.execute("UPDATE production_batches SET status='in_progress' WHERE id='batch-1'")
        self.assertEqual(
            self.db.execute("SELECT status FROM production_batches WHERE id='batch-1'").fetchone()[0],
            "in_progress",
        )



    def test_inventory_movement_cannot_make_location_balance_negative(self):
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('stock-in','milk','lot1','main','receipt',100,1,100,'VES','2026-10-09T10:00:00Z','stock-in-key')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "negative balance"):
            self.db.execute(
                "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
                "VALUES ('stock-out','milk','lot1','main','production_consumption',-101,1,101,'VES',"
                "'2026-10-09T11:00:00Z','stock-out-key')"
            )

    def test_inventory_movement_cannot_overdraw_specific_lot(self):
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('lot-in','milk','lot1','main','receipt',100,1,100,'VES','2026-10-09T10:00:00Z','lot-in-key')"
        )
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('untracked-in','milk',NULL,'main','opening_balance',100,1,100,'VES',"
            "'2026-10-09T10:01:00Z','untracked-in-key')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "lot movement would create a negative balance"):
            self.db.execute(
                "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
                "VALUES ('lot-overdraw','milk','lot1','main','production_consumption',-150,1,150,'VES',"
                "'2026-10-09T11:00:00Z','lot-overdraw-key')"
            )

    def test_finished_inventory_movement_cannot_make_balance_negative(self):
        self.add_finished_product()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "finished inventory movement would create a negative balance"):
            self.db.execute(
                "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
                "VALUES ('sale-without-stock','yogurt','main','sale',-1,500000,500000,'VES',"
                "'2026-10-09T10:00:00Z','sale-without-stock-key')"
            )



    def test_inventory_balance_is_not_partitioned_by_cost_currency(self):
        self.db.execute(
            "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
            "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
            "VALUES ('usd-stock','milk','lot1','main','receipt',100,1,100,'USD','2026-10-09T10:00:00Z','usd-stock-key')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "negative balance"):
            self.db.execute(
                "INSERT INTO inventory_movements(id,ingredient_id,lot_id,location_id,movement_type,"
                "quantity_delta_micros,unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) "
                "VALUES ('ves-issue','milk','lot1','main','production_consumption',-101,1,101,'VES',"
                "'2026-10-09T11:00:00Z','ves-issue-key')"
            )

    def test_finished_balance_is_not_partitioned_by_cost_currency(self):
        self.add_finished_product()
        self.db.execute(
            "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,quantity_delta_micros,"
            "unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) VALUES "
            "('usd-finished-stock','yogurt','main','production_output',100,1,100,'USD',"
            "'2026-10-09T10:00:00Z','usd-finished-stock-key')"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "negative balance"):
            self.db.execute(
                "INSERT INTO finished_inventory_movements(id,product_id,location_id,movement_type,quantity_delta_micros,"
                "unit_cost_micros,total_cost_micros,currency_code,occurred_at,idempotency_key) VALUES "
                "('ves-finished-sale','yogurt','main','sale',-101,1,101,'VES',"
                "'2026-10-09T11:00:00Z','ves-finished-sale-key')"
            )


if __name__ == "__main__":
    unittest.main()

