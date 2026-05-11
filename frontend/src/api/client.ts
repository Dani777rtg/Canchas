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

/**
 * Mapea códigos/estados HTTP a mensajes amigables en español neutro.
 * Si el backend devuelve un mensaje claro, se respeta; solo se reemplaza
 * cuando el mensaje es técnico (statusText, vacío, o stack de Spring).
 */
function friendlyMessage(status: number, code: string, raw: string): string {
  // Si el back devolvió un mensaje legible, lo dejamos
  const looksTechnical =
    !raw ||
    raw === 'OK' ||
    /^[A-Z][a-z]+(Exception|Error)/.test(raw) ||
    raw.toLowerCase().includes('servlet') ||
    raw.toLowerCase().includes('whitelabel')

  if (!looksTechnical) {
    return raw
  }

  switch (status) {
    case 400:
      return 'Los datos enviados no son válidos. Revisá los campos y volvé a intentar.'
    case 401:
      return 'Tu sesión venció. Iniciá sesión de nuevo.'
    case 403:
      return 'No tenés permisos para realizar esta acción.'
    case 404:
      return 'No encontramos lo que buscás.'
    case 409:
      return 'Ese horario ya fue tomado por otra persona. Probá otro.'
    case 422:
      return 'No pudimos procesar la solicitud con esos datos.'
    case 429:
      return 'Demasiados intentos. Esperá un momento y probá de nuevo.'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'El servidor tuvo un problema. Probá de nuevo en unos segundos.'
    default:
      return code !== 'ERROR'
        ? `Error: ${code}`
        : 'Ocurrió un error inesperado. Intentá de nuevo.'
  }
}

async function parseJsonError(res: Response): Promise<never> {
  let rawMessage = res.statusText
  let code = 'ERROR'
  try {
    const body = (await res.json()) as ApiErrorBody
    if (body.message) {
      rawMessage = body.message
    }
    if (body.code) {
      code = body.code
    }
  } catch {
    /* ignore */
  }

  // Al recibir 401, limpiamos el token para forzar re-login en el próximo intento
  if (res.status === 401) {
    setStoredToken(null)
  }

  const message = friendlyMessage(res.status, code, rawMessage)
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

  let res: Response
  try {
    res = await fetch(path, { ...rest, headers })
  } catch {
    throw new ApiError(
      0,
      'NETWORK',
      'No pudimos conectar con el servidor. Revisá tu conexión a internet.',
    )
  }

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
