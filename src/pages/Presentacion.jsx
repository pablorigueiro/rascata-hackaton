import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import Contador from '../components/Contador.jsx'
import { Tarjetas, GraficoMeses, Ranking } from './Impacto.jsx'
import { calcularImpacto } from '../lib/impacto.js'
import { fmtKg, ETIQUETA_ESTADO, esHoy } from '../lib/donaciones.js'

// Pantalla para proyectar durante la demo: cifras en vivo que se actualizan desde las otras
// pestañas (comercio / entidad) gracias a la sincronización del store.
export default function Presentacion() {
  const { state } = useStore()
  const imp = calcularImpacto(state.donaciones)
  const [salto, setSalto] = useState(false)
  const prev = useRef(imp.kg)
  useEffect(() => {
    if (imp.kg > prev.current) {
      setSalto(true)
      const t = setTimeout(() => setSalto(false), 1200)
      prev.current = imp.kg
      return () => clearTimeout(t)
    }
    prev.current = imp.kg
  }, [imp.kg])

  const nombre = (id) => state.comercios.find((c) => c.id === id)?.nombre
  const hoy = state.donaciones.filter((d) => esHoy(d.creadaEn)).slice(-6).reverse()

  return (
    <div className="presentacion">
      <header className="presentacion__cabecera">
        <h1>🥖 Rescata</h1>
        <p>El excedente del pequeño comercio, en una sola ruta de barrio.</p>
        <a href="#/impacto" className="presentacion__salir">Salir</a>
      </header>
      <div className="presentacion__rejilla">
        <div className={`presentacion__bloque ${salto ? 'salto' : ''}`}>
          <Contador />
        </div>
        <div className="presentacion__bloque">
          <h2>Zona Nova · Santiago</h2>
          <Tarjetas imp={imp} />
        </div>
        <div className="presentacion__bloque">
          <h2>En directo hoy</h2>
          <ul className="lista">
            {hoy.map((d) => (
              <li key={d.id}>
                {nombre(d.comercioId)} · {fmtKg(d.pesoConfirmado_kg)} · <em>{ETIQUETA_ESTADO[d.estado]}</em>
              </li>
            ))}
          </ul>
        </div>
        <div className="presentacion__bloque">
          <h2>Kilos por mes</h2>
          <GraficoMeses donaciones={state.donaciones} />
        </div>
        <div className="presentacion__bloque presentacion__bloque--ancho">
          <h2>Comercios con sello</h2>
          <Ranking state={state} max={5} />
        </div>
      </div>
      <p className="leyenda">Solo cuentan donaciones con doble confirmación · cifras redondeadas a la baja · otras ciudades simuladas para la demo.</p>
    </div>
  )
}
