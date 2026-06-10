/** Formato estándar: local@dominio.tld (mínimo 2 letras en TLD). */
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  if (!trimmed) {
    return false
  }
  return EMAIL_PATTERN.test(trimmed)
}

export const EMAIL_FORMAT_HINT = 'Formato válido: nombre@correo.com'

export const EMAIL_INVALID_MESSAGE =
  'El correo debe tener un formato válido (ej. nombre@correo.com).'
