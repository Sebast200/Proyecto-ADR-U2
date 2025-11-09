#!/bin/sh
# =====================================================
# Restaurar backup en db_replica
# =====================================================

set -e

if [ -z "$1" ]; then
  echo "❌ Uso: sh restore-db.sh /backup/db_backups/archivo.sql"
  exit 1
fi

BACKUP_FILE="$1"
echo "🔄 Restaurando backup desde $BACKUP_FILE..."

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ El archivo $BACKUP_FILE no existe."
  exit 1
fi

psql -U postgres -h db_replica -d postgres -f "$BACKUP_FILE"
echo "✅ Restauración completada correctamente."
