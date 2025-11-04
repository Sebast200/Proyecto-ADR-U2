import axios from 'axios'

const api = axios.create({
  baseURL: '/api/location', // ✅ importante: ahora nginx sabe que esto va al backend
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
})

export default api
