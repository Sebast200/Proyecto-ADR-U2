#!/bin/bash

# Script de generación de certificados SSL autofirmados
# Proyecto: Sistema de Monitoreo y Gestión de Flota GPS
# Uso: ./generate-certs.sh [días_validez]

set -e

# Configuración
CERT_DIR="../../nginx/certs"
DAYS_VALID="${1:-365}"  # Por defecto 365 días (1 año)
COUNTRY="CL"
STATE="Region Metropolitana"
CITY="Santiago"
ORG="Sistema GPS Flota"
ORG_UNIT="IT Department"
COMMON_NAME="localhost"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Generador de Certificados SSL${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar si OpenSSL está instalado
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}Error: OpenSSL no está instalado${NC}"
    echo "Instálalo con: sudo apt-get install openssl"
    exit 1
fi

# Crear directorio si no existe
mkdir -p "$CERT_DIR"

# Backup de certificados existentes
if [ -f "$CERT_DIR/cert.pem" ]; then
    echo -e "${YELLOW}⚠ Certificados existentes encontrados${NC}"
    BACKUP_DIR="$CERT_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    mv "$CERT_DIR/cert.pem" "$BACKUP_DIR/" 2>/dev/null || true
    mv "$CERT_DIR/key.pem" "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓ Backup guardado en: $BACKUP_DIR${NC}"
fi

# Generar clave privada RSA de 4096 bits
echo -e "${YELLOW}→ Generando clave privada RSA (4096 bits)...${NC}"
openssl genrsa -out "$CERT_DIR/key.pem" 4096

# Generar certificado autofirmado
echo -e "${YELLOW}→ Generando certificado autofirmado (válido por $DAYS_VALID días)...${NC}"
MSYS_NO_PATHCONV=1 openssl req -new -x509 -sha256 \
    -key "$CERT_DIR/key.pem" \
    -out "$CERT_DIR/cert.pem" \
    -days "$DAYS_VALID" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$ORG_UNIT/CN=$COMMON_NAME"

# Establecer permisos seguros
chmod 600 "$CERT_DIR/key.pem"
chmod 644 "$CERT_DIR/cert.pem"

# Mostrar información del certificado
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Certificados generados exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Ubicación:${NC} $CERT_DIR"
echo -e "${YELLOW}Validez:${NC} $DAYS_VALID días (hasta $(date -d "+$DAYS_VALID days" +%Y-%m-%d 2>/dev/null || date -v +${DAYS_VALID}d +%Y-%m-%d 2>/dev/null))"
echo ""

# Mostrar detalles del certificado
echo -e "${YELLOW}Detalles del certificado:${NC}"
openssl x509 -in "$CERT_DIR/cert.pem" -noout -subject -issuer -dates

echo ""
echo -e "${GREEN}Para aplicar los cambios:${NC}"
echo "  1. Reinicia el contenedor nginx: ${YELLOW}docker compose restart nginx_lb${NC}"
echo "  2. Accede a: ${YELLOW}https://localhost:443${NC}"
echo ""
echo -e "${YELLOW}Nota:${NC} Los navegadores mostrarán advertencia de seguridad"
echo "      porque el certificado es autofirmado. Esto es normal."
echo ""
