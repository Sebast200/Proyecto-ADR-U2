#!/bin/sh
set -e

# Script de inicialización para crear el usuario gpsuser usando Docker secrets
# Este script se ejecuta durante el arranque del contenedor Postgres si se monta
# dentro de /docker-entrypoint-initdb.d/ (se ejecuta antes de los .sql en orden alfabético).

# Obtener contraseña desde secret o variable de entorno
if [ -f "/run/secrets/db_password" ]; then
  PWD=$(cat /run/secrets/db_password)
elif [ -n "$POSTGRES_PASSWORD" ]; then
  PWD="$POSTGRES_PASSWORD"
else
  echo "Secreto db_password no encontrado y POSTGRES_PASSWORD no está definido"
  exit 1
fi

# Validar que la contraseña tenga al menos 12 caracteres
PWD_LEN=$(echo -n "$PWD" | wc -c)
if [ "$PWD_LEN" -lt 12 ]; then
  echo "ERROR: La contraseña debe tener al menos 12 caracteres (actual: $PWD_LEN)"
  exit 1
fi

# Usar psql con el usuario administrador (POSTGRES_USER)
# Se usa el método de autenticación SCRAM-SHA-256 (más seguro que MD5)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-SQL
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'gpsuser') THEN
    CREATE USER gpsuser WITH ENCRYPTED PASSWORD '$PWD';
  END IF;
END
$$;
SQL

exit 0
