import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Receipt as ReceiptIcon,
  Ticket,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Receipt, Reservation } from '@/types/reservation'
import {
  deleteReservation,
  fetchMyReservations,
  fetchReceipt,
} from '@/api/reservations'
import { ApiError } from '@/api/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/StatusBadge'
import { usePageTitle } from '@/lib/use-page-title'
import { formatCop, formatInstantRange } from '@/utils/format'

function isUpcoming(r: Reservation): boolean {
  const future = new Date(r.startAt) > new Date()
  return (
    future &&
    (r.status === 'CONFIRMADA' || r.status === 'PENDIENTE_PAGO')
  )
}

function isCancelled(r: Reservation): boolean {
  return r.status === 'CANCELADA' || r.status === 'CANCELADA_TARDIA'
}

type TabValue = 'upcoming' | 'past' | 'cancelled'

export function MisReservasPage() {
  usePageTitle('Mis reservas')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchMyReservations>
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null)
  const [tab, setTab] = useState<TabValue>('upcoming')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchMyReservations(page, 20)
      setData(res)
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'No se pudieron cargar las reservas'
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }
    setActionId(deleteTarget.id)
    try {
      await deleteReservation(deleteTarget.id)
      toast.success('Reserva eliminada')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : 'No se pudo eliminar la reserva',
      )
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
      toast.error(
        e instanceof ApiError ? e.message : 'No se pudo obtener el comprobante',
      )
    } finally {
      setActionId(null)
    }
  }

  const list = useMemo(() => data?.content ?? [], [data])
  const totalPages = data?.totalPages ?? 0

  const upcoming = useMemo(() => list.filter(isUpcoming), [list])
  const cancelled = useMemo(() => list.filter(isCancelled), [list])
  const past = useMemo(
    () => list.filter((r) => !isUpcoming(r) && !isCancelled(r)),
    [list],
  )

  const visible = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Mis reservas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Listado completo de tus turnos. Más recientes primero.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas <span className="ml-1.5 text-muted-foreground">({upcoming.length})</span>
          </TabsTrigger>
          <TabsTrigger value="past">
            Pasadas <span className="ml-1.5 text-muted-foreground">({past.length})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas <span className="ml-1.5 text-muted-foreground">({cancelled.length})</span>
          </TabsTrigger>
        </TabsList>

        {totalPages > 1 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Los filtros aplican a esta página ({list.length} reservas). Usá{' '}
            <strong>Siguiente</strong> para ver más resultados.
          </p>
        )}

        <TabsContent value={tab}>
          {loading && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {!loading && visible.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="rounded-full bg-muted p-4 text-muted-foreground">
                  <Ticket className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {tab === 'upcoming'
                    ? 'No tenés reservas próximas. Cuando reserves un turno, va a aparecer acá.'
                    : tab === 'past'
                      ? 'Todavía no hay reservas pasadas.'
                      : 'No hay reservas canceladas.'}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && visible.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                          {r.publicCode}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">{r.courtName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatInstantRange(r.startAt, r.endAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCop(r.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={actionId === r.id}
                            onClick={() => void openReceipt(r.id)}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Comprobante
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={actionId === r.id}
                            onClick={() => setDeleteTarget(r)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
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
        </TabsContent>
      </Tabs>

      <Dialog
        open={receipt !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReceipt(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 rounded-full bg-primary/10 p-3 text-primary">
              <ReceiptIcon className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center">Comprobante</DialogTitle>
            <DialogDescription className="text-center">
              {receipt?.note}
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4">
              <div className="mb-3 flex items-center justify-between border-b border-dashed border-border pb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5" />
                  Código
                </span>
                <code className="rounded bg-card px-2 py-0.5 text-sm font-semibold">
                  {receipt.publicCode}
                </code>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Cancha</dt>
                  <dd className="font-medium">{receipt.courtName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    <Calendar className="mr-1 inline h-3.5 w-3.5" />
                    Horario
                  </dt>
                  <dd className="text-right font-medium">
                    {formatInstantRange(receipt.startAt, receipt.endAt)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-dashed border-border pt-2">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-display text-lg font-bold text-primary tabular-nums">
                    {formatCop(receipt.total)}{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      {receipt.currency}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setReceipt(null)}
            className="w-full"
          >
            <X className="h-4 w-4" />
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && actionId === null) {
            setDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Vas a eliminar permanentemente la reserva de la{' '}
                  <strong>{deleteTarget.courtName}</strong> del{' '}
                  <strong>
                    {formatInstantRange(deleteTarget.startAt, deleteTarget.endAt)}
                  </strong>
                  . Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionId !== null}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
              disabled={actionId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Sí, eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
