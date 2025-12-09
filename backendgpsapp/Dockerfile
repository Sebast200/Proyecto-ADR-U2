# Etapa 1: Instalación de dependencias
FROM node:18-alpine AS dependencies

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /usr/src/app

# Copiar solo los archivos de dependencias primero (mejor cache)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev --silent

# Etapa 2: Runtime
FROM node:18-alpine AS runtime

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /usr/src/app

# Copiar solo node_modules de producción desde la etapa anterior
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copiar archivos de package para referencia
COPY package*.json ./

# Copiar código fuente de la aplicación
COPY . .

# Dar permisos al usuario no privilegiado
RUN chown -R appuser:appuser /usr/src/app

# Cambiar a usuario no privilegiado
USER appuser

EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
