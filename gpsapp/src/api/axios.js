import axios from 'axios'

const api = axios.create({
  // Use REACT_APP_API_URL at build time if provided, otherwise use relative URLs
  // so requests go to the same origin (nginx) and are proxied to the backend.
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
})

export default api
