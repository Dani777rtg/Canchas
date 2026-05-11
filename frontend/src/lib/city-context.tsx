import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchCities, type City } from '@/api/cities'

const STORAGE_KEY = 'canchas:city'

interface CityState {
  cities: City[]
  loading: boolean
  error: string | null
  selectedCityId: string | null
  selectedCity: City | null
  setSelectedCityId: (id: string | null) => void
  reload: () => Promise<void>
}

const CityContext = createContext<CityState | undefined>(undefined)

function readStored(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(STORAGE_KEY)
}

function writeStored(id: string | null) {
  if (typeof window === 'undefined') {
    return
  }
  if (id) {
    window.localStorage.setItem(STORAGE_KEY, id)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCityId, setSelectedCityIdState] = useState<string | null>(
    () => readStored(),
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCities()
      setCities(data)
      if (selectedCityId && !data.some((c) => c.id === selectedCityId)) {
        setSelectedCityIdState(null)
        writeStored(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las ciudades')
    } finally {
      setLoading(false)
    }
  }, [selectedCityId])

  useEffect(() => {
    void load()
  }, [load])

  const setSelectedCityId = useCallback((id: string | null) => {
    setSelectedCityIdState(id)
    writeStored(id)
  }, [])

  const selectedCity = useMemo(
    () => cities.find((c) => c.id === selectedCityId) ?? null,
    [cities, selectedCityId],
  )

  const value = useMemo<CityState>(
    () => ({
      cities,
      loading,
      error,
      selectedCityId,
      selectedCity,
      setSelectedCityId,
      reload: load,
    }),
    [cities, loading, error, selectedCityId, selectedCity, setSelectedCityId, load],
  )

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity(): CityState {
  const ctx = useContext(CityContext)
  if (!ctx) {
    throw new Error('useCity debe usarse dentro de CityProvider')
  }
  return ctx
}
