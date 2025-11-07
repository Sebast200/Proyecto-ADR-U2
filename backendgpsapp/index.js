const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const app = express()
const port = 3000

// Configuración de conexión a Postgres (se leen variables de entorno)
const pool = new Pool({
  host: process.env.PGHOST || 'db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'example',
  database: process.env.PGDATABASE || 'postgres',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
})

// Middleware para procesar JSON
app.use(express.json())
app.use(cors())

// Ruta inicial
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Ruta para recibir ubicación GPS y almacenarla en Postgres
// Soporte para POST /location  y POST /location/:id  (body puede contener id)
async function handleLocation(req, res) {
  const urlId = req.params?.id
  const { id: bodyId, latitude, longitude } = req.body || {}
  const deviceId = bodyId || urlId

  if (!deviceId) {
    return res.status(400).json({ error: 'Device id is required (either URL param or body.id)' })
  }

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
    const result = await pool.query(insertQuery, [deviceId, lat, lon])

    console.log(`Saved location for ID ${deviceId}:`, { latitude: lat, longitude: lon })

    res.json({
      message: 'Location received and stored successfully',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('DB error:', err)
    res.status(500).json({ error: 'Database error' })
  }
}

app.post('/location', handleLocation)
app.post('/location/:id', handleLocation)

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
