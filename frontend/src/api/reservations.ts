import type { Receipt, Reservation } from '../types/reservation'
import { ApiError, apiFetch, getStoredToken } from './client'
import type { ApiErrorBody } from './types'
import type { SpringPage } from './pagination'

export async function createReservation(body: {
  courtId: string
  startAt: string
  endAt: string
}): Promise<Reservation> {
  const idempotencyKey = crypto.randomUUID()
  const token = getStoredToken()
  const res = await fetch('/api/v1/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()

  if (!res.ok) {
    let message = res.statusText
    let code = 'ERROR'
    try {
      const j = JSON.parse(text) as ApiErrorBody
      if (j.message) {
        message = j.message
      }
      if (j.code) {
        code = j.code
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, code, message)
  }

  let data: unknown = JSON.parse(text || '{}')
  if (typeof data === 'string') {
    data = JSON.parse(data)
  }
  return data as Reservation
}

export async function fetchMyReservations(
  page = 1,
  limit = 20,
): Promise<SpringPage<Reservation>> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return apiFetch<SpringPage<Reservation>>(`/api/v1/reservations/mine?${q.toString()}`)
}

export async function fetchReservation(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/v1/reservations/${id}`)
}

export async function cancelReservation(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/v1/reservations/${id}/cancel`, {
    method: 'POST',
  })
}

export async function deleteReservation(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/reservations/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchReceipt(id: string): Promise<Receipt> {
  return apiFetch<Receipt>(`/api/v1/reservations/${id}/receipt`)
}
