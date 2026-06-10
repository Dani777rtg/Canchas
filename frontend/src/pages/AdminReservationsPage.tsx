import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, ListChecks, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAdminReservations, recordAdminManualPayment } from '@/api/admin'
import type { AdminReservation } from '@/types/admin'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/StatusBadge'
import { usePageTitle } from '@/lib/use-page-title'
import {
  addDaysIsoDate,
  formatCop,
  formatInstantRange,
  todayIsoDate,
} from '@/utils/format'

function defaultFromDate(): string {
  return addDaysIsoDate(todayIsoDate(), -7)
}

function defaultToDate(): string {
  return addDaysIsoDate(todayIsoDate(), 60)
}

function totalAsNumber(total: string | number): number {
  const n = typeof total === 'number' ? total : Number(total)
  return Number.isFinite(n) ? n : 0
}

export function AdminReservationsPage() {
  usePageTitle('Reservas — Admin')
  const [from, setFrom] = useState(defaultFromDate)
  const [to, setTo] = useState(defaultToDate)
  const [appliedFrom, setAppliedFrom] = useState(defaultFromDate)
  const [appliedTo, setAppliedTo] = useState(defaultToDate)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<AdminReservation[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payTarget, setPayTarget] = useState<AdminReservation | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payRef, setPayRef] = useState('')
  const [paySubmitting, setPaySubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminReservations(appliedFrom, appliedTo, page, 15)
      setRows(data.content)
      setTotalPages(data.totalPages)
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudieron cargar las reservas',
      )
      setRows([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [appliedFrom, appliedTo, page])

  useEffect(() => {
    void load()
  }, [load])

  function handleFilter(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setAppliedFrom(from)
    setAppliedTo(to)
  }

  function openPayDialog(reservation: AdminReservation) {
    setPayTarget(reservation)
    setPayAmount(String(Math.round(totalAsNumber(reservation.total))))
    setPayRef('')
  }

  function closePayDialog() {
    if (paySubmitting) {
      return
    }
    setPayTarget(null)
  }

  async function handleRecordPayment(e: FormEvent) {
    e.preventDefault()
    if (!payTarget) {
      return
    }
    const amount = Number(payAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Ingresá un monto válido mayor a cero.')
      return
    }
    setPaySubmitting(true)
    try {
      await recordAdminManualPayment(payTarget.id, amount, payRef)
      toast.success(`Pago registrado para ${payTarget.publicCode}`)
      setPayTarget(null)
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'No se pudo registrar el pago',
      )
    } finally {
      setPaySubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Reservas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listado por rango de fechas de inicio (zona Bogotá). Incluí fechas
            futuras para ver reservas próximas.
          </p>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <form className="flex flex-wrap items-end gap-3" onSubmit={handleFilter}>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Desde
              </span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hasta
              </span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
              />
            </label>
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
            <Button type="button" variant="ghost" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </form>
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
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No hay reservas en este rango. Ampliá la fecha &quot;Hasta&quot; si
            buscás reservas futuras, o creá una desde el panel cliente.
          </CardContent>
        </Card>
      )}

      {!loading && rows.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Cancha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.publicCode}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.userFullName}</div>
                    <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div>{r.courtName}</div>
                    <div className="text-xs text-muted-foreground">{r.venueName}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatInstantRange(r.startAt, r.endAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCop(r.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.paymentStatus === 'PENDIENTE' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openPayDialog(r)}
                      >
                        Registrar pago
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={payTarget !== null} onOpenChange={(open) => !open && closePayDialog()}>
        <DialogContent>
          <form onSubmit={(e) => void handleRecordPayment(e)}>
            <DialogHeader>
              <DialogTitle>Registrar pago manual</DialogTitle>
              <DialogDescription>
                {payTarget
                  ? `Reserva ${payTarget.publicCode} · ${payTarget.userFullName}`
                  : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pay-amount">Monto (COP)</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pay-ref">Referencia (opcional)</Label>
                <Input
                  id="pay-ref"
                  placeholder="Ej. transferencia Nequi, efectivo en caja"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={paySubmitting}
                onClick={closePayDialog}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={paySubmitting}>
                {paySubmitting ? 'Guardando…' : 'Marcar como pagado'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
