import { apiFetch } from './client'

export type Slot = {
  startAt: string
  endAt: string
  available: boolean
}

export type CourtAvailability = {
  courtId: string
  courtName: string
  slots: Slot[]
}

export async function fetchAvailability(
  date: string,
  opts?: { courtId?: string; venueId?: string },
): Promise<CourtAvailability[]> {
  const q = new URLSearchParams({ date })
  if (opts?.courtId) {
    q.set('courtId', opts.courtId)
  }
  if (opts?.venueId) {
    q.set('venueId', opts.venueId)
  }
  return apiFetch<CourtAvailability[]>(`/api/v1/availability?${q.toString()}`)
}
