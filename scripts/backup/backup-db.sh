#!/bin/sh
# =====================================================
# Backup automático de base de datos db_replica
# =====================================================

set -e
BACKUP_DIR="/backup/db_backups"
mkdir -p "$BACKUP_DIR"

# Nombre del archivo de backup
BACKUP_FILE="$BACKUP_DIR/db_replica_backup_$(date +%F_%H-%M).sql"

echo "🗄️ Iniciando backup de db_replica..."
pg_dump -U postgres -h db_replica -d postgres -F p > "$BACKUP_FILE"
echo "✅ Backup completado: $BACKUP_FILE"

# Mantener solo los últimos 7 días de backups
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -exec rm -f {} \;
echo "🧹 Limpieza completada: se eliminaron backups de más de 7 días."
