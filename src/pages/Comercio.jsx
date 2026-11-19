import Identidad from '../components/Identidad.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { esHoy, fmtKg, ETIQUETA_ESTADO } from '../lib/donaciones.js'

export default function Comercio() {
  const { state, yo } = useStore()
  const c = yo.comercio
  const deHoy = state.donaciones.filter((d) => d.comercioId === c.id && esHoy(d.creadaEn))
  return (
    <div className="pila">
      <Identidad rol="Comercio" nombre={c.nombre} detalle={c.direccion} />
      <section className="tarjeta">
        <h2>Publicar donación</h2>
        <p className="nota">Hacer foto → la IA propone → tú confirmas → publicar. (Hito 2)</p>
      </section>
      <section className="tarjeta">
        <h2>Mis donaciones de hoy</h2>
        {deHoy.length === 0 ? (
          <p className="nota">Aún no has publicado nada hoy.</p>
        ) : (
          <ul className="lista">
            {deHoy.map((d) => (
              <li key={d.id}>
                {d.items.map((i) => i.alimento).join(', ')} · {fmtKg(d.pesoConfirmado_kg)} · <em>{ETIQUETA_ESTADO[d.estado]}</em>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
