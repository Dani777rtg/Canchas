import { useCallback, useEffect, useState } from 'react'
import type { Receipt, Reservation } from '../types/reservation'
import {
  cancelReservation,
  fetchMyReservations,
  fetchReceipt,
} from '../api/reservations'
import { ApiError } from '../api/client'
import { formatCop, formatInstantRange } from '../utils/format'

function canCancel(r: Reservation): boolean {
  if (['CANCELADA', 'CANCELADA_TARDIA', 'FINALIZADA'].includes(r.status)) {
    return false
  }
  return new Date(r.startAt) > new Date()
}

export function MisReservasPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchMyReservations>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchMyReservations(page, 10)
      setData(res)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las reservas')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCancel(id: string) {
    if (!window.confirm('¿Cancelar esta reserva?')) {
      return
    }
    setActionId(id)
    try {
      await cancelReservation(id)
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cancelar')
    } finally {
      setActionId(null)
    }
  }

  async function openReceipt(id: string) {
    setActionId(id)
    try {
      const r = await fetchReceipt(id)
      setReceipt(r)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo obtener el comprobante')
    } finally {
      setActionId(null)
    }
  }

  const list = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="page">
      <h1>Mis reservas</h1>
      <p className="lede">Listado de tus reservas (más recientes primero).</p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="muted">Cargando…</p>}

      {!loading && list.length === 0 && <p className="muted">No tenés reservas todavía.</p>}

      {!loading && list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cancha</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <code>{r.publicCode}</code>
                    </td>
                    <td>{r.courtName}</td>
                    <td>{formatInstantRange(r.startAt, r.endAt)}</td>
                    <td>{r.status}</td>
                    <td>{formatCop(r.total)}</td>
                    <td className="data-table__actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        disabled={actionId === r.id}
                        onClick={() => void openReceipt(r.id)}
                      >
                        Comprobante
                      </button>
                      {canCancel(r) && (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          disabled={actionId === r.id}
                          onClick={() => void handleCancel(r.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
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

      {receipt && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-title"
        >
          <div className="modal">
            <h2 id="receipt-title">Comprobante</h2>
            <p className="muted">{receipt.note}</p>
            <dl className="dl-grid receipt-dl">
              <dt>Código</dt>
              <dd>{receipt.publicCode}</dd>
              <dt>Cancha</dt>
              <dd>{receipt.courtName}</dd>
              <dt>Horario</dt>
              <dd>{formatInstantRange(receipt.startAt, receipt.endAt)}</dd>
              <dt>Total</dt>
              <dd>
                {formatCop(receipt.total)} {receipt.currency}
              </dd>
            </dl>
            <button type="button" className="btn btn--primary" onClick={() => setReceipt(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
