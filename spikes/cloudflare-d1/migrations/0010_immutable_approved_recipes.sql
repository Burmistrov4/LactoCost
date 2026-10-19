-- 0010_immutable_approved_recipes.sql
-- An approved recipe is historical costing evidence; freeze it and its lines.
-- Draft recipes remain editable. Retirement is allowed once and cannot rewrite fields.

CREATE TRIGGER IF NOT EXISTS recipe_versions_approval_requires_actor_insert
BEFORE INSERT ON recipe_versions
WHEN NEW.status = 'approved'
  AND (NEW.approved_by IS NULL OR trim(NEW.approved_by) = '' OR NEW.approved_at IS NULL)
BEGIN
  SELECT RAISE(ABORT, 'approved recipe requires approver identity and timestamp');
END;

CREATE TRIGGER IF NOT EXISTS recipe_versions_approval_requires_actor_update
BEFORE UPDATE ON recipe_versions
WHEN NEW.status = 'approved'
  AND (NEW.approved_by IS NULL OR trim(NEW.approved_by) = '' OR NEW.approved_at IS NULL)
BEGIN
  SELECT RAISE(ABORT, 'approved recipe requires approver identity and timestamp');
END;

CREATE TRIGGER IF NOT EXISTS recipe_versions_approved_immutable
BEFORE UPDATE ON recipe_versions
WHEN OLD.status <> 'draft'
  AND NOT (
    OLD.status = 'approved' AND NEW.status = 'retired'
    AND NEW.id IS OLD.id
    AND NEW.product_id IS OLD.product_id
    AND NEW.version_number IS OLD.version_number
    AND NEW.target_yield_micros IS OLD.target_yield_micros
    AND NEW.yield_unit_id IS OLD.yield_unit_id
    AND NEW.method_notes IS OLD.method_notes
    AND NEW.evidence_status IS OLD.evidence_status
    AND NEW.approved_by IS OLD.approved_by
    AND NEW.approved_at IS OLD.approved_at
    AND NEW.created_at IS OLD.created_at
  )
BEGIN
  SELECT RAISE(ABORT, 'approved or retired recipe versions are immutable; create a new version');
END;

CREATE TRIGGER IF NOT EXISTS recipe_versions_no_delete_after_draft
BEFORE DELETE ON recipe_versions
WHEN OLD.status <> 'draft'
BEGIN
  SELECT RAISE(ABORT, 'approved or retired recipe versions cannot be deleted');
END;

CREATE TRIGGER IF NOT EXISTS recipe_lines_insert_draft_only
BEFORE INSERT ON recipe_lines
WHEN NOT EXISTS (
  SELECT 1 FROM recipe_versions WHERE id = NEW.recipe_version_id AND status = 'draft'
)
BEGIN
  SELECT RAISE(ABORT, 'recipe lines can only be changed while recipe is draft');
END;

CREATE TRIGGER IF NOT EXISTS recipe_lines_update_draft_only
BEFORE UPDATE ON recipe_lines
WHEN NOT EXISTS (
  SELECT 1 FROM recipe_versions WHERE id = OLD.recipe_version_id AND status = 'draft'
) OR NOT EXISTS (
  SELECT 1 FROM recipe_versions WHERE id = NEW.recipe_version_id AND status = 'draft'
)
BEGIN
  SELECT RAISE(ABORT, 'recipe lines can only be changed while recipe is draft');
END;

CREATE TRIGGER IF NOT EXISTS recipe_lines_delete_draft_only
BEFORE DELETE ON recipe_lines
WHEN NOT EXISTS (
  SELECT 1 FROM recipe_versions WHERE id = OLD.recipe_version_id AND status = 'draft'
)
BEGIN
  SELECT RAISE(ABORT, 'recipe lines can only be changed while recipe is draft');
END;
