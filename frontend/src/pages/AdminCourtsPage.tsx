import { useCallback, useEffect, useState } from 'react'
import { fetchAdminCourts } from '../api/admin'
import type { CourtSummary } from '../types/admin'
import { ApiError } from '../api/client'

export function AdminCourtsPage() {
  const [courts, setCourts] = useState<CourtSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminCourts()
      setCourts(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las canchas')
      setCourts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="page">
      <h1>Canchas</h1>
      <p className="lede">Todas las canchas del sistema (incluye inactivas y mantenimiento).</p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="muted">Cargando…</p>}

      {!loading && courts.length === 0 && !error && <p className="muted">No hay canchas.</p>}

      {!loading && courts.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Deporte</th>
                <th>Estado</th>
                <th>Nota mant.</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {courts.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.sportType}</td>
                  <td>{c.status}</td>
                  <td>{c.maintenanceNote ?? '—'}</td>
                  <td>
                    <code className="table-code">{c.id}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
