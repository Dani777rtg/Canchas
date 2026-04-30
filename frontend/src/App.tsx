import { useEffect, useState } from 'react'
import { fetchHealth } from './api/health'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('comprobando…')

  useEffect(() => {
    fetchHealth()
      .then((h) => setApiStatus(`${h.service}: ${h.status}`))
      .catch(() => setApiStatus('no disponible (¿arrancó el backend en :8080?)'))
  }, [])

  return (
    <>
      <h1>Canchas — reservas</h1>
      <p>
        API: <strong>{apiStatus}</strong>
      </p>
      <p className="read-the-docs">
        Frontend Vite + React · Backend Spring Boot en <code>/api</code>
      </p>
    </>
  )
}

export default App
