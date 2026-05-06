import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { setStoredToken, getStoredToken } from '../api/client'
import { fetchMe } from '../api/users'
import type { User } from '../types/user'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  const refreshUser = useCallback(async () => {
    const data = await fetchMe()
    setUser(data)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!getStoredToken()) {
        if (!cancelled) {
          setReady(true)
        }
        return
      }
      try {
        const me = await fetchMe()
        if (!cancelled) {
          setUser(me)
        }
      } catch {
        setStoredToken(null)
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    setUser(res.user)
  }, [])

  const register = useCallback(
    async (input: {
      email: string
      password: string
      fullName: string
      phone?: string
    }) => {
      const res = await authApi.register(input)
      setUser(res.user)
    },
    [],
  )

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, ready, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
