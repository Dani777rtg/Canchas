import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAvailability, type CourtAvailability, type Slot } from '../api/availability'
import { createReservation } from '../api/reservations'
import { ApiError } from '../api/client'
import { addDaysIsoDate, formatInstantShort, todayIsoDate } from '../utils/format'

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

export function ReservarPage() {
  const navigate = useNavigate()
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingKey, setBookingKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAvailability(date)
      setCourts(data)
    } catch (e) {
      setCourts([])
      setError(e instanceof Error ? e.message : 'No se pudo cargar la disponibilidad')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    void load()
  }, [load])

  async function handleBook(courtId: string, slots: Slot[], startIndex: number) {
    const { startAt, endAt } = rangeFromSlots(slots, startIndex, durationHours)
    const key = `${courtId}-${startIndex}`
    setBookingKey(key)
    setError(null)
    try {
      await createReservation({ courtId, startAt, endAt })
      navigate('/panel/reservas')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo crear la reserva'
      setError(msg)
    } finally {
      setBookingKey(null)
    }
  }

  const maxDate = addDaysIsoDate(todayIsoDate(), 30)

  return (
    <div className="page">
      <h1>Nueva reserva</h1>
      <p className="lede">
        Elegí fecha y duración (1 a 3 horas). Solo se muestran horarios libres según la disponibilidad
        actual.
      </p>

      <div className="card form-row">
        <label className="field field--inline">
          <span>Fecha</span>
          <input
            type="date"
            value={date}
            min={todayIsoDate()}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="field field--inline">
          <span>Duración</span>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value) as 1 | 2 | 3)}
          >
            <option value={1}>1 hora</option>
            <option value={2}>2 horas</option>
            <option value={3}>3 horas</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="muted">Cargando disponibilidad…</p>}

      {!loading &&
        courts.map((court) => (
          <section key={court.courtId} className="card court-block">
            <h2>{court.courtName}</h2>
            {court.slots.length === 0 && (
              <p className="muted">Sin horario operativo para este día o cancha sin franjas.</p>
            )}
            {court.slots.length > 0 && (
              <ul className="slot-actions">
                {court.slots.map((_, i) => {
                  if (!canBookBlock(court.slots, i, durationHours)) {
                    return null
                  }
                  const { startAt, endAt } = rangeFromSlots(court.slots, i, durationHours)
                  const busy = bookingKey === `${court.courtId}-${i}`
                  return (
                    <li key={`${court.courtId}-${i}`}>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Reservar ${court.courtName} el ${formatInstantShort(startAt)} (${durationHours} h)?`,
                            )
                          ) {
                            void handleBook(court.courtId, court.slots, i)
                          }
                        }}
                      >
                        {busy ? 'Reservando…' : `${formatInstantShort(startAt)} – ${formatInstantShort(endAt)}`}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
    </div>
  )
}
