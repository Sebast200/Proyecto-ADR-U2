FROM node:18-alpine

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /usr/src/app

# Install dependencies (only production dependencies)
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Dar permisos al usuario no privilegiado
RUN chown -R appuser:appuser /usr/src/app

# Cambiar a usuario no privilegiado
USER appuser

EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
