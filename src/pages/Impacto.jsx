import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { fmtKg, fmtNum } from '../lib/donaciones.js'
import { calcularImpacto, kgPorMes, kgComercio, nivelDe } from '../lib/impacto.js'
import { FACTOR_POR_DEFECTO, KG_POR_RACION } from '../data/factores.js'

export function Tarjetas({ imp }) {
  return (
    <div className="kpis">
      <div className="kpi">
        <span className="kpi__valor">{fmtKg(imp.kg)}</span>
        <span className="kpi__texto">rescatados</span>
      </div>
      <div className="kpi">
        <span className="kpi__valor">{fmtNum(imp.raciones)}</span>
        <span className="kpi__texto">raciones aprox.</span>
      </div>
      <div className="kpi">
        <span className="kpi__valor">{fmtNum(imp.co2e_kg)} kg</span>
        <span className="kpi__texto">CO₂e evitado</span>
      </div>
      <div className="kpi">
        <span className="kpi__valor">{fmtNum(imp.agua_l / 1000)} m³</span>
        <span className="kpi__texto">de agua</span>
      </div>
    </div>
  )
}

export function GraficoMeses({ donaciones }) {
  const meses = kgPorMes(donaciones)
  const max = Math.max(1, ...meses.map((m) => m.kg))
  return (
    <div className="barras" role="img" aria-label="Kilos rescatados por mes">
      {meses.map((m) => (
        <div key={m.clave} className="barras__col">
          <span className="barras__valor">{fmtNum(m.kg)}</span>
          <div className="barras__barra" style={{ height: `${(m.kg / max) * 100}%` }} />
          <span className="barras__mes">{m.etiqueta}</span>
        </div>
      ))}
    </div>
  )
}

export function Ranking({ state, max = 10 }) {
  const filas = state.comercios
    .map((c) => ({ c, kg: kgComercio(state.donaciones, c.id) }))
    .sort((a, b) => b.kg - a.kg)
    .slice(0, max)
  return (
    <ol className="ranking">
      {filas.map(({ c, kg }) => {
        const n = nivelDe(kg).actual
        return (
          <li key={c.id}>
            <span>{c.nombre}</span>
            <span>
              {n && <span className={`medalla medalla--${n.id}`}>{n.nombre}</span>} <strong>{fmtKg(kg)}</strong>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function Impacto() {
  const { state } = useStore()
  const [modal, setModal] = useState(false)
  const imp = calcularImpacto(state.donaciones)
  return (
    <div className="pila">
      <h1>Impacto del barrio</h1>
      <Tarjetas imp={imp} />
      <section className="tarjeta">
        <h2>Kilos rescatados por mes</h2>
        <GraficoMeses donaciones={state.donaciones} />
      </section>
      <section className="tarjeta">
        <h2>Comercios del barrio</h2>
        <Ranking state={state} />
      </section>
      <button className="boton boton--secundario boton--ancho" onClick={() => setModal(true)}>
        ¿Cómo lo calculamos?
      </button>
      <a className="boton boton--ancho" href="#/presentacion">
        📽️ Modo presentación
      </a>
      <p className="leyenda">Solo contamos donaciones confirmadas por el comercio y por la entidad. Todas las cifras están redondeadas a la baja.</p>
      {modal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="metodo" onClick={() => setModal(false)}>
          <div className="modal__caja" onClick={(e) => e.stopPropagation()}>
            <h2 id="metodo">¿Cómo lo calculamos?</h2>
            <ul>
              <li>
                <strong>Qué contamos:</strong> solo donaciones con doble confirmación (el comercio confirma la entrega y la entidad marca «Recibido»).
              </li>
              <li>
                <strong>Redondeo:</strong> todas las cifras se redondean a la baja.
              </li>
              <li>
                <strong>Factores:</strong> {FACTOR_POR_DEFECTO.co2e_kg_por_kg.toLocaleString('es-ES')} kg CO₂e y {FACTOR_POR_DEFECTO.agua_l_por_kg} L de agua por kg de
                comida salvada. Fuente: {FACTOR_POR_DEFECTO.fuente}.{' '}
                <a href={FACTOR_POR_DEFECTO.url} target="_blank" rel="noreferrer">
                  Ver fuente
                </a>
              </li>
              <li>
                <strong>Raciones:</strong> orientativo, 1 ración ≈ {KG_POR_RACION.toLocaleString('es-ES')} kg.
              </li>
            </ul>
            <p>
              <em>Si una cifra no se puede defender, no la mostramos.</em>
            </p>
            <button className="boton boton--ancho" onClick={() => setModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
