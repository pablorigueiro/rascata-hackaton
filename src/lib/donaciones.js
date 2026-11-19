// Helpers compartidos sobre donaciones. La regla de oro vive aquí y solo aquí.

/** Una donación cuenta (contador, CO₂, sello, ranking) solo con doble confirmación. */
export function esConfirmada(d) {
  return Boolean(d && d.confirmacionComercio && d.confirmacionEntidad)
}

/** Conservadurismo: todas las cifras se redondean a la baja (1 decimal). */
export function redondeaAbajo(x) {
  return Math.floor((Number(x) || 0) * 10 + 1e-9) / 10
}

export function confirmadas(donaciones) {
  return donaciones.filter(esConfirmada)
}

/** Kg confirmados de una lista, a la baja. */
export function kgConfirmados(donaciones) {
  return redondeaAbajo(confirmadas(donaciones).reduce((s, d) => s + (d.pesoConfirmado_kg || 0), 0))
}

export function esHoy(ts, ahora = Date.now()) {
  if (!ts) return false
  const a = new Date(ts)
  const b = new Date(ahora)
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Momento en que una donación pasó a contar (la última de las dos confirmaciones). */
export function momentoConfirmacion(d) {
  return esConfirmada(d) ? Math.max(d.confirmacionComercio, d.confirmacionEntidad) : null
}

const fmt1 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmt0 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 })

/** «2,5 kg» siempre redondeado a la baja. */
export function fmtKg(x) {
  return `${fmt1.format(redondeaAbajo(x))} kg`
}

export function fmtNum(x) {
  return fmt0.format(Math.floor(Number(x) || 0))
}

export const ETIQUETA_ESTADO = {
  publicada: 'Publicada',
  reservada: 'Reservada',
  en_ruta: 'En ruta',
  entregada_comercio: 'Entregada (pendiente de confirmar)',
  confirmada: 'Confirmada',
  en_nevera: 'En la nevera solidaria',
  caducada: 'Caducada',
}

export const ETIQUETA_CATEGORIA = {
  pan: 'pan',
  bolleria: 'bollería',
  fruta: 'fruta',
  verdura: 'verdura',
  envasado: 'envasados',
  otro: 'otro',
}

export const ETIQUETA_TURNO = {
  noche: 'esta noche al cierre',
  manana: 'mañana por la mañana',
}
