/** Celular colombiano: 10 dígitos, inicia en 3. */
export const CO_MOBILE_PHONE_PATTERN = /^3\d{9}$/

export function sanitizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

export function isValidCoMobilePhone(phone: string): boolean {
  const digits = phone.trim()
  if (!digits) {
    return true
  }
  return CO_MOBILE_PHONE_PATTERN.test(digits)
}

export const CO_MOBILE_PHONE_HINT =
  '10 dígitos numéricos, celular colombiano (ej. 3001234567)'
