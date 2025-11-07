import { useEffect, useRef } from 'react';
import axios from './api/axiosClient';

// Sends GPS to backend every 2 seconds while mounted and when `user` is present.
// Props: user (object) - used to derive device id (user.id or 'device1')
function GpsSender({ user }) {
  const intervalRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!user) return undefined; // don't start if no user

  // prefer explicit id, otherwise fall back to email, username, name, or a default
  const deviceId = user?.id || user?.email || user?.username || user?.name || 'device1';

    // guard to avoid double-setup in StrictMode/dev
    if (isRunningRef.current) return undefined;
    isRunningRef.current = true;

    const sendPosition = (lat, lon) => {
      axios.post(`/location/${encodeURIComponent(deviceId)}`, {
        latitude: lat,
        longitude: lon,
      }).then((res) => {
        // optional: console.debug('GPS sent', res.data)
      }).catch((err) => {
        console.warn('Failed sending GPS', err?.message || err);
      });
    };

    const sendCurrent = () => {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            sendPosition(latitude, longitude);
          },
          (err) => {
            // If permission denied or error, we can fallback to 0,0 or skip
            console.warn('Geolocation error:', err?.message || err);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 3000 }
        );
      } else {
        // no geolocation available — send placeholder or skip
        console.warn('Navigator.geolocation not available');
      }
    };

    // send immediately, then every 2s
    sendCurrent();
    intervalRef.current = setInterval(sendCurrent, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isRunningRef.current = false;
    };
  }, [user]);

  return null; // no UI
}

export default GpsSender;
