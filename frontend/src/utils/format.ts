const BOGOTA = 'America/Bogota'

export function formatInstantRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const dFmt = new Intl.DateTimeFormat('es-CO', {
    timeZone: BOGOTA,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const tFmt = new Intl.DateTimeFormat('es-CO', {
    timeZone: BOGOTA,
    hour: '2-digit',
    minute: '2-digit',
  })
  const dayPart = dFmt.format(start)
  return `${dayPart} · ${tFmt.format(start)} – ${tFmt.format(end)}`
}

export function formatInstantShort(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: BOGOTA,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** COP sin decimales en pantalla (el backend puede enviar número o string). */
export function formatCop(amount: string | number): string {
  const n = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isNaN(n)) {
    return String(amount)
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.round(n))
}

export function todayIsoDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDaysIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
