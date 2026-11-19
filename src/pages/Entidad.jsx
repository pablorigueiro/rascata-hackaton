import Identidad from '../components/Identidad.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { fmtKg, ETIQUETA_CATEGORIA, ETIQUETA_ESTADO, ETIQUETA_TURNO } from '../lib/donaciones.js'
import { impactoDonacion, kgComercio, nivelDe } from '../lib/impacto.js'

const ABIERTAS = ['reservada', 'en_ruta', 'entregada_comercio']

/** Motivo por el que una donación NO encaja con el perfil, o null si encaja. */
export function motivoIncompatible(d, entidad, cargaActualKg) {
  const p = entidad.perfil
  const cats = d.items.map((i) => i.categoria)
  const fuera = cats.filter((c) => !p.acepta.includes(c))
  if (fuera.length) return `no aceptáis ${fuera.map((c) => ETIQUETA_CATEGORIA[c]).join(', ')}`
  if (cargaActualKg + d.pesoConfirmado_kg > p.capacidadMaxKg) return 'supera vuestra capacidad'
  if (!p.horario[d.turno]) return `no recogéis ${ETIQUETA_TURNO[d.turno]}`
  return null
}

export default function Entidad() {
  const { state, yo, dispatch } = useStore()
  const toast = useToast()
  const e = yo.entidad
  const p = e.perfil
  const nombre = (id) => state.comercios.find((c) => c.id === id)?.nombre
  const mias = state.donaciones.filter((d) => d.entidadId === e.id && ABIERTAS.includes(d.estado))
  const carga = mias.reduce((s, d) => s + d.pesoConfirmado_kg, 0)
  const rechazadas = state.rechazos[e.id] || []
  const publicadas = state.donaciones.filter((d) => d.estado === 'publicada' && !rechazadas.includes(d.id))
  const avisos = publicadas.filter((d) => !motivoIncompatible(d, e, carga))
  const noEncajan = publicadas.filter((d) => motivoIncompatible(d, e, carga))

  const recibido = (d) => {
    const nivelAntes = nivelDe(kgComercio(state.donaciones, d.comercioId)).actual
    dispatch({ type: 'CONFIRMAR_ENTIDAD', id: d.id, entidadId: e.id })
    if (d.confirmacionComercio) {
      const imp = impactoDonacion(d)
      const nivelDespues = nivelDe(kgComercio(state.donaciones, d.comercioId) + imp.kg).actual
      toast(`¡Rescate confirmado! ${fmtKg(imp.kg)} · ${imp.co2e_kg.toLocaleString('es-ES')} kg CO₂e evitados`)
      if (nivelDespues && nivelDespues.id !== nivelAntes?.id) {
        setTimeout(() => toast(`🏅 ¡${nombre(d.comercioId)} sube a nivel ${nivelDespues.nombre}!`, 'aviso', 4500), 600)
      }
    } else {
      toast('Recibido. Falta que el comercio confirme la entrega.', 'aviso')
    }
  }

  return (
    <div className="pila">
      <Identidad
        rol="Entidad social"
        nombre={e.nombre}
        detalle={`Acepta ${p.acepta.map((c) => ETIQUETA_CATEGORIA[c]).join(', ')} · ${p.tieneFrio ? 'con' : 'sin'} frío · hasta ${p.capacidadMaxKg} kg`}
      />

      <section className="tarjeta">
        <h2>Avisos nuevos</h2>
        {avisos.length === 0 && <p className="nota">No hay donaciones nuevas que encajen con vuestro perfil.</p>}
        {avisos.map((d) => (
          <div key={d.id} className="whatsapp">
            <p>
              <strong>{nombre(d.comercioId)}</strong> dona {d.items.map((i) => `${i.cantidad} ${i.alimento}`).join(', ')} ({fmtKg(d.pesoConfirmado_kg)}) para{' '}
              {ETIQUETA_TURNO[d.turno]}. ¿Lo queréis?
            </p>
            <div className="fila">
              <button
                className="boton boton--pequeno"
                onClick={() => {
                  dispatch({ type: 'RESERVAR', id: d.id, entidadId: e.id })
                  toast('Reservada. Se suma a la ruta del voluntario.')
                }}
              >
                SÍ
              </button>
              <button className="boton boton--secundario boton--pequeno" onClick={() => dispatch({ type: 'RECHAZAR', id: d.id, entidadId: e.id })}>
                No, gracias
              </button>
            </div>
          </div>
        ))}
        {noEncajan.length > 0 && (
          <p className="nota" title={noEncajan.map((d) => `${nombre(d.comercioId)}: ${motivoIncompatible(d, e, carga)}`).join('\n')}>
            {noEncajan.length} {noEncajan.length === 1 ? 'donación no encaja' : 'donaciones no encajan'} con vuestro perfil (
            {noEncajan.map((d) => motivoIncompatible(d, e, carga)).join('; ')}). No os molestamos con ellas.
          </p>
        )}
      </section>

      <section className="tarjeta">
        <h2>Por recibir</h2>
        {mias.length === 0 && <p className="nota">Nada pendiente.</p>}
        <ul className="lista">
          {mias.map((d) => (
            <li key={d.id}>
              {nombre(d.comercioId)} · {fmtKg(d.pesoConfirmado_kg)} · <em>{ETIQUETA_ESTADO[d.estado]}</em>
              {!d.confirmacionEntidad ? (
                <button className="boton boton--pequeno" onClick={() => recibido(d)}>
                  Recibido ✓
                </button>
              ) : (
                <span className="nota"> · esperando al comercio</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
