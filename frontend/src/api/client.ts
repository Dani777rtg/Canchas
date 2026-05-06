import type { ApiErrorBody } from './types'

const TOKEN_KEY = 'canchas.accessToken'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token === null) {
    localStorage.removeItem(TOKEN_KEY)
  } else {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

async function parseJsonError(res: Response): Promise<never> {
  let message = res.statusText
  let code = 'ERROR'
  try {
    const body = (await res.json()) as ApiErrorBody
    if (body.message) {
      message = body.message
    }
    if (body.code) {
      code = body.code
    }
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, code, message)
}

type ApiInit = RequestInit & { auth?: boolean }

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { auth = true, ...rest } = init
  const headers = new Headers(rest.headers)
  if (rest.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = auth ? getStoredToken() : null
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(path, { ...rest, headers })

  if (res.status === 204) {
    return undefined as T
  }

  if (!res.ok) {
    await parseJsonError(res)
  }

  const text = await res.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}
