import { useCallback, useEffect, useState } from 'react'
import {
  downloadReportCsv,
  fetchReportOccupancy,
  fetchReportReservations,
  fetchReportRevenue,
  type ReportMap,
} from '../api/admin'
import { ApiError } from '../api/client'
import { addDaysIsoDate, todayIsoDate } from '../utils/format'

export function AdminReportsPage() {
  const [from, setFrom] = useState(() => addDaysIsoDate(todayIsoDate(), -7))
  const [to, setTo] = useState(todayIsoDate)
  const [reservations, setReservations] = useState<ReportMap | null>(null)
  const [occupancy, setOccupancy] = useState<ReportMap | null>(null)
  const [revenue, setRevenue] = useState<ReportMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [r, o, v] = await Promise.all([
        fetchReportReservations(from, to),
        fetchReportOccupancy(from, to),
        fetchReportRevenue(from, to),
      ])
      setReservations(r)
      setOccupancy(o)
      setRevenue(v)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los informes')
      setReservations(null)
      setOccupancy(null)
      setRevenue(null)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  async function handleExport() {
    setExporting(true)
    try {
      const blob = await downloadReportCsv(from, to)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-${from}_${to}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page">
      <h1>Informes</h1>
      <p className="lede">Rango de fechas en calendario local; los datos del backend usan zona horaria de negocio.</p>

      <div className="card form-row">
        <label className="field field--inline">
          <span>Desde</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="field field--inline">
          <span>Hasta</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button type="button" className="btn btn--secondary align-end" onClick={() => void load()}>
          Actualizar
        </button>
        <button
          type="button"
          className="btn btn--primary align-end"
          disabled={exporting}
          onClick={() => void handleExport()}
        >
          {exporting ? 'Descargando…' : 'CSV resumen'}
        </button>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="muted">Cargando informes…</p>}

      {!loading && reservations && (
        <div className="report-grid">
          <div className="card">
            <h2>Reservas</h2>
            <dl className="dl-grid">
              <dt>Desde</dt>
              <dd>{String(reservations.from)}</dd>
              <dt>Hasta</dt>
              <dd>{String(reservations.to)}</dd>
              <dt>Cantidad</dt>
              <dd>{String(reservations.reservationCount ?? '—')}</dd>
            </dl>
          </div>
          <div className="card">
            <h2>Ocupación (estimada)</h2>
            <dl className="dl-grid">
              <dt>% aprox.</dt>
              <dd>{String(occupancy?.approxOccupancyPercent ?? '—')}</dd>
              <dt>Nota</dt>
              <dd className="muted small-dd">{String(occupancy?.note ?? '')}</dd>
            </dl>
          </div>
          <div className="card">
            <h2>Ingresos</h2>
            <dl className="dl-grid">
              <dt>Total COP</dt>
              <dd>{String(revenue?.totalCOP ?? '—')}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
