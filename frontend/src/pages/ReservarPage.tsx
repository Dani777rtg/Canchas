import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, Clock, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAvailability, type CourtAvailability, type Slot } from '@/api/availability'
import { createReservation } from '@/api/reservations'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CitySelector } from '@/components/CitySelector'
import { useCity } from '@/lib/city-context'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { addDaysIsoDate, formatInstantShort, todayIsoDate } from '@/utils/format'

function canBookBlock(slots: Slot[], startIndex: number, durationHours: number): boolean {
  if (durationHours < 1 || durationHours > 3) {
    return false
  }
  if (startIndex + durationHours > slots.length) {
    return false
  }
  for (let j = 0; j < durationHours; j++) {
    if (!slots[startIndex + j]?.available) {
      return false
    }
  }
  return true
}

function rangeFromSlots(slots: Slot[], startIndex: number, durationHours: number) {
  const startAt = slots[startIndex].startAt
  const endAt = slots[startIndex + durationHours - 1].endAt
  return { startAt, endAt }
}

interface PendingBooking {
  courtId: string
  courtName: string
  slots: Slot[]
  startIndex: number
  startAt: string
  endAt: string
}

export function ReservarPage() {
  usePageTitle('Nueva reserva')
  const navigate = useNavigate()
  const { selectedCity, selectedCityId } = useCity()
  const [searchParams] = useSearchParams()
  const urlDate = searchParams.get('fecha')
  const dateFromUrl = urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate) ? urlDate : null
  const [date, setDate] = useState(() => dateFromUrl ?? todayIsoDate())

  useEffect(() => {
    if (dateFromUrl) {
      setDate(dateFromUrl)
    }
  }, [dateFromUrl])

  const [durationHours, setDurationHours] = useState<1 | 2 | 3>(1)
  const [courts, setCourts] = useState<CourtAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<PendingBooking | null>(null)
  const [booking, setBooking] = useState(false)

  const load = useCallback(async () => {
    if (!selectedCityId) {
      setCourts([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchAvailability(date, { venueId: selectedCityId })
      setCourts(data)
    } catch (e) {
      setCourts([])
      toast.error('No se pudo cargar la disponibilidad', {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }, [date, selectedCityId])

  useEffect(() => {
    void load()
  }, [load])

  function requestBooking(
    courtId: string,
    courtName: string,
    slots: Slot[],
    startIndex: number,
  ) {
    const { startAt, endAt } = rangeFromSlots(slots, startIndex, durationHours)
    setPending({ courtId, courtName, slots, startIndex, startAt, endAt })
  }

  async function confirmBooking() {
    if (!pending) {
      return
    }
    setBooking(true)
    try {
      await createReservation({
        courtId: pending.courtId,
        startAt: pending.startAt,
        endAt: pending.endAt,
      })
      toast.success('Reserva creada', {
        description: `${pending.courtName} · ${formatInstantShort(pending.startAt)}`,
      })
      setPending(null)
      navigate('/panel/reservas')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo crear la reserva'
      toast.error(msg)
    } finally {
      setBooking(false)
    }
  }

  const maxDate = addDaysIsoDate(todayIsoDate(), 30)

  const totalBookable = useMemo(
    () =>
      courts.reduce((acc, court) => {
        let n = 0
        for (let i = 0; i < court.slots.length; i++) {
          if (canBookBlock(court.slots, i, durationHours)) {
            n++
          }
        }
        return acc + n
      }, 0),
    [courts, durationHours],
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Nueva reserva
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elegí fecha y duración (1 a 3 horas). Solo se muestran horarios
            libres según la disponibilidad actual.
          </p>
        </div>
        {selectedCity && (
          <Badge variant="muted" className="h-7 px-3 text-sm">
            <MapPin className="h-3.5 w-3.5" />
            {selectedCity.name}
          </Badge>
        )}
      </header>

      {!selectedCityId && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <MapPin className="h-7 w-7" />
            </div>
            <div className="max-w-md">
              <h2 className="font-display text-xl font-semibold">
                Elegí tu ciudad para ver canchas
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Necesitamos saber en qué ciudad querés jugar para mostrarte las
                canchas disponibles.
              </p>
            </div>
            <CitySelector />
          </CardContent>
        </Card>
      )}

      {selectedCityId && (
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-5">
          <label className="flex flex-1 flex-col gap-1.5 min-w-[12rem]">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Fecha
            </span>
            <input
              type="date"
              value={date}
              min={todayIsoDate()}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
            />
          </label>

          <div className="flex flex-1 flex-col gap-1.5 min-w-[12rem]">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Duración
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDurationHours(h as 1 | 2 | 3)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
                    durationHours === h
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-input bg-background hover:border-primary/40 hover:text-primary',
                  )}
                >
                  {h} h
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <Badge
              variant={totalBookable > 0 ? 'success' : 'muted'}
              className="h-10 self-end px-3 text-sm"
            >
              {totalBookable} bloques reservables
            </Badge>
          )}
        </CardContent>
      </Card>
      )}

      {selectedCityId && loading && (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pb-5">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-9 w-32" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCityId && !loading && courts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay canchas activas en {selectedCity?.name ?? 'esta ciudad'} para esta fecha.
          </CardContent>
        </Card>
      )}

      {selectedCityId && !loading &&
        courts.map((court) => {
          const blocks = court.slots
            .map((_, i) => i)
            .filter((i) => canBookBlock(court.slots, i, durationHours))

          return (
            <Card key={court.courtId}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{court.courtName}</CardTitle>
                  <Badge variant={blocks.length > 0 ? 'success' : 'muted'}>
                    {blocks.length} disponibles
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {court.slots.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sin horario operativo para este día o cancha sin franjas.
                  </p>
                )}
                {court.slots.length > 0 && blocks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No hay bloques contiguos de {durationHours} h libres en esta cancha.
                  </p>
                )}
                {blocks.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {blocks.map((i) => {
                      const { startAt, endAt } = rangeFromSlots(
                        court.slots,
                        i,
                        durationHours,
                      )
                      return (
                        <li key={`${court.courtId}-${i}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              requestBooking(
                                court.courtId,
                                court.courtName,
                                court.slots,
                                i,
                              )
                            }
                          >
                            {formatInstantShort(startAt)} – {formatInstantShort(endAt)}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !booking) {
            setPending(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reserva</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && (
                <>
                  Vas a reservar la <strong>{pending.courtName}</strong> el{' '}
                  <strong>{formatInstantShort(pending.startAt)}</strong> por{' '}
                  <strong>{durationHours} h</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={booking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void confirmBooking()
              }}
              disabled={booking}
            >
              {booking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reservando…
                </>
              ) : (
                'Confirmar reserva'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
