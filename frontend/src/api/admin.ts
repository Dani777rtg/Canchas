import { apiFetch, getStoredToken } from './client'
import type { AdminUser, CourtSummary } from '../types/admin'
import type { SpringPage } from './pagination'

export async function fetchAdminCourts(): Promise<CourtSummary[]> {
  return apiFetch<CourtSummary[]>('/api/v1/admin/courts')
}

export async function fetchAdminUsers(
  page = 1,
  limit = 20,
  email?: string,
): Promise<SpringPage<AdminUser>> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (email?.trim()) {
    q.set('email', email.trim())
  }
  return apiFetch<SpringPage<AdminUser>>(`/api/v1/admin/users?${q.toString()}`)
}

export type ReportMap = Record<string, string | number | undefined>

export async function fetchReportReservations(from: string, to: string): Promise<ReportMap> {
  const q = new URLSearchParams({ from, to })
  return apiFetch<ReportMap>(`/api/v1/admin/reports/reservations?${q.toString()}`)
}

export async function fetchReportOccupancy(from: string, to: string): Promise<ReportMap> {
  const q = new URLSearchParams({ from, to })
  return apiFetch<ReportMap>(`/api/v1/admin/reports/occupancy?${q.toString()}`)
}

export async function fetchReportRevenue(from: string, to: string): Promise<ReportMap> {
  const q = new URLSearchParams({ from, to })
  return apiFetch<ReportMap>(`/api/v1/admin/reports/revenue?${q.toString()}`)
}

export async function downloadReportCsv(from: string, to: string): Promise<Blob> {
  const q = new URLSearchParams({ format: 'csv', from, to })
  const token = getStoredToken()
  const res = await fetch(`/api/v1/admin/reports/export?${q.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.blob()
}
