# Sistema de Monitoreo y Gestión de Flota GPS

## 1. Descripción General

### Licitación elegida: Servicio monitoreo GPS y gestión de flota

**El sistema desarrollado responde a la necesidad institucional de monitorear en tiempo real la ubicación y estado de los vehículos, optimizando el uso de recursos y garantizando la seguridad operacional.
Las principales funcionalidades incluyen:**
- Monitoreo en tiempo real.
- Historial de recorrido.
- Alertas automáticas.
- Reportes automáticos.
- Gestión de usuarios y roles.
- Análisis y soporte.
- Tecnologías y requerimientos. 

****Integrantes del equipo:****
- Sebastián Carlos
- Alexis Ferghman
- Luis González

---

## 2. Arquitectura del Sistema

### Diagrama de Arquitectura

![holi](infrastructure/diagramas/Diagrama1.drawio.png)

### Servicios

| Servicio | Función |
|----------|---------|
| **frontend1** | Interfaz principal de usuario. Monitoreo GPS en tiempo real, gestión de usuarios, reportes y mapas interactivos. |
| **frontend2** | Instancia réplica del frontend para alta disponibilidad. |
| **nginx_lb** | Balanceador de carga Nginx. Distribuye tráfico HTTP entre frontend1 y frontend2.|
| **backend1 (backendgpsapp1)** | API REST para recepción y consulta de coordenadas GPS.|
| **backend1_replica (backendgpsapp2)** | Réplica del backend GPS para alta disponibilidad y balanceo de carga |
| **backend2** | API REST principal. Gestión de usuarios, vehículos, reportes y autenticación. |
| **db (PostgreSQL Principal)** | Base de datos principal. Almacena usuarios, vehículos, ubicaciones GPS y reportes. |
| **db_replica** | Base de datos réplica con replicación lógica. Permite lectura distribuida y backup en tiempo real. |
| **db_sync** | Sincronizador automático que replica datos desde `db_replica` hacia Supabase (nube) cada 60 segundos. Sincroniza tablas: users, vehiculo, reportes, reporte_eventualidad |
| **db_backup** | Servicio de backup automatizado con cron. Ejecuta backup completo diariamente a las 2:00 AM. |
| **adminer** | Interfaz web para administración de base de datos PostgreSQL. Permite ejecutar queries, ver tablas, exportar datos. |
| **prometheus** | Sistema de monitoreo y alertas. Recolecta métricas de todos los servicios cada 5 segundos. |
| **grafana** | Plataforma de visualización. Dashboards para métricas de CPU, RAM, red, estado de contenedores. |
| **node_exporter** | Exportador de métricas del sistema host (CPU, memoria, disco, red). |
| **docker_stats_exporter** | Exportador de estadísticas de contenedores Docker (uso de recursos por contenedor). |
| **db_watcher** | Monitor automático que verifica cada 30s el estado de `db_replica`. Si está caído, lo reinicia. |
| **frontend_watcher** | Monitor automático que verifica cada 30s el estado de `frontend1`. Si esta caído lo reinicia. |

### Tecnologías Utilizadas

- React 19.2.0: Framework moderno para interfaces reactivas. Componentes reutilizables y virtual DOM para renderizado eficiente.
- React Router 7.9.5: Navegación SPA (Single Page Application) sin recargas de página.
- Leaflet 1.9.4: Librería de mapas interactivos open-source. Ligera y flexible para visualización GPS.
- Axios 1.13.1: Cliente HTTP para consumir APIs REST. Manejo automático de promesas y errores.
- Nginx Alpine: Servidor web ligero y balanceador de carga de alto rendimiento. Bajo consumo de recursos.
- Node.js 20 + Express Alpine: Backend ligero para GPS. Ideal para operaciones I/O intensivas y manejo de múltiples conexiones simultáneas.
- Spring Boot 3.5.7: Framework empresarial robusto para Java. Autoconfiguración, seguridad integrada, ORM con JPA.
- Spring Security 3.5.7: Autenticación y autorización basada en roles (FLOTA, DAF, CHOFER). Protección CSRF y JWT.
- JPA/Hibernate: ORM para mapeo objeto-relacional. Simplifica operaciones CRUD y relaciones entre entidades.
- PostgreSQL 15.8: Base de datos relacional robusta. Soporte para replicación lógica, tipos de datos geoespaciales.
- Supabase Cloud: Backend para sincronización en nube. Backup remoto automático y acceso distribuido.
- Prometheus 2.55.0: Sistema de monitoreo time-series. Consultas PromQL poderosas y alertas configurables.
- Grafana 11.2.2: Visualización de métricas con dashboards personalizables. Integración nativa con Prometheus.
- Node Exporter 1.8.2: Exporta métricas del sistema operativo (CPU, RAM, disco, red).
- Docker Stat Exporter: Exporta estadísticas de contenedores Docker para monitoreo.
- Express: Se utiliza para la creacion del backendgps que se encarga de la api relacionada a el gps recibiendo y mandando localización de los usuarios.


