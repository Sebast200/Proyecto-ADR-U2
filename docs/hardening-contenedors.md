# Hardening de contenedores

Basado en el historial de cambios del proyecto, aquí está el resumen de las tres medidas de seguridad implementadas:

---

## 1. Usuarios No Privilegiados

### Implementación:
Se configuraron los contenedores para ejecutarse con usuarios restringidos en lugar de root:

**Contenedores configurados:**
- **Frontend (frontend1/frontend2)**: Usuario `nginx-user` (UID 1001) - definido en el Dockerfile personalizado
- **Backend Node.js (backendgpsapp1/backendgpsapp2)**: Usuario `node` (UID 1000)
- **Backend Spring (backend2)**: Usuario no privilegiado (UID 1000)

**Excepción justificada:**
- **nginx_lb**: Se mantuvo como root porque usa la imagen oficial de nginx que requiere permisos elevados para configuración inicial
- **Bases de datos (PostgreSQL)**: Permanecen con sus configuraciones por defecto que ya manejan usuarios internos apropiados

---

## 2. Versiones Específicas de Imágenes

### Problema inicial:
El contenedor `docker_stats_exporter` usaba la tag `:latest`

### Intento de solución:
Se intentó cambiar a la versión específica `v0.5.0`:
```yaml
wywywywy/docker_stats_exporter:v0.5.0
```
Pero la version propuesta no existía, ni se logró encontrar alguna versión funcional de una imagen de docker_stats_exporter

---

## 3. 🏗️ Multi-Stage Builds

### Estado inicial:
- ✅ **Frontend**: Ya implementado (Node.js → Nginx)
- ✅ **Backend Spring (backend2)**: Ya implementado (Maven → JRE)
- ❌ **Backend Node.js (backendgpsapp)**: Single-stage build

### Implementación en backendgpsapp:

**Nueva estructura del Dockerfile:**
```dockerfile
# Etapa 1: Dependencies
FROM node:18-alpine AS dependencies
# Instala solo dependencias de producción con npm ci --omit=dev

# Etapa 2: Runtime
FROM node:18-alpine AS runtime
# Copia node_modules optimizados de la etapa anterior
# Configura usuario no privilegiado (1001)
# Solo incluye archivos necesarios para ejecución
```

### Beneficios obtenidos:

| Aspecto | Mejora |
|---------|--------|
| **Tamaño imagen** | 135 MB (optimizado, sin devDependencies) |
| **Seguridad** | Solo dependencias de producción garantizadas |
| **Cache** | Dependencias se cachean independientemente del código |
| **Velocidad builds** | Builds subsecuentes significativamente más rápidos |

### Verificación:
- ✅ Ambos backends (backendgpsapp1 y backendgpsapp2) se reconstruyeron exitosamente
- ✅ Endpoints de salud respondiendo correctamente
- ✅ Todos los contenedores de aplicación ahora usan multi-stage builds

---

