export type CourtStatus = 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO'

export type CourtSummary = {
  id: string
  venueId: string
  venueName: string
  name: string
  sportType: string
  status: CourtStatus
  maintenanceNote: string | null
}

export type AdminUser = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: 'ADMINISTRADOR' | 'CLIENTE'
  status: 'ACTIVO' | 'INACTIVO'
}

export type PaymentStatus =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'FALLIDO'
  | 'REVERSADO'
  | 'EXONERADO'

export type AdminReservation = {
  id: string
  publicCode: string
  courtId: string
  courtName: string
  venueName: string
  userId: string
  userEmail: string
  userFullName: string
  startAt: string
  endAt: string
  status: import('./reservation').ReservationStatus
  paymentStatus: PaymentStatus
  total: string | number
}