## 3. Alta Disponibilidad

El sistema está diseñado bajo un esquema de alta disponibilidad (HA) para garantizar la continuidad operativa incluso ante fallas parciales de componentes.
Se implementan mecanismos de replicación, balanceo de carga y monitoreo continuo, tanto en el nivel de aplicación como de base de datos.

🔹 Balanceo de carga en el Frontend

El servicio frontend1 se despliega bajo un servidor Nginx configurado como load balancer.
Este distribuye el tráfico entrante entre los dos backends principales:

backendgpsapp1 (instancia principal)

backendgpsapp2 (réplica en modo activo-activo)

De esta forma, las solicitudes se balancean automáticamente, permitiendo manejar mayor concurrencia y evitar la sobrecarga de un único contenedor.

Ventajas:

Tolerancia a fallos del backend principal.

Escalabilidad horizontal inmediata.

Reducción de la latencia percibida por el usuario.

🔹 Replicación de base de datos (failover automático)

El sistema implementa una base de datos principal (db) y una db para los datos lógicos de usuarios, vehiculos, etc (db_replica), la cual opera bajo un esquema master–replica.

db_sync: sincroniza automáticamente los cambios hacia la base remota en Supabase, garantizando redundancia geográfica y respaldo en la nube.

Además, se incluye el contenedor db_watcher, el cual monitorea el estado de db_replica y la reinicia automáticamente en caso de caída, asegurando que el sistema vuelva a su estado operativo en menos de 30 segundos.

Ventajas:

Tolerancia a fallos de hardware o software.

Persistencia de los datos críticos.

Redundancia local y remota.

🔹 Monitoreo en tiempo real

La alta disponibilidad se apoya en un sistema de observabilidad basado en Prometheus y Grafana:

node_exporter → métricas del sistema.

docker_stats_exporter → métricas por contenedor Docker.

prometheus → recopilación y almacenamiento de métricas.

grafana → visualización con dashboards personalizables.

## 4. Componente IA 
La integración de la IA en el proyecto para la licitación fue pensada como una parte crucial para la interacción entre los usuarios administrativos de la aplicación y los datos generados por los vehículos monitoreados. 

Su función consiste en recolectar datos como ubicación, velocidad, estado y otras características del vehículo y su recorrido, con el fin de generar reportes relacionados con los hábitos de conducción, excesos de velocidad, paradas habituales, entre otros indicadores útiles para la gestión de flota. 
## 5. Como Usarlo 
### Requisitos 
Para un correcto funcionamiento del sistema se requiere un dispositivo con acceso a Internet, capaz de enviar datos GPS en tiempo real. En su defecto, se pueden utilizar herramientas de túnelización para permitir la conexión remota (recomendado), ya que para obtener la ubicación de manera remota se necesitan certificados SSL para el protocolo HTTPS, los cuales no se consideraron durante el desarrollo. 

Por otro lado, dado que el proyecto utiliza una base de datos en la nube (en este caso Supabase), se necesita una cuenta que contenga la base de datos donde se almacenará una de las réplicas de los datos de los usuarios. El dispositivo o servidor donde se ejecute el proyecto debe contar con: 

- Conexión estable a Internet (banda ancha simétrica recomendada). 
- Al menos 8 GB de RAM. 
- 256 GB de almacenamiento SSD para una mejor transferencia de datos. 
- Sistema operativo Ubuntu Server 22.04 (o similar).
- Docker y Docker Compose instalados y configurados correctamente. 

 ## Instalación y ejecución

