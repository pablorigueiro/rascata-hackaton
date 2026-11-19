import { useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { esHoy, fmtKg, momentoConfirmacion, confirmadas, redondeaAbajo } from '../lib/donaciones.js'

// Contador nacional (versión básica del hito 1; la animación y el «salto» llegan en el hito 5).
// Santiago = dato real de la app (confirmadas hoy). Otras ciudades: simuladas para la demo.
export const CIUDADES_SIMULADAS = [
  { nombre: 'Madrid', base: 412.6 },
  { nombre: 'Valencia', base: 188.3 },
  { nombre: 'Sevilla', base: 141.9 },
  { nombre: 'Bilbao', base: 96.4 },
]

export function kgHoySantiago(donaciones, ahora = Date.now()) {
  return redondeaAbajo(
    confirmadas(donaciones)
      .filter((d) => esHoy(momentoConfirmacion(d), ahora))
      .reduce((s, d) => s + d.pesoConfirmado_kg, 0),
  )
}

export default function Contador({ compacto = false }) {
  const { state } = useStore()
  const santiago = useMemo(() => kgHoySantiago(state.donaciones), [state.donaciones])
  const total = redondeaAbajo(santiago + CIUDADES_SIMULADAS.reduce((s, c) => s + c.base, 0))

  return (
    <section className={`contador ${compacto ? 'contador--compacto' : ''}`} aria-label="Contador nacional">
      <p className="contador__titulo">Rescatado hoy en España</p>
      <p className="contador__numero">{fmtKg(total)}</p>
      {!compacto && (
        <>
          <ul className="contador__ciudades">
            <li className="contador__ciudad contador__ciudad--real">
              <span>Santiago</span> <strong>{fmtKg(santiago)}</strong>
            </li>
            {CIUDADES_SIMULADAS.map((c) => (
              <li key={c.nombre} className="contador__ciudad">
                <span>{c.nombre}</span> <strong>{fmtKg(c.base)}</strong>
              </li>
            ))}
          </ul>
          <p className="nota">Datos de otras ciudades simulados para la demo.</p>
        </>
      )}
    </section>
  )
}
