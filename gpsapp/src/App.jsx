import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import api from './api/axios'

function App() {
  const [count, setCount] = useState(0)
  const [deviceId, setDeviceId] = useState('DEVICE123')
  const [status, setStatus] = useState('')

  const sendLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported in this browser')
      return
    }

    setStatus('Getting location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setStatus('Sending location to server...')
        try {
          const res = await api.post(`/location/${encodeURIComponent(deviceId)}`, {
            latitude,
            longitude
          })
          setStatus('Location sent: ' + JSON.stringify(res.data))
        } catch (err) {
          console.error(err)
          setStatus('Error sending location: ' + (err?.response?.data?.error || err.message))
        }
      },
      (err) => {
        console.error(err)
        setStatus('Error getting location: ' + err.message)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <label>
            Device ID:{' '}
            <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
          </label>
        </div>
        <button onClick={sendLocation}>Send current GPS location</button>
        <p style={{ marginTop: 8 }}>{status}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
