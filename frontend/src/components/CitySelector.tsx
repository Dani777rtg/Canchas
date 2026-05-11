import { useMemo, useState } from 'react'
import { Check, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCity } from '@/lib/city-context'
import { cn } from '@/lib/utils'

function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

interface CitySelectorProps {
  variant?: 'inline' | 'header'
  className?: string
}

export function CitySelector({
  variant = 'inline',
  className,
}: CitySelectorProps) {
  const { cities, loading, selectedCity, setSelectedCityId } = useCity()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return cities
    }
    const q = stripDiacritics(query.trim())
    return cities.filter((c) => stripDiacritics(c.name).includes(q))
  }, [cities, query])

  const label = selectedCity?.name ?? 'Elegir ciudad'

  const trigger =
    variant === 'header' ? (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        aria-label="Seleccionar ciudad"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="font-semibold">{label}</span>
      </Button>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn('w-full justify-start gap-2 sm:w-auto', className)}
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="flex-1 text-left">
          {selectedCity ? (
            <>
              <span className="block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Ciudad
              </span>
              <span className="block font-semibold">{selectedCity.name}</span>
            </>
          ) : (
            <span className="font-semibold">Elegir ciudad</span>
          )}
        </span>
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Elegí tu ciudad</DialogTitle>
          <DialogDescription>
            Solo vas a ver canchas disponibles en la ciudad que elijas. Lo
            podés cambiar cuando quieras.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ciudad…"
            autoFocus
            className="pl-9"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {loading && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Cargando ciudades…
            </p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No encontramos ciudades con ese nombre.
            </p>
          )}
          <ul className="space-y-1">
            {filtered.map((city) => {
              const active = city.id === selectedCity?.id
              return (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCityId(city.id)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary',
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin
                        className={cn(
                          'h-4 w-4',
                          active ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      {city.name}
                    </span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
