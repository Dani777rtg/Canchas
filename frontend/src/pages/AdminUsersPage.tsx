import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAdminUsers, patchAdminUser } from '@/api/admin'
import type { AdminUser } from '@/types/admin'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/useAuth'
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

export function AdminUsersPage() {
  usePageTitle('Usuarios — Admin')
  const { user: currentUser } = useAuth()
  const [emailFilter, setEmailFilter] = useState('')
  const [appliedFilter, setAppliedFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<AdminUser[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUsers(page, 15, appliedFilter || undefined)
      setRows(data.content)
      setTotalPages(data.totalPages)
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudieron cargar los usuarios',
      )
      setRows([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [page, appliedFilter])

  useEffect(() => {
    void load()
  }, [load])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setAppliedFilter(emailFilter.trim())
  }

  async function setUserStatus(user: AdminUser, status: AdminUser['status']) {
    setUpdatingUserId(user.id)
    try {
      await patchAdminUser(user.id, { status })
      toast.success(
        status === 'ACTIVO'
          ? `${user.fullName} quedó activo`
          : `${user.fullName} quedó inactivo`,
      )
      await load()
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : 'No se pudo actualizar el usuario',
      )
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listado paginado. Activá o desactivá clientes desde la columna
            Acciones.
          </p>
        </div>
      </header>

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap items-end gap-3" onSubmit={handleSearch}>
            <div className="relative flex-1 min-w-[15rem]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="ej. admin@"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
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
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin resultados.
          </CardContent>
        </Card>
      )}

      {!loading && rows.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => {
                const isSelf = currentUser?.id === u.id
                const canToggle = u.role === 'CLIENTE' && !isSelf
                return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'ADMINISTRADOR' ? 'accent' : 'muted'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {canToggle ? (
                      u.status === 'ACTIVO' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={updatingUserId === u.id}
                          onClick={() => void setUserStatus(u, 'INACTIVO')}
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={updatingUserId === u.id}
                          onClick={() => void setUserStatus(u, 'ACTIVO')}
                        >
                          Activar
                        </Button>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {isSelf ? 'Tu cuenta' : '—'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
