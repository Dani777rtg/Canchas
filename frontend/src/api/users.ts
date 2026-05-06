import type { User } from '../types/user'
import { apiFetch } from './client'

export async function fetchMe(): Promise<User> {
  return apiFetch<User>('/api/v1/users/me')
}
