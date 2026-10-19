-- Solo para comprobar migraciones y compatibilidad SQLite/D1.
-- No contiene datos del negocio ni debe utilizarse como esquema de producción.
CREATE TABLE IF NOT EXISTS spike_probe (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL CHECK (length(label) BETWEEN 1 AND 40),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
