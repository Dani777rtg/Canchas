import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { fetchAvailability, type CourtAvailability } from '@/api/availability'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CitySelector } from '@/components/CitySelector'
import { useCity } from '@/lib/city-context'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import {
  addDaysIsoDate,
  formatTimeRange,
  todayIsoDate,
} from '@/utils/format'

function countFreeSlots(courts: CourtAvailability[]): number {
  return courts.reduce(
    (acc, c) => acc + c.slots.filter((s) => s.available).length,
    0,
  )
}

interface DayPill {
  iso: string
  label: string
  weekday: string
  day: string
}

function buildDayPills(count: number): DayPill[] {
  const dayFmt = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    timeZone: 'America/Bogota',
  })
  const dayNumFmt = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    timeZone: 'America/Bogota',
  })
  const today = todayIsoDate()
  const pills: DayPill[] = []
  for (let i = 0; i < count; i++) {
    const iso = addDaysIsoDate(today, i)
    const [y, m, d] = iso.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const label = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dayFmt.format(date)
    pills.push({
      iso,
      label,
      weekday: dayFmt.format(date),
      day: dayNumFmt.format(date),
    })
  }
  return pills
}

export function HomePage() {
  const { user } = useAuth()
  const { selectedCity, selectedCityId } = useCity()
  usePageTitle(selectedCity ? `Canchas en ${selectedCity.name}` : 'Inicio')
  const [date, setDate] = useState(todayIsoDate)
  const [courts, setCourts] = useState<CourtAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxDate = addDaysIsoDate(todayIsoDate(), 30)
  const dayPills = useMemo(() => buildDayPills(10), [])

  const load = useCallback(async () => {
    if (!selectedCityId) {
      setCourts([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAvailability(date, { venueId: selectedCityId })
      setCourts(data)
    } catch (e) {
      setCourts([])
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo cargar la disponibilidad. ¿Está el backend y PostgreSQL en marcha?',
      )
    } finally {
      setLoading(false)
    }
  }, [date, selectedCityId])

  useEffect(() => {
    void load()
  }, [load])

  const freeTotal = useMemo(() => countFreeSlots(courts), [courts])
  const activeCourts = useMemo(
    () => courts.filter((c) => c.slots.length > 0),
    [courts],
  )
  const totalSlots = useMemo(
    () => courts.reduce((acc, c) => acc + c.slots.length, 0),
    [courts],
  )

  const reservarHref = `/panel/reservar?fecha=${encodeURIComponent(date)}`
  const loginState = { from: reservarHref }
  const cityName = selectedCity?.name

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-10 sm:px-10 sm:py-14">
        <div
          className="absolute inset-0 -z-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(34,197,94,0.18), transparent 45%), radial-gradient(circle at 85% 80%, rgba(249,115,22,0.16), transparent 50%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            <Sparkles className="h-3 w-3" />
            Reservá en 30 segundos
          </Badge>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {cityName ? (
              <>
                Canchas en <span className="text-primary">{cityName}</span>
              </>
            ) : (
              <>
                Encontrá tu cancha y horario.{' '}
                <span className="text-primary">Sin filas, sin llamadas.</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {cityName
              ? `Mirá las canchas disponibles en ${cityName} y reservá tu hora en un par de clics.`
              : 'Consultá qué canchas están activas y qué franjas de una hora están libres. Empezá eligiendo tu ciudad.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <CitySelector />
            {user ? (
              <Button asChild size="lg">
                <Link to={reservarHref}>
                  Ir a reservar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/registro">
                    Crear cuenta y reservar
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/iniciar-sesion" state={loginState}>
                    Ya tengo cuenta
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {!selectedCityId && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <MapPin className="h-7 w-7" />
            </div>
            <div className="max-w-md">
              <h2 className="font-display text-xl font-semibold">
                Primero elegí tu ciudad
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Solo vas a ver canchas disponibles en la ciudad que elijas, así
                no se mezclan resultados de otras ciudades. Lo podés cambiar
                cuando quieras.
              </p>
            </div>
            <CitySelector />
          </CardContent>
        </Card>
      )}

      {/* Selector de día */}
      {selectedCityId && (
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
            <CalendarDays className="h-5 w-5 text-primary" />
            Elegí un día
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Hora Bogotá · bloques de 1 h
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
          {dayPills.map((pill) => {
            const active = pill.iso === date
            return (
              <button
                key={pill.iso}
                type="button"
                onClick={() => setDate(pill.iso)}
                className={cn(
                  'flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 text-center transition-all',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:text-primary',
                )}
              >
                <span
                  className={cn(
                    'text-[0.7rem] font-semibold uppercase tracking-wide',
                    active ? 'text-primary-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {pill.label}
                </span>
                <span className="font-display text-xl font-bold leading-tight">
                  {pill.day}
                </span>
                <span
                  className={cn(
                    'text-[0.65rem] font-medium uppercase',
                    active ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {pill.weekday}
                </span>
              </button>
            )
          })}

          <label
            className="flex min-w-[10rem] shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            title="Elegir otra fecha"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            <input
              type="date"
              value={date}
              min={todayIsoDate()}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
              aria-label="Elegir otra fecha"
            />
          </label>
        </div>
      </section>
      )}

      {/* Stats / resumen */}
      {selectedCityId && !loading && !error && courts.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">
                  {activeCourts.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeCourts.length === 1
                    ? 'cancha abierta este día'
                    : 'canchas abiertas este día'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">
                  {freeTotal}
                </div>
                <div className="text-xs text-muted-foreground">
                  {freeTotal === 1
                    ? 'horario libre disponible'
                    : 'horarios libres disponibles'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-accent/20 p-2 text-accent-foreground dark:text-accent">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">
                  {totalSlots}
                </div>
                <div className="text-xs text-muted-foreground">
                  franjas totales programadas
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Errores */}
      {selectedCityId && error && (
        <div
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">No pudimos cargar la disponibilidad</p>
            <p className="mt-1 text-destructive/85">{error}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Lista de canchas */}
      {selectedCityId && (
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          Disponibilidad por cancha
          {cityName && (
            <Badge variant="muted" className="font-normal">
              <MapPin className="h-3 w-3" />
              {cityName}
            </Badge>
          )}
        </h2>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-8 w-20" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && courts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="rounded-full bg-muted p-4 text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">
                  No hay canchas activas en {cityName ?? 'esta ciudad'} todavía.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Probá con otra ciudad o volvé más tarde.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && courts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => {
              const free = court.slots.filter((s) => s.available).length
              const total = court.slots.length
              const closed = total === 0
              return (
                <Card
                  key={court.courtId}
                  className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {court.courtName}
                      </CardTitle>
                      {!closed && (
                        <Badge
                          variant={free > 0 ? 'success' : 'muted'}
                          className="shrink-0"
                        >
                          {free} / {total} libres
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {closed && (
                      <p className="text-sm text-muted-foreground">
                        Esta cancha no atiende este día o aún no tiene horario
                        cargado.
                      </p>
                    )}
                    {!closed && (
                      <ul
                        className="flex flex-wrap gap-1.5"
                        aria-label={`Horarios de ${court.courtName}`}
                      >
                        {court.slots.map((slot) => (
                          <li key={slot.startAt}>
                            <span
                              className={cn(
                                'inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold',
                                slot.available
                                  ? 'border-primary/40 bg-primary/10 text-primary'
                                  : 'border-border bg-muted/60 text-muted-foreground line-through decoration-muted-foreground/50',
                              )}
                            >
                              {formatTimeRange(slot.startAt, slot.endAt)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
      )}

      {/* CTA final */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/40 p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              ¿Listo para reservar?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bloqueá tu turno (1 a 3 horas seguidas según disponibilidad). Te
              llega el comprobante al instante.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user ? (
              <Button asChild size="lg">
                <Link to={reservarHref}>
                  Reservar ahora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/registro">Crear cuenta</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/iniciar-sesion" state={loginState}>
                    Iniciar sesión
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
