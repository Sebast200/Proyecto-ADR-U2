import axios from 'axios';

// Use relative base URL so nginx can proxy /api -> backend
const baseURL = process.env.REACT_APP_API_URL || '/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000,
});

export default client;
