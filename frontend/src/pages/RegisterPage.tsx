import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePageTitle } from '@/lib/use-page-title'

export function RegisterPage() {
  usePageTitle('Crear cuenta')
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
        err instanceof ApiError
          ? err.message
          : 'No se pudo registrar. Revisá los datos.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="mx-auto mb-2 rounded-full bg-primary/10 p-3 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle className="text-center text-2xl">Crear cuenta</CardTitle>
          <CardDescription className="text-center">
            La contraseña debe tener al menos 8 caracteres e incluir mayúscula,
            minúscula y número.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Nombre completo</Label>
              <Input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={3}
                maxLength={180}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Correo</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-phone">
                Teléfono{' '}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                placeholder="3001234567"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Contraseña</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={72}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta…
                </>
              ) : (
                'Registrarme'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{' '}
        <Link
          to="/iniciar-sesion"
          className="font-semibold text-primary hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
