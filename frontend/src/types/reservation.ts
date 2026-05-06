export type ReservationStatus =
  | 'CONFIRMADA'
  | 'PENDIENTE_PAGO'
  | 'CANCELADA'
  | 'CANCELADA_TARDIA'
  | 'FINALIZADA'

export type CancellationType = 'TEMPRANA' | 'TARDIA'

export type Reservation = {
  id: string
  publicCode: string
  courtId: string
  courtName: string
  userId: string
  startAt: string
  endAt: string
  status: ReservationStatus
  cancellationType: CancellationType | null
  noShow: boolean
  subtotal: string | number
  taxAmount: string | number
  total: string | number
}

export type Receipt = {
  publicCode: string
  reservationId: string
  courtName: string
  startAt: string
  endAt: string
  total: string | number
  currency: string
  note: string
}
