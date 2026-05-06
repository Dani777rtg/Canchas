import type { User } from '../types/user'
import { apiFetch, setStoredToken } from './client'

export type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  user: User
}

export type LoginBody = {
  email: string
  password: string
}

export type RegisterBody = {
  email: string
  password: string
  fullName: string
  phone?: string
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  })
  setStoredToken(data.accessToken)
  return data
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const { phone, ...rest } = body
  const payload = {
    ...rest,
    ...(phone?.trim() ? { phone: phone.trim() } : {}),
  }
  const data = await apiFetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  })
  setStoredToken(data.accessToken)
  return data
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>('/api/v1/auth/logout', { method: 'POST' })
  } finally {
    setStoredToken(null)
  }
}
