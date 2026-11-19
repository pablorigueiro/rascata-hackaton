import { FACTOR_POR_DEFECTO, KG_POR_RACION, factorDe } from '../data/factores.js'
import { confirmadas, redondeaAbajo, momentoConfirmacion } from './donaciones.js'

/** Impacto de una lista de donaciones: solo cuentan las confirmadas y todo va a la baja. */
export function calcularImpacto(donaciones) {
  let kg = 0
  let co2 = 0
  let agua = 0
  for (const d of confirmadas(donaciones)) {
    for (const i of d.items) {
      const f = factorDe(i.categoria)
      const peso = i.peso_kg ?? d.pesoConfirmado_kg / d.items.length
      kg += peso
      co2 += peso * f.co2e_kg_por_kg
      agua += peso * f.agua_l_por_kg
    }
  }
  return {
    kg: redondeaAbajo(kg),
    raciones: Math.floor(redondeaAbajo(kg) / KG_POR_RACION),
    co2e_kg: redondeaAbajo(co2),
    agua_l: Math.floor(agua),
  }
}

/** Impacto de una sola donación (para el toast de confirmación). */
export function impactoDonacion(d) {
  const kg = redondeaAbajo(d.pesoConfirmado_kg)
  return { kg, co2e_kg: redondeaAbajo(kg * FACTOR_POR_DEFECTO.co2e_kg_por_kg) }
}

export const NIVELES = [
  { id: 'bronce', nombre: 'Bronce', min: 50 },
  { id: 'plata', nombre: 'Plata', min: 250 },
  { id: 'oro', nombre: 'Oro', min: 1000 },
]

export function kgComercio(donaciones, comercioId) {
  return calcularImpacto(donaciones.filter((d) => d.comercioId === comercioId)).kg
}

/** Nivel actual, siguiente y progreso (0–1) hacia el siguiente. */
export function nivelDe(kg) {
  let actual = null
  for (const n of NIVELES) if (kg >= n.min) actual = n
  const siguiente = NIVELES.find((n) => kg < n.min) || null
  const base = actual ? actual.min : 0
  const progreso = siguiente ? (kg - base) / (siguiente.min - base) : 1
  return { actual, siguiente, progreso: Math.max(0, Math.min(1, progreso)) }
}

/** Kg confirmados por mes (últimos n meses), para el gráfico. */
export function kgPorMes(donaciones, n = 8, ahora = Date.now()) {
  const hoy = new Date(ahora)
  const meses = []
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    meses.push({ clave: `${m.getFullYear()}-${m.getMonth()}`, etiqueta: m.toLocaleDateString('es-ES', { month: 'short' }), kg: 0 })
  }
  for (const d of confirmadas(donaciones)) {
    const t = new Date(momentoConfirmacion(d))
    const mes = meses.find((m) => m.clave === `${t.getFullYear()}-${t.getMonth()}`)
    if (mes) mes.kg += d.pesoConfirmado_kg
  }
  return meses.map((m) => ({ ...m, kg: redondeaAbajo(m.kg) }))
}

/** Datos del sello codificados para la página pública (el móvil del jurado no tiene localStorage). */
export function codificarSello(datos) {
  const json = JSON.stringify(datos)
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodificarSello(s) {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}
