import Identidad from '../components/Identidad.jsx'
import { useStore } from '../store/StoreContext.jsx'

const TRANSPORTE = { a_pie: 'a pie', bici: 'en bici', coche: 'en coche' }

export default function Voluntario() {
  const { state, yo } = useStore()
  const v = yo.voluntario
  const reservadas = state.donaciones.filter((d) => ['reservada', 'en_ruta'].includes(d.estado))
  return (
    <div className="pila">
      <Identidad rol="Voluntario/a" nombre={v.nombre} detalle={`Va ${TRANSPORTE[v.transporte]}`} />
      <section className="tarjeta">
        <h2>Ruta del barrio</h2>
        <p className="nota">{reservadas.length} recogidas reservadas. Mapa y ruta agrupada en el hito 4.</p>
      </section>
    </div>
  )
}