``` bash
git clone https://github.com/Sebast200/Proyecto-ADR-U2.git
cd Proyecto-ADR-U2
```
Con esto se descargará y abrirá el repositorio del proyecto. Dentro del mismo se encuentran los directorios de los distintos contenedores, los cuales son orquestados y construidos mediante Docker Compose. 
Antes de ejecutar el proyecto, asegúrate de tener Docker instalado con una versión reciente:

```bash
docker -v
```
Ahora si procederemos con el buildeo y ejecucion de los contenedores docker
```bash
docker compose up --build #agregar opcion -d si no quiere bloquer la terminal
```
Este comando instalará todas las dependencias, sincronizará las bases de datos y levantará todos los servicios. 

Una vez finalizado el proceso, si no se muestran errores, el sistema estará operativo. 
## URLs de acceso y comandos útiles 
Dado que el sistema está compuesto por varios microservicios, se definieron distintos endpoints para cumplir con las diversas funciones del sistema.
### Monitoreo (graphana)
La interfaz de monitoreo se encuentra disponible en el puerto 3002
```bash
http://localhost:3002
```
### Bases de datos (adminer)
Para acceder a la interfaz de administración de las bases de datos locales, se puede ingresar mediante el servicio Adminer disponible en el puerto 8080:

```bash
http://localhost:8080
```
### Pagina principal (Frontend)
El puerto principal del sistema es el 8081, donde Nginx actúa como load balancer para distribuir las solicitudes de los usuarios hacia los distintos servicios. Este es el puerto que debe exponerse para las conexiones remotas.
```bash
http://localhost:8081
```
### Otros puertos importantes #### Backend para usuarios
```bash
http://localhost:3001
```
#### Backend para gps
```bash
http://localhost:3000
```
### Uso de aplicacion remotamente
Nuestro uso de la aplicacion de manera remota fue gracias a cloudflare tunnel, donde se tuvo que instalar los paquetes desde:

https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/

Una vez instalado se puede tunelizar un puerto en específico para tener acceso remoto sin necesidad de tener una ip pública:
```bash
cloudflared tunnel --url http://localhost:8081
```
## Usuarios y contraseñas de prueba
Al ingresar al frontend, el sistema solicitará credenciales de usuario. Para registrar un usuario nuevo, se puede realizar una petición directa al backend con el siguiente formato (los roles disponibles son "FLOTA", "DAF" y "CHOFER"):
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "11111111-1",
    "email": "encargado@flota.cl",
    "password": "123456",
    "firstName": "Mario",
    "lastName": "Fuentes",
    "role": "FLOTA"
  }'
```
## 6. Backup y Monitoreo

El sistema incluye un mecanismo automático de respaldos diarios de la base de datos local (db_replica) y herramientas para su restauración y supervisión.

🔹 Respaldos automáticos (cron job)

El servicio db_backup se ejecuta con una imagen de PostgreSQL y un cron job diario a las 02:00 AM, configurado para:

Generar un backup completo de la base db_replica en formato .sql.

Almacenar el archivo en la carpeta /scripts/backup/db_backups/.

Retener los últimos 7 días de respaldos.

Ruta en host:

./scripts/backup/db_backups/


Script principal:
scripts/backup/backup-db.sh

Ejecución manual (si se desea forzar un backup):

docker exec -it db_backup sh /backup/backup-db.sh

🔹 Restauración de datos

En caso de contingencia, se puede restaurar un respaldo con el script:

docker exec -it db_backup sh /backup/restore-db.sh /backup/db_backups/<archivo>.sql


Esto recarga el estado de la base desde el archivo seleccionado, permitiendo recuperación completa ante pérdida o corrupción de datos.

🔹 Monitoreo del sistema

Prometheus recoge métricas de todos los servicios.

Grafana presenta paneles con CPU, memoria, uso de red y estado de contenedores.

Las métricas se actualizan cada 5 segundos, con dashboards que permiten filtrar por contenedor específico.

Acceso local al monitoreo:

Grafana → http://localhost:3002

Prometheus → http://localhost:9090
