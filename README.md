Para correr de manera remota la aplicación del gps, primero se debe entrar a los directorios backendgps y gpsapp para instalar als dependencias
npm install
y buildear en gpsapp
npm run build
luego levantar y construir el docker compose
docker compose up --build
para correr en cloudflare luego de todo lo anterior y tener instalado los srvicios de cloudflare ejecutar
