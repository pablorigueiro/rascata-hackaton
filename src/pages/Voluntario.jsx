import Identidad from '../components/Identidad.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { fmtKg, redondeaAbajo, ETIQUETA_ESTADO } from '../lib/donaciones.js'

const TRANSPORTE = { a_pie: 'a pie', bici: 'en bici', coche: 'en coche' }

// Versión mínima (recorte por tiempo): lista de paradas sin mapa.
export default function Voluntario() {
  const { state, yo, dispatch } = useStore()
  const toast = useToast()
  const v = yo.voluntario
  const ruta = state.donaciones.filter((d) => ['reservada', 'en_ruta'].includes(d.estado))
  const comercios = [...new Set(ruta.map((d) => d.comercioId))]
  const total = redondeaAbajo(ruta.reduce((s, d) => s + d.pesoConfirmado_kg, 0))
  const nombre = (id) => state.comercios.find((c) => c.id === id)?.nombre
  const destino = state.entidades.find((e) => e.id === ruta[0]?.entidadId)

  return (
    <div className="pila">
      <Identidad rol="Voluntario/a" nombre={v.nombre} detalle={`Va ${TRANSPORTE[v.transporte]}`} />
      <section className="tarjeta">
        <h2>Ruta de mañana</h2>
        {ruta.length === 0 ? (
          <p className="nota">No hay recogidas reservadas.</p>
        ) : (
          <>
            <p className="destacado">
              {comercios.length} comercios, {fmtKg(total)}: una sola ruta en lugar de {comercios.length} viajes.
            </p>
            <ol className="lista">
              {ruta.map((d) => (
                <li key={d.id}>
                  {nombre(d.comercioId)} · {fmtKg(d.pesoConfirmado_kg)} · <em>{ETIQUETA_ESTADO[d.estado]}</em>
                  {d.estado === 'reservada' && (
                    <button className="boton boton--pequeno" onClick={() => dispatch({ type: 'RECOGER', id: d.id, voluntarioId: v.id })}>
                      Recogido
                    </button>
                  )}
                </li>
              ))}
              {destino && <li>🏁 {destino.nombre}</li>}
            </ol>
            <button
              className="boton boton--ancho"
              disabled={!ruta.some((d) => d.estado === 'en_ruta')}
              onClick={() => {
                dispatch({ type: 'ENTREGAR', ids: ruta.filter((d) => d.estado === 'en_ruta').map((d) => d.id), voluntarioId: v.id })
                toast('Entregado. Ahora confirman el comercio y la entidad.')
              }}
            >
              Entregar todo
            </button>
          </>
        )}
      </section>
    </div>
  )
}
