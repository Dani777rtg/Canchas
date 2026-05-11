import { useEffect } from 'react'

const BASE_TITLE = 'CanchaYa'

/**
 * Cambia el <title> del documento a "Sección | CanchaYa".
 * Si se le pasa `null` o cadena vacía, deja solo "CanchaYa".
 * Restaura el título previo cuando el componente se desmonta.
 */
export function usePageTitle(section: string | null | undefined) {
  useEffect(() => {
    const previous = document.title
    document.title = section ? `${section} | ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = previous
    }
  }, [section])
}
