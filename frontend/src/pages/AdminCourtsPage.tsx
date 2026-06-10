import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, MapPin, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAdminCourts, patchAdminCourt } from '@/api/admin'
import type { CourtSummary } from '@/types/admin'
import { ApiError } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/StatusBadge'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'

function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function AdminCourtsPage() {
  usePageTitle('Canchas — Admin')
  const [courts, setCourts] = useState<CourtSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [cityFilter, setCityFilter] = useState<string | null>(null)
  const [updatingCourtId, setUpdatingCourtId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminCourts()
      setCourts(data)
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'No se pudieron cargar las canchas',
      )
      setCourts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const cities = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>()
    for (const c of courts) {
      const cur = map.get(c.venueId)
      if (cur) {
        cur.count++
      } else {
        map.set(c.venueId, { id: c.venueId, name: c.venueName, count: 1 })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [courts])

  const filtered = useMemo(() => {
    const q = stripDiacritics(query.trim())
    return courts.filter((c) => {
      if (cityFilter && c.venueId !== cityFilter) {
        return false
      }
      if (!q) {
        return true
      }
      return (
        stripDiacritics(c.name).includes(q) ||
        stripDiacritics(c.venueName).includes(q) ||
        stripDiacritics(c.sportType).includes(q)
      )
    })
  }, [courts, query, cityFilter])

  const grouped = useMemo(() => {
    const m = new Map<string, { cityName: string; rows: CourtSummary[] }>()
    for (const c of filtered) {
      const g = m.get(c.venueId)
      if (g) {
        g.rows.push(c)
      } else {
        m.set(c.venueId, { cityName: c.venueName, rows: [c] })
      }
    }
    return Array.from(m.entries())
      .map(([venueId, v]) => ({ venueId, cityName: v.cityName, rows: v.rows }))
      .sort((a, b) => a.cityName.localeCompare(b.cityName))
  }, [filtered])

  const activeCount = courts.filter((c) => c.status === 'ACTIVA').length

  async function setCourtStatus(court: CourtSummary, status: CourtSummary['status']) {
    setUpdatingCourtId(court.id)
    try {
      await patchAdminCourt(court.id, { status })
      toast.success(
        status === 'ACTIVA'
          ? `${court.name} quedó activa`
          : status === 'INACTIVA'
            ? `${court.name} quedó inactiva`
            : `${court.name} actualizada`,
      )
      await load()
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : 'No se pudo actualizar la cancha',
      )
    } finally {
      setUpdatingCourtId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Canchas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Todas las canchas del sistema, agrupadas por ciudad. Incluye
              inactivas y en mantenimiento.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" />
          Recargar
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">
                {courts.length}
              </div>
              <div className="text-xs text-muted-foreground">canchas totales</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">
                {activeCount}
              </div>
              <div className="text-xs text-muted-foreground">activas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-accent/20 p-2 text-accent-foreground dark:text-accent">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">
                {cities.length}
              </div>
              <div className="text-xs text-muted-foreground">ciudades</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre de cancha, ciudad o deporte…"
              className="pl-9"
            />
          </div>

          {cities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCityFilter(null)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  cityFilter === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                Todas ({courts.length})
              </button>
              {cities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCityFilter(c.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                    cityFilter === c.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.name} ({c.count})
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No hay canchas que coincidan con el filtro.
          </CardContent>
        </Card>
      )}

      {!loading && grouped.length > 0 && (
        <div className="space-y-6">
          {grouped.map(({ venueId, cityName, rows }) => (
            <section key={venueId}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  <MapPin className="mr-1 inline h-4 w-4 text-primary" />
                  {cityName}
                </h2>
                <Badge variant="muted" className="font-normal">
                  {rows.length} {rows.length === 1 ? 'cancha' : 'canchas'}
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Deporte</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Nota mantenimiento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.sportType}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.maintenanceNote ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {c.status !== 'ACTIVA' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={updatingCourtId === c.id}
                              onClick={() => void setCourtStatus(c, 'ACTIVA')}
                            >
                              Activar
                            </Button>
                          )}
                          {c.status !== 'INACTIVA' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={updatingCourtId === c.id}
                              onClick={() => void setCourtStatus(c, 'INACTIVA')}
                            >
                              Desactivar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
