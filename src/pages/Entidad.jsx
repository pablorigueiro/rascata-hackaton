import Identidad from '../components/Identidad.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { fmtKg, ETIQUETA_CATEGORIA, ETIQUETA_ESTADO } from '../lib/donaciones.js'

export default function Entidad() {
  const { state, yo } = useStore()
  const e = yo.entidad
  const p = e.perfil
  const abiertas = state.donaciones.filter((d) => ['publicada', 'reservada', 'en_ruta', 'entregada_comercio'].includes(d.estado))
  const nombre = (id) => state.comercios.find((c) => c.id === id)?.nombre
  return (
    <div className="pila">
      <Identidad
        rol="Entidad social"
        nombre={e.nombre}
        detalle={`Acepta ${p.acepta.map((c) => ETIQUETA_CATEGORIA[c]).join(', ')} · ${p.tieneFrio ? 'con' : 'sin'} frío · hasta ${p.capacidadMaxKg} kg`}
      />
      <section className="tarjeta">
        <h2>Donaciones en curso en el barrio</h2>
        <p className="nota">Avisos tipo WhatsApp y filtrado por perfil en el hito 3.</p>
        <ul className="lista">
          {abiertas.map((d) => (
            <li key={d.id}>
              {nombre(d.comercioId)} · {fmtKg(d.pesoConfirmado_kg)} · <em>{ETIQUETA_ESTADO[d.estado]}</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
