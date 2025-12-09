# Hardening base de datos gps
## Medidas de seguridad aplicadas
- **Contraseñas de 12 caracteres**
Se implento un pequeño bloque de código al momento de crear un usuario para conectarse a la base de datos en el archivo/script `backendgpsapp/01-create-gpsuser.sh`
```bash
# Validar que la contraseña tenga al menos 12 caracteres
PWD_LEN=$(echo -n "$PWD" | wc -c)
if [ "$PWD_LEN" -lt 12 ]; then
  echo "ERROR: La contraseña debe tener al menos 12 caracteres (actual: $PWD_LEN)"
  exit 1
fi
```
- **Método de autenticación seguro**
Implemnetación de medida de autenticación scram-sha-256 dentro de postgres, dentro del buildeo en el archivo docker-compose
```yaml
command:
  - "postgres"
  - "-c"
  - "password_encryption=scram-sha-256"
```

- **Uso de docker secrets para las credenciales de la base de datos**
Se creó una rutas para las credenciales de conexión hacia la base de datos en `secrets/`

- **Variables de entorno no harcodeadas**
Todas la variables de entorno se encuentran distribuidas entre el archivo no publico `.env` y la ruta `secrets/`

- **Aislamiento de red**
La base de datos solo se encuentra disponible en la red interna de docker `dbgps` a la cual solo tiene acceso el contenedor `db`, `backend1`, `backend1_replica' y `adminer`, además de no tener puertos expuestos.


## Gestión de usuarios y permisos

Para la conexión a la base de datos se creó un único usuario con permisos mínimos para la conexión del backend hacia la base de datos en el archivo `backendgpsapp/init.sql`
```sql
-- Permisos sobre la tabla locations (CRUD básico solamente)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE locations TO gpsuser;

-- Permiso para usar la secuencia del SERIAL (entry_id)
GRANT USAGE, SELECT ON SEQUENCE locations_entry_id_seq TO gpsuser;
```

```sql
-- Revocar permisos administrativos explícitamente
REVOKE CREATE ON SCHEMA public FROM gpsuser;
REVOKE CREATE ON DATABASE postgres FROM gpsuser;
```

## Logging y auditoría
Comandos explícitos en el docker compose para la visualización de los logs de conexión, des conexión e intentos de conexión fallidos

```yaml
command:
  - "-c"
  - "log_connections=on"
  - "-c"
  - "log_disconnections=on"
  - "-c"
  - "log_failed_authentication_attempts=on"
  - "-c"
  - "log_statement=all"
  - "-c"
  - "log_min_error_statement=info"
```
