# Backup automático de base de datos (db_replica)

## 🧩 Descripción
Este sistema crea un **backup diario** de la base de datos `db_replica` y conserva los últimos 7 días.

## 📁 Archivos
| Archivo | Descripción |
|----------|-------------|
| `backup-db.sh` | Realiza el backup de la base de datos `db_replica`. |
| `restore-db.sh` | Restaura un archivo `.sql` previamente generado. |
| `README.md` | Este archivo. |

## 🕐 Cronjob
El servicio `db_backup` ejecuta un backup automático todos los días a las **02:00 AM**.

## 🔧 Ejecución manual
Ejecutar backup manual:
```bash
docker exec -it db_backup sh /backup/backup-db.sh

Restaurar backup:

docker exec -it db_backup sh /backup/restore-db.sh /backup/db_backups/db_replica_backup_YYYY-MM-DD_HH-MM.sql

---

# 🐳 Modificación en `docker-compose.yml`
Actualiza **solo tu servicio `db_backup`** con esto 👇:

```yaml
  db_backup:
    image: postgres:15-alpine
    container_name: db_backup
    depends_on:
      - db_replica
    volumes:
      - ./scripts/backup:/backup
    environment:
      - PGPASSWORD=example
    entrypoint: ["/bin/sh", "-c"]
    command: >
      "echo '0 2 * * * /backup/backup-db.sh' | crontab - &&
       crond -f -L /dev/stdout"

## Revisar datos de los backups en una base de datos de prueba

docker run --rm -d --name db_verify -e POSTGRES_PASSWORD=example -v ./scripts/backup/db_backups:/backup postgres:15-alpine

docker exec -i db_verify psql -U postgres -d postgres -f /backup/db_replica_backup_2025-11-09_22-30.sql

docker exec -it db_verify psql -U postgres -d postgres

Revisar contenido

docker rm -f db_verify
