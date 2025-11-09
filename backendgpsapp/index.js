const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const app = express()
require('dotenv').config();

// Configuración de conexión a Postgres (se leen variables de entorno)
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
})
const port = process.env.PORT

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

app.get('/location/:id/route', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT json_agg(json_build_array(latitude, longitude)) AS route
      FROM (
        SELECT latitude, longitude
        FROM locations
        WHERE device_id = $1
        ORDER BY recorded_at ASC
      ) AS ordered_points;
    `;
    
    const result = await pool.query(query, [id]);

    res.json({
      device_id: id,
      route: result.rows[0].route || [] // en caso de que no haya datos
    });
  } catch (err) {
    console.error('Error fetching route:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/location/:id/latest', async (req, res) => {
  const { id } = req.params

  try {
    const query = `
      SELECT latitude, longitude, recorded_at
      FROM locations
      WHERE device_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1;
    `
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No location found for this device_id' })
    }

    res.json({
      device_id: id,
      last_location: result.rows[0]
    })
  } catch (err) {
    console.error('Error fetching latest location:', err)
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
