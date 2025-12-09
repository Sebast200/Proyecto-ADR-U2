#!/bin/sh
# =====================================================
# Backup automático de base de datos db_replica
# =====================================================

# Utilizamos el logger de la base de datos para registrar la acción
LOG_MESSAGE="EVENT_CONFIG:DB_BACKUP_START - Starting scheduled backup of db_replica."
echo "$LOG_MESSAGE" | tee /dev/stderr

set -e
BACKUP_DIR="/backup/db_backups"
mkdir -p "$BACKUP_DIR"

# Nombre del archivo de backup
BACKUP_FILE="$BACKUP_DIR/db_replica_backup_$(date +%F_%H-%M).sql"

echo "🗄️ Iniciando backup de db_replica..."
pg_dump -U postgres -h db_replica -d postgres -F p > "$BACKUP_FILE"

LOG_MESSAGE="EVENT_CONFIG:DB_BACKUP_SUCCESS - Backup completed: $BACKUP_FILE"
echo "$LOG_MESSAGE" | tee /dev/stderr

# Mantener solo los últimos 7 días de backups
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -exec rm -f {} \;
LOG_MESSAGE="EVENT_CONFIG:DB_CLEANUP_SUCCESS - Cleanup completed. Old backups deleted."
echo "$LOG_MESSAGE" | tee /dev/stderr