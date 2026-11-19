import { useStore } from '../store/StoreContext.jsx'
import { confirmadas, kgConfirmados, fmtKg } from '../lib/donaciones.js'

export default function Impacto() {
  const { state } = useStore()
  return (
    <div className="pila">
      <h1>Impacto del barrio</h1>
      <section className="tarjeta">
        <p className="cifra">{fmtKg(kgConfirmados(state.donaciones))}</p>
        <p className="nota">rescatados en {confirmadas(state.donaciones).length} donaciones confirmadas. Detalle en el hito 5.</p>
      </section>
      <p className="leyenda">Solo contamos donaciones confirmadas por el comercio y por la entidad. Todas las cifras están redondeadas a la baja.</p>
    </div>
  )
}
