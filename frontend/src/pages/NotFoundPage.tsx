import { Compass, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/lib/use-page-title'

export function NotFoundPage() {
  usePageTitle('Página no encontrada')
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="rounded-full bg-primary/10 p-5 text-primary">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="font-display text-5xl font-bold tracking-tight">404</h1>
      <p className="text-sm text-muted-foreground">
        No encontramos esa página. Puede que el enlace esté roto o el contenido
        ya no exista.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>
    </div>
  )
}
