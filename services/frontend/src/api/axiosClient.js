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

export async function getLastPosition(deviceId) {
  try {
    const response = await client.get(`/location/${deviceId}/latest`);
    return response.data; // devuelve { device_id, last_location: { latitude, longitude, created_at } }
  } catch (error) {
    console.error('Error fetching last position:', error);
    return null;
  }
}

export default client;
