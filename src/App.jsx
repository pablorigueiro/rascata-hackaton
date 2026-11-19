import { useState } from 'react'
import { useRuta } from './lib/router.js'
import { useStore } from './store/StoreContext.jsx'
import { ToastProvider, useToast } from './components/Toast.jsx'
import Inicio from './pages/Inicio.jsx'
import Comercio from './pages/Comercio.jsx'
import Entidad from './pages/Entidad.jsx'
import Voluntario from './pages/Voluntario.jsx'
import Impacto from './pages/Impacto.jsx'
import SelloPublico from './pages/SelloPublico.jsx'
import Presentacion from './pages/Presentacion.jsx'

const NAV = [
  { path: '/', icono: '🏠', texto: 'Inicio' },
  { path: '/comercio', icono: '🥖', texto: 'Comercio' },
  { path: '/entidad', icono: '🤝', texto: 'Entidad' },
  { path: '/voluntario', icono: '🚲', texto: 'Ruta' },
  { path: '/impacto', icono: '🌱', texto: 'Impacto' },
]

function Menu() {
  const [abierto, setAbierto] = useState(false)
  const { dispatch } = useStore()
  const toast = useToast()
  return (
    <div className="menu">
      <button className="menu__boton" aria-label="Más opciones" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        ⋯
      </button>
      {abierto && (
        <div className="menu__panel" role="menu">
          <button
            role="menuitem"
            onClick={() => {
              if (window.confirm('¿Reiniciar la demo? Se restauran los datos de ejemplo en todas las pestañas.')) {
                dispatch({ type: 'REINICIAR' })
                toast('Demo reiniciada')
              }
              setAbierto(false)
            }}
          >
            ↺ Reiniciar demo
          </button>
        </div>
      )}
    </div>
  )
}

function Pagina({ ruta }) {
  const [seccion, id] = ruta.partes
  switch (seccion) {
    case undefined:
      return <Inicio />
    case 'comercio':
      return <Comercio />
    case 'entidad':
      return <Entidad />
    case 'voluntario':
      return <Voluntario />
    case 'impacto':
      return <Impacto />
    case 'presentacion':
      return <Presentacion />
    case 'sello':
      return <SelloPublico id={id} datos={ruta.query.get('d')} />
    default:
      return (
        <div className="vacio">
          <p>Esta página no existe.</p>
          <a className="boton" href="#/">Volver al inicio</a>
        </div>
      )
  }
}

export default function App() {
  const ruta = useRuta()
  const proyectar = ruta.partes[0] === 'presentacion'
  const publica = ruta.partes[0] === 'sello' || proyectar
  const activa = '/' + (ruta.partes[0] || '')

  return (
    <ToastProvider>
      <div className={`app ${publica ? 'app--publica' : ''} ${proyectar ? 'app--proyectar' : ''}`}>
        <header className="cabecera">
          <a href="#/" className="marca">
            <span aria-hidden="true">🥖</span> Rescata
          </a>
          {!publica && <Menu />}
        </header>
        <main className="contenido">
          <Pagina ruta={ruta} />
        </main>
        {!publica && (
          <nav className="nav" aria-label="Secciones">
            {NAV.map((n) => (
              <a key={n.path} href={`#${n.path}`} className={`nav__item ${activa === n.path ? 'nav__item--activo' : ''}`}>
                <span aria-hidden="true">{n.icono}</span>
                {n.texto}
              </a>
            ))}
          </nav>
        )}
      </div>
    </ToastProvider>
  )
}
