import { Badge } from '@/components/ui/badge'

type ReservationStatus =
  | 'CONFIRMADA'
  | 'PENDIENTE_PAGO'
  | 'CANCELADA'
  | 'CANCELADA_TARDIA'
  | 'FINALIZADA'

type CourtStatus = 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO'

type UserStatus = 'ACTIVO' | 'INACTIVO'

type AnyStatus = ReservationStatus | CourtStatus | UserStatus | string

interface StatusBadgeProps {
  status: AnyStatus
  className?: string
}

const RESERVATION_LABELS: Record<ReservationStatus, string> = {
  CONFIRMADA: 'Confirmada',
  PENDIENTE_PAGO: 'Pendiente de pago',
  CANCELADA: 'Cancelada',
  CANCELADA_TARDIA: 'Cancelada tarde',
  FINALIZADA: 'Finalizada',
}

const COURT_LABELS: Record<CourtStatus, string> = {
  ACTIVA: 'Activa',
  INACTIVA: 'Inactiva',
  MANTENIMIENTO: 'Mantenimiento',
}

const USER_LABELS: Record<UserStatus, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case 'CONFIRMADA':
      return (
        <Badge variant="success" className={className}>
          {RESERVATION_LABELS.CONFIRMADA}
        </Badge>
      )
    case 'PENDIENTE_PAGO':
      return (
        <Badge variant="warning" className={className}>
          {RESERVATION_LABELS.PENDIENTE_PAGO}
        </Badge>
      )
    case 'CANCELADA':
      return (
        <Badge variant="muted" className={className}>
          {RESERVATION_LABELS.CANCELADA}
        </Badge>
      )
    case 'CANCELADA_TARDIA':
      return (
        <Badge variant="destructive" className={className}>
          {RESERVATION_LABELS.CANCELADA_TARDIA}
        </Badge>
      )
    case 'FINALIZADA':
      return (
        <Badge variant="default" className={className}>
          {RESERVATION_LABELS.FINALIZADA}
        </Badge>
      )
    case 'ACTIVA':
      return (
        <Badge variant="success" className={className}>
          {COURT_LABELS.ACTIVA}
        </Badge>
      )
    case 'INACTIVA':
      return (
        <Badge variant="muted" className={className}>
          {COURT_LABELS.INACTIVA}
        </Badge>
      )
    case 'MANTENIMIENTO':
      return (
        <Badge variant="warning" className={className}>
          {COURT_LABELS.MANTENIMIENTO}
        </Badge>
      )
    case 'ACTIVO':
      return (
        <Badge variant="success" className={className}>
          {USER_LABELS.ACTIVO}
        </Badge>
      )
    case 'INACTIVO':
      return (
        <Badge variant="muted" className={className}>
          {USER_LABELS.INACTIVO}
        </Badge>
      )
    case 'PAGADO':
      return (
        <Badge variant="success" className={className}>
          Pagado
        </Badge>
      )
    case 'PENDIENTE':
      return (
        <Badge variant="warning" className={className}>
          Pendiente
        </Badge>
      )
    case 'FALLIDO':
      return (
        <Badge variant="destructive" className={className}>
          Fallido
        </Badge>
      )
    case 'REVERSADO':
      return (
        <Badge variant="muted" className={className}>
          Reversado
        </Badge>
      )
    case 'EXONERADO':
      return (
        <Badge variant="default" className={className}>
          Exonerado
        </Badge>
      )
    default:
      return (
        <Badge variant="muted" className={className}>
          {status}
        </Badge>
      )
  }
}
