import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { fetchAvailability, type CourtAvailability } from '../api/availability'
import {
  addDaysIsoDate,
  formatTimeRange,
  todayIsoDate,
} from '../utils/format'

function countFreeSlots(courts: CourtAvailability[]): number {
  return courts.reduce((acc, c) => acc + c.slots.filter((s) => s.available).length, 0)
}

export function HomePage() {
  const { user } = useAuth()
  const [date, setDate] = useState(todayIsoDate)
  const [courts, setCourts] = useState<CourtAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const maxDate = addDaysIsoDate(todayIsoDate(), 30)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAvailability(date)
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
  }, [date])

  useEffect(() => {
    void load()
  }, [load])

  const freeTotal = useMemo(() => countFreeSlots(courts), [courts])
  const activeCourts = useMemo(() => courts.filter((c) => c.slots.length > 0), [courts])

  const reservarHref = `/panel/reservar?fecha=${encodeURIComponent(date)}`
  const loginState = { from: reservarHref }

  return (
    <div className="page home-page">
      <header className="home-hero">
        <h1 className="home-hero__title">Encontrá tu cancha y horario</h1>
        <p className="home-hero__subtitle">
          Acá ves qué canchas están activas y qué franjas de una hora están libres u ocupadas. No
          hace falta iniciar sesión para consultar. Cuando quieras reservar, creá una cuenta o
          entrá con la tuya.
        </p>
      </header>

      <div className="card home-toolbar">
        <label className="field field--inline field--grow">
          <span>Día</span>
          <input
            type="date"
            value={date}
            min={todayIsoDate()}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Fecha para ver disponibilidad"
          />
        </label>
        <p className="home-toolbar__hint muted">
          Horarios en hora Colombia (Bogotá). Cada bloque es 1 hora.
        </p>
      </div>

      {error && (
        <div className="form-error home-error" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="muted home-loading">Cargando canchas y horarios…</p>}

      {!loading && !error && courts.length === 0 && (
        <p className="muted">Todavía no hay canchas activas en el sistema.</p>
      )}

      {!loading && courts.length > 0 && (
        <>
          <p className="home-summary" aria-live="polite">
            <strong>{activeCourts.length}</strong> {activeCourts.length === 1 ? 'cancha abierta' : 'canchas abiertas'} este día
            · <strong>{freeTotal}</strong> {freeTotal === 1 ? 'horario libre' : 'horarios libres'} en total
          </p>

          <div className="home-courts">
            {courts.map((court) => (
              <article key={court.courtId} className="card home-court-card">
                <div className="home-court-card__head">
                  <h2 className="home-court-card__name">{court.courtName}</h2>
                  {court.slots.length > 0 && (
                    <span className="home-court-card__badge">
                      {court.slots.filter((s) => s.available).length} libres / {court.slots.length}
                    </span>
                  )}
                </div>

                {court.slots.length === 0 && (
                  <p className="muted home-court-card__empty">
                    Esta cancha no atiende este día de la semana o aún no tiene horario cargado.
                  </p>
                )}

                {court.slots.length > 0 && (
                  <>
                    <p className="home-legend muted">
                      <span className="home-legend__item">
                        <span className="home-legend__swatch home-legend__swatch--free" /> Libre
                      </span>
                      <span className="home-legend__item">
                        <span className="home-legend__swatch home-legend__swatch--busy" /> Ocupado
                      </span>
                    </p>
                    <ul className="home-slots" aria-label={`Horarios de ${court.courtName}`}>
                      {court.slots.map((slot) => (
                        <li key={slot.startAt}>
                          <span
                            className={
                              slot.available ? 'home-slot home-slot--free' : 'home-slot home-slot--busy'
                            }
                          >
                            {formatTimeRange(slot.startAt, slot.endAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      <section className="card home-cta">
        <h2 className="home-cta__title">¿Listo para reservar?</h2>
        <p className="home-cta__text muted">
          Elegí fecha arriba, revisá los horarios libres y continuá para bloquear tu turno (1 a 3
          horas seguidas según disponibilidad).
        </p>
        <div className="cta-row home-cta__buttons">
          {user ? (
            <Link to={reservarHref} className="btn btn--primary">
              Ir a reservar
            </Link>
          ) : (
            <>
              <Link to="/registro" className="btn btn--primary">
                Crear cuenta y reservar
              </Link>
              <Link to="/iniciar-sesion" state={loginState} className="btn btn--secondary">
                Ya tengo cuenta
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
