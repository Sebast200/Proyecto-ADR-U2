# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias y construir
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Etapa 2: Producción con Nginx Alpine
FROM nginx:alpine

# Crear usuario no privilegiado para nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -u 1001 -S nginx-user -G nginx-user

# Copiar build a Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Dar permisos al usuario no privilegiado
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Cambiar a usuario no privilegiado
USER nginx-user

# Exponer puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]