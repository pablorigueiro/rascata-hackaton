import { useStore } from '../store/StoreContext.jsx'

// Página pública del sello (hito 6): leerá primero ?d= de la URL y, si no, el store local.
export default function SelloPublico({ id }) {
  const { state } = useStore()
  const c = state.comercios.find((x) => x.id === id)
  return (
    <div className="pila">
      <section className="tarjeta">
        <p className="identidad__rol">Comercio Rescata</p>
        <h1>{c ? c.nombre : 'Comercio no encontrado'}</h1>
        <p className="nota">Página pública del sello (hito 6).</p>
      </section>
    </div>
  )
}
