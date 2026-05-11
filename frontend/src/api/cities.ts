import { apiFetch } from './client'

export type City = {
  id: string
  name: string
}

export async function fetchCities(): Promise<City[]> {
  return apiFetch<City[]>('/api/v1/cities')
}
