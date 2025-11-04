require('dotenv').config()
const express = require('express')
const https = require('https')
const fs = require('fs')
const cors = require('cors')
const { Pool } = require('pg')
const app = express()
const port = 3000

// Configuración de conexión a Postgres (se leen variables de entorno)
// Soporta tanto variables separadas (PGHOST, PGUSER, ...) como DATABASE_URL.
const poolConfig = {}

if (process.env.DATABASE_URL) {
  // Usar connection string si está disponible (útil en deploys que proveen DATABASE_URL)
  poolConfig.connectionString = process.env.DATABASE_URL
  // Configuración SSL: por defecto habilitamos SSL si se provee DATABASE_URL.
  // Puedes forzar la desactivación con PGSSLMODE=disable o desactivar la verificación
  // con PG_SSL_REJECT_UNAUTHORIZED=0 (útil para certificados autofirmados en dev).
  if (process.env.PGSSLMODE === 'disable') {
    poolConfig.ssl = false
  } else if (process.env.PG_SSL_REJECT_UNAUTHORIZED === '0') {
    poolConfig.ssl = { rejectUnauthorized: false }
  } else {
    poolConfig.ssl = true
  }
} else {
  poolConfig.host = process.env.PGHOST
  poolConfig.user = process.env.PGUSER
  poolConfig.password = process.env.PGPASSWORD
  poolConfig.database = process.env.PGDATABASE
  poolConfig.port = process.env.PGPORT
}

// Crear pool
const pool = new Pool(poolConfig)

// Mostrar configuración no sensible para debug (no imprimir password)
console.log('Postgres config:', {
  host: poolConfig.host || (process.env.DATABASE_URL ? '(from DATABASE_URL)' : undefined),
  user: poolConfig.user,
  database: poolConfig.database,
  port: poolConfig.port,
  usingConnectionString: !!process.env.DATABASE_URL,
})

// Middleware para procesar JSON
app.use(express.json())
app.use(cors())

// Ruta inicial
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Ruta para recibir ubicación GPS y almacenarla en Postgres
app.post('/location/:id', async (req, res) => {
  const { id } = req.params
  const { latitude, longitude } = req.body
  
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Latitude and longitude are required' })
  }
  
  const lat = parseFloat(latitude)
  const lon = parseFloat(longitude)
  
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ error: 'Latitude and longitude must be numbers' })
  }
  
  try {
    const insertQuery = `INSERT INTO locations (device_id, latitude, longitude) VALUES ($1, $2, $3) RETURNING *;`
    const result = await pool.query(insertQuery, [id, lat, lon])
    console.log(`Saved location for ID ${id}:`, { latitude: lat, longitude: lon })
    res.json({
      message: 'Location received and stored successfully',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('DB error:', err)
    res.status(500).json({ error: 'Database error' })
  }
})

// Simple health-check to verify DB connectivity
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (err) {
    console.error('DB health check failed', err)
    res.status(500).json({ status: 'error' })
  }
})

// Configuración HTTPS
try {
  const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }
  
  https.createServer(options, app).listen(port, '0.0.0.0', () => {
    console.log(`HTTPS Server listening on port ${port}`)
    console.log(`Access from your phone: https://[YOUR_IP]:${port}`)
  })
} catch (err) {
  console.error('Could not start HTTPS server. Make sure server.key and server.cert exist.')
  console.error('Generate them with: openssl req -nodes -new -x509 -keyout server.key -out server.cert')
  console.error('Falling back to HTTP...')
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`HTTP Server listening on port ${port}`)
  })
}