import { useEffect, useState } from 'react'

// Router mínimo por hash: funciona en cualquier hosting estático sin configuración.
// «#/sello/c1?d=xxx» → { path: '/sello/c1', partes: ['sello', 'c1'], query: URLSearchParams }

function leer() {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = hash.split('?')
  const limpio = '/' + path.split('/').filter(Boolean).join('/')
  return { path: limpio, partes: limpio.split('/').filter(Boolean), query: new URLSearchParams(qs) }
}

export function useRuta() {
  const [ruta, setRuta] = useState(leer)
  useEffect(() => {
    const onHash = () => {
      setRuta(leer())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return ruta
}

export function navegar(path) {
  window.location.hash = path
}
