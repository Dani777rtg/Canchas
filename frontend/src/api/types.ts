/** Coincide con `ApiError` del backend (Jackson serializa `Instant` como string). */
export type ApiErrorBody = {
  timestamp?: string
  status: number
  code: string
  message: string
  path?: string
}
