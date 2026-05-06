import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { fetchAdminUsers } from '../api/admin'
import type { AdminUser } from '../types/admin'
import { ApiError } from '../api/client'

export function AdminUsersPage() {
  const [emailFilter, setEmailFilter] = useState('')
  const [appliedFilter, setAppliedFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<AdminUser[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUsers(page, 15, appliedFilter || undefined)
      setRows(data.content)
      setTotalPages(data.totalPages)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los usuarios')
      setRows([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [page, appliedFilter])

  useEffect(() => {
    void load()
  }, [load])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setAppliedFilter(emailFilter.trim())
  }

  return (
    <div className="page">
      <h1>Usuarios</h1>
      <p className="lede">Listado paginado; podés filtrar por correo (coincidencia en servidor).</p>

      <form className="card form-row" onSubmit={handleSearch}>
        <label className="field field--grow">
          <span>Correo (opcional)</span>
          <input
            type="search"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="ej. admin@"
          />
        </label>
        <button type="submit" className="btn btn--secondary align-end">
          Buscar
        </button>
      </form>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="muted">Cargando…</p>}

      {!loading && rows.length === 0 && !error && <p className="muted">Sin resultados.</p>}

      {!loading && rows.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pager">
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span className="muted">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
