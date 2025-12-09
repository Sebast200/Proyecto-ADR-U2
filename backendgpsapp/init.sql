-- init.sql: crea la tabla para guardar ubicaciones y el usuario con permisos mínimos

-- Crear la tabla
CREATE TABLE IF NOT EXISTS locations (
  entry_id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear usuario gpsuser si no existe
-- Nota: la creación del usuario y la contraseña se realiza desde
-- el script de inicialización `01-create-gpsuser.sh` para no
-- mantener contraseñas en texto plano dentro de este archivo.

-- ==============================================================================
-- SEGURIDAD: Permisos mínimos necesarios para la aplicación
-- El usuario gpsuser SOLO puede:
--   - Conectar a la base de datos (CONNECT)
--   - Usar el esquema public (USAGE)
--   - Realizar CRUD en tabla locations (SELECT, INSERT, UPDATE, DELETE)
--   - Usar secuencias de SERIAL
-- El usuario gpsuser NO PUEDE:
--   - Crear o eliminar bases de datos (DROP)
--   - Crear o eliminar usuarios (CREATE USER)
--   - Otorgar permisos (GRANT)
--   - Crear o alterar tablas
-- ==============================================================================

-- Permiso para usar el esquema public
GRANT USAGE ON SCHEMA public TO gpsuser;

-- Permisos sobre la tabla locations (CRUD básico solamente)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE locations TO gpsuser;

-- Permiso para usar la secuencia del SERIAL (entry_id)
GRANT USAGE, SELECT ON SEQUENCE locations_entry_id_seq TO gpsuser;

-- Revocar permisos administrativos explícitamente
REVOKE CREATE ON SCHEMA public FROM gpsuser;
REVOKE CREATE ON DATABASE postgres FROM gpsuser;
