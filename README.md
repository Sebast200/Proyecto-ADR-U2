Para correr de manera remota la aplicación del gps, primero se debe entrar a los directorios backendgps para instalar las dependencias
npm install
luego levantar y construir el docker compose
docker compose up --build
para correr en cloudflare luego de todo lo anterior y tener instalado los servicios de cloudflare desde 
https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/
Por ultimo crear el tunnel en el localhost con el puerto 8081
cloudflared tunnel --url http://localhost:8081