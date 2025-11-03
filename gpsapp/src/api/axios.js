import axios from 'axios'

const api = axios.create({
  baseURL: '/location', // 👈 ahora usará la ruta relativa manejada por Nginx
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
})

export default api
