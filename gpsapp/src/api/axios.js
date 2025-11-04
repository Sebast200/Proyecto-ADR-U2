import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://192.168.11.75:3000',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
})

export default api
