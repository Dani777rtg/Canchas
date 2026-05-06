export type UserRole = 'ADMINISTRADOR' | 'CLIENTE'

export type UserStatus = 'ACTIVO' | 'INACTIVO'

export type User = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: UserRole
  status: UserStatus
}
