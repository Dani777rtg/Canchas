import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/client'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      })
      navigate('/panel', { replace: true })
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'No se pudo registrar. Revisá los datos.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--narrow">
      <h1>Crear cuenta</h1>
      <p className="muted">
        La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula y número.
      </p>
      <form className="form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <label className="field">
          <span>Nombre completo</span>
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={3}
            maxLength={180}
          />
        </label>
        <label className="field">
          <span>Correo</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Teléfono (opcional)</span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={72}
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>
      <p className="muted form-footer">
        ¿Ya tenés cuenta? <Link to="/iniciar-sesion">Iniciá sesión</Link>
      </p>
    </div>
  )
}
