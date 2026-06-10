import { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  Calendar,
  CalendarRange,
  Download,
  Loader2,
  Percent,
  RefreshCw,
  TrendingUp,
  Ticket,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  downloadReportCsv,
  fetchReportOccupancy,
  fetchReportReservations,
  fetchReportRevenue,
  type ReportMap,
} from '@/api/admin'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageTitle } from '@/lib/use-page-title'
import { addDaysIsoDate, formatCop, todayIsoDate } from '@/utils/format'

function asNumber(v: string | number | undefined): number | null {
  if (v === undefined || v === null) {
    return null
  }
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function defaultFromDate(): string {
  return addDaysIsoDate(todayIsoDate(), -7)
}

function defaultToDate(): string {
  return addDaysIsoDate(todayIsoDate(), 60)
}

export function AdminReportsPage() {
  usePageTitle('Informes — Admin')
  const [from, setFrom] = useState(defaultFromDate)
  const [to, setTo] = useState(defaultToDate)
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
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudieron cargar los informes',
      )
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
      toast.success('CSV descargado')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  const occupancyPercent = asNumber(occupancy?.approxOccupancyPercent)
  const reservationCount = asNumber(reservations?.reservationCount) ?? 0
  const totalCop = revenue?.totalCOP ?? 0

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Informes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Rango por inicio de reserva (zona Bogotá). Incluí fechas futuras
              para contar reservas próximas.
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <label className="flex flex-1 min-w-[10rem] flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Desde
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
            />
          </label>
          <label className="flex flex-1 min-w-[10rem] flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Hasta
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
            />
          </label>
          <Button type="button" variant="outline" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button
            type="button"
            disabled={exporting}
            onClick={() => void handleExport()}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Descargando…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                CSV resumen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {!loading && reservations && reservationCount === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No hay reservas en este rango. Ampliá la fecha &quot;Hasta&quot; si
            buscás reservas futuras.
          </CardContent>
        </Card>
      )}

      {!loading && reservations && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Ticket className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-bold tabular-nums">
                {reservationCount}
              </div>
              <CardDescription className="mt-1 flex items-center gap-1.5">
                <CalendarRange className="h-3 w-3" />
                {String(reservations.from ?? from)} → {String(reservations.to ?? to)}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <div className="rounded-lg bg-accent/15 p-2 text-accent-foreground dark:text-accent">
                <Percent className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">
                Ocupación aproximada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-bold tabular-nums">
                {occupancyPercent !== null ? `${occupancyPercent}%` : '—'}
              </div>
              {occupancyPercent !== null && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, occupancyPercent))}%` }}
                  />
                </div>
              )}
              <CardDescription className="mt-1 text-xs">
                {String(occupancy?.note ?? '')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-bold tabular-nums text-primary">
                {formatCop(totalCop)}
              </div>
              <CardDescription className="mt-1">
                Total en pesos colombianos del período.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
