-- init.sql: crea la tabla para guardar ubicaciones
CREATE TABLE IF NOT EXISTS locations (
  entry_id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
