// Ruta del voluntario/a: agrupa las donaciones pequeñas del barrio en un solo recorrido
// inicio → comercios (vecino más cercano) → entidad. Ver docs/PLAN.md §6.3.
import { redondeaAbajo } from './donaciones.js'

const RADIO_TIERRA_KM = 6371

/** Velocidades medias en km/h. Coche: media urbana estimada para la demo (ver README → Decisiones). */
export const VELOCIDADES_KMH = { a_pie: 5, bici: 15, coche: 20 }

const rad = (g) => (g * Math.PI) / 180

/** Distancia en km entre dos puntos { lat, lng } (fórmula del semiverseno). */
export function haversine(a, b) {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Ordena las paradas por vecino más cercano partiendo de `inicio`.
 * `destino` (la entidad) no altera el orden: siempre va al final.
 * Devuelve [inicio, ...paradasOrdenadas, destino] sin mutar la entrada.
 */
export function ordenarParadas(inicio, paradas, destino) {
  const pendientes = [...paradas]
  const orden = []
  let actual = inicio
  while (pendientes.length) {
    let mejor = 0
    let mejorD = Infinity
    pendientes.forEach((p, i) => {
      const d = haversine(actual, p)
      if (d < mejorD) {
        mejorD = d
        mejor = i
      }
    })
    actual = pendientes.splice(mejor, 1)[0]
    orden.push(actual)
  }
  return [inicio, ...orden, ...(destino ? [destino] : [])]
}

/** Distancia total en km de una lista de puntos recorrida en orden. */
export function distanciaTotal(puntos) {
  let km = 0
  for (let i = 1; i < puntos.length; i++) km += haversine(puntos[i - 1], puntos[i])
  return km
}

/** Minutos de trayecto (redondeados hacia arriba: no prometemos rutas más cortas de lo que son). */
export function minutos(km, transporte) {
  const v = VELOCIDADES_KMH[transporte] || VELOCIDADES_KMH.a_pie
  return Math.ceil((km / v) * 60)
}

/**
 * Resumen de una ruta ya ordenada ([inicio, ...paradas, destino]).
 * Cada parada puede llevar `kg`. kg y distancia van a la baja.
 */
export function resumenRuta(ruta, { conDestino = true } = {}) {
  const paradas = ruta.slice(1, conDestino ? -1 : undefined)
  const kmBruto = distanciaTotal(ruta)
  return {
    paradas: paradas.length,
    kg: redondeaAbajo(paradas.reduce((s, p) => s + (p.kg || 0), 0)),
    distanciaKm: redondeaAbajo(kmBruto),
    minutos: {
      a_pie: minutos(kmBruto, 'a_pie'),
      bici: minutos(kmBruto, 'bici'),
      coche: minutos(kmBruto, 'coche'),
    },
  }
}

/** Atajo: ordena y resume en un paso. */
export function planificarRuta(inicio, paradas, destino) {
  const ruta = ordenarParadas(inicio, paradas, destino)
  return { ruta, ...resumenRuta(ruta, { conDestino: Boolean(destino) }) }
}
