import { useStore } from '../store/StoreContext.jsx'
import { decodificarSello, kgComercio, nivelDe } from '../lib/impacto.js'
import { fmtKg } from '../lib/donaciones.js'

// Página pública del sello: primero lee ?d= (el móvil del jurado no tiene el localStorage).
export default function SelloPublico({ id, datos }) {
  const { state } = useStore()
  const local = state.comercios.find((x) => x.id === id)
  const d = (datos && decodificarSello(datos)) ||
    (local && { n: local.nombre, d: local.direccion, k: kgComercio(state.donaciones, local.id), l: nivelDe(kgComercio(state.donaciones, local.id)).actual?.nombre })
  if (!d) return <p className="vacio">Comercio no encontrado.</p>
  return (
    <div className="pila">
      <div className="sello sello--grande">
        <p className="sello__titulo">COMERCIO RESCATA</p>
        <p className="sello__nombre">{d.n}</p>
        <p className="sello__nivel">{d.l || 'Recién llegado'}</p>
      </div>
      <section className="tarjeta">
        <p>{d.d}</p>
        <p>
          Este comercio ha donado <strong>{fmtKg(d.k)}</strong> de comida que no vendió a entidades sociales del barrio.
        </p>
        <p className="leyenda">Solo contamos donaciones confirmadas por el comercio y por la entidad. Cifras redondeadas a la baja.</p>
      </section>
    </div>
  )
}
