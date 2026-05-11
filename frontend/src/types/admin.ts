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
