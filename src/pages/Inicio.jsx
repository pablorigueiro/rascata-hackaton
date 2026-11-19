import Contador from '../components/Contador.jsx'
import { useStore } from '../store/StoreContext.jsx'

const ROLES = [
  { clave: 'comercioId', lista: 'comercios', ruta: '/comercio', icono: '🥖', titulo: 'Soy un comercio', texto: 'Dona lo que no vendiste en un toque.', yo: 'comercio' },
  { clave: 'entidadId', lista: 'entidades', ruta: '/entidad', icono: '🤝', titulo: 'Soy una entidad', texto: 'Recibe solo lo que te sirve.', yo: 'entidad' },
  { clave: 'voluntarioId', lista: 'voluntarios', ruta: '/voluntario', icono: '🚲', titulo: 'Soy voluntario/a', texto: 'Una ruta por el barrio, no diez viajes.', yo: 'voluntario' },
]

export default function Inicio() {
  const { state, yo, setYo } = useStore()
  return (
    <div className="pila">
      <Contador />
      <p className="lema">
        La panadería de tu calle tira el pan cada noche porque donar 3 kg no le compensa. <strong>Rescata junta las donaciones de todo el barrio en una ruta.</strong>
      </p>
      <div className="roles">
        {ROLES.map((r) => (
          <article key={r.clave} className="rol">
            <a href={`#${r.ruta}`} className="rol__enlace">
              <span className="rol__icono" aria-hidden="true">{r.icono}</span>
              <span>
                <span className="rol__titulo">{r.titulo}</span>
                <span className="rol__texto">{r.texto}</span>
              </span>
              <span className="rol__flecha" aria-hidden="true">›</span>
            </a>
            <label className="rol__selector">
              <span>Entrar como</span>
              <select value={yo[r.yo].id} onChange={(e) => setYo({ [r.clave]: e.target.value })}>
                {state[r.lista].map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>
      <a href="#/impacto" className="boton boton--secundario boton--ancho">
        🌱 Ver el impacto del barrio
      </a>
    </div>
  )
}
