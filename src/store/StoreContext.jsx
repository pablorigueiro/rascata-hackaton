import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { crearSeed, SEED_VERSION } from '../data/seed.js'

// Estado compartido de la demo: React Context + useReducer, persistido en localStorage y
// sincronizado entre pestañas del mismo navegador (BroadcastChannel + evento storage).
// La identidad (qué comercio/entidad/voluntario soy) es por pestaña (sessionStorage), para
// poder tener «comercio» en una pestaña y «entidad» en otra.

const CLAVE = `rescata:estado:v${SEED_VERSION}`
const CLAVE_YO = 'rescata:yo'
const CANAL = 'rescata'

const StoreCtx = createContext(null)

function cargar() {
  try {
    const raw = localStorage.getItem(CLAVE)
    if (raw) {
      const s = JSON.parse(raw)
      if (s && s.version === SEED_VERSION && Array.isArray(s.donaciones)) return s
    }
  } catch {
    /* estado corrupto o almacenamiento bloqueado: se usa la semilla */
  }
  return crearSeed()
}

function actualizarDonacion(state, id, cambios) {
  return {
    ...state,
    donaciones: state.donaciones.map((d) => (d.id === id ? { ...d, ...(typeof cambios === 'function' ? cambios(d) : cambios) } : d)),
  }
}

/** Si ya están las dos confirmaciones, la donación pasa a «confirmada». */
function cerrarSiDoble(d) {
  return d.confirmacionComercio && d.confirmacionEntidad ? { ...d, estado: 'confirmada' } : d
}

function reducer(state, action) {
  const ahora = action.ahora ?? Date.now()
  switch (action.type) {
    case 'REEMPLAZAR': // llega de otra pestaña
      return action.estado
    case 'REINICIAR':
      return crearSeed(ahora)
    case 'PUBLICAR':
      return { ...state, donaciones: [...state.donaciones, action.donacion] }
    case 'RESERVAR':
      return actualizarDonacion(state, action.id, (d) =>
        d.estado === 'publicada' ? { estado: 'reservada', entidadId: action.entidadId } : {},
      )
    case 'RECHAZAR': {
      const prev = state.rechazos[action.entidadId] || []
      return { ...state, rechazos: { ...state.rechazos, [action.entidadId]: [...prev, action.id] } }
    }
    case 'RECOGER':
      return actualizarDonacion(state, action.id, { estado: 'en_ruta', voluntarioId: action.voluntarioId })
    case 'ENTREGAR':
      return {
        ...state,
        donaciones: state.donaciones.map((d) =>
          action.ids.includes(d.id) ? cerrarSiDoble({ ...d, estado: 'entregada_comercio', voluntarioId: d.voluntarioId || action.voluntarioId }) : d,
        ),
      }
    case 'A_NEVERA':
      return actualizarDonacion(state, action.id, { estado: 'en_nevera', neveraId: action.neveraId, voluntarioId: action.voluntarioId })
    case 'CONFIRMAR_COMERCIO':
      return actualizarDonacion(state, action.id, (d) => cerrarSiDoble({ ...d, confirmacionComercio: d.confirmacionComercio || ahora }))
    case 'CONFIRMAR_ENTIDAD':
      return actualizarDonacion(state, action.id, (d) =>
        cerrarSiDoble({ ...d, entidadId: d.entidadId || action.entidadId, confirmacionEntidad: d.confirmacionEntidad || ahora }),
      )
    case 'CAMBIAR_TURNO':
      return actualizarDonacion(state, action.id, { turno: action.turno })
    case 'CADUCAR':
      return actualizarDonacion(state, action.id, { estado: 'caducada' })
    case 'ACTUALIZAR_PERFIL':
      return {
        ...state,
        entidades: state.entidades.map((e) => (e.id === action.entidadId ? { ...e, perfil: { ...e.perfil, ...action.perfil } } : e)),
      }
    default:
      return state
  }
}

function cargarYo() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_YO)) || {}
  } catch {
    return {}
  }
}

export function StoreProvider({ children }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, cargar)
  const origenRemoto = useRef(false)
  const canal = useRef(null)
  // Contador de cambios locales/remotos: lo usan las animaciones (p. ej. el salto del contador)
  const [ultimoCambio, setUltimoCambio] = useState(null)

  const dispatch = useCallback((action) => {
    origenRemoto.current = false
    rawDispatch(action)
  }, [])

  // Escuchar otras pestañas
  useEffect(() => {
    const aplicarRemoto = (estado) => {
      if (!estado || estado.version !== SEED_VERSION) return
      origenRemoto.current = true
      rawDispatch({ type: 'REEMPLAZAR', estado })
    }
    if ('BroadcastChannel' in window) {
      canal.current = new BroadcastChannel(CANAL)
      canal.current.onmessage = (e) => aplicarRemoto(e.data)
    }
    // Respaldo: el evento storage se dispara en las otras pestañas al escribir localStorage
    const onStorage = (e) => {
      if (e.key !== CLAVE || !e.newValue || canal.current) return
      try {
        aplicarRemoto(JSON.parse(e.newValue))
      } catch {
        /* ignorar */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      canal.current?.close()
      canal.current = null
    }
  }, [])

  // Persistir y difundir cada cambio local (los remotos solo se aplican)
  useEffect(() => {
    setUltimoCambio(Date.now())
    if (origenRemoto.current) {
      origenRemoto.current = false
      return
    }
    try {
      localStorage.setItem(CLAVE, JSON.stringify(state))
    } catch {
      /* almacenamiento lleno o bloqueado: la demo sigue en memoria */
    }
    canal.current?.postMessage(state)
  }, [state])

  // Identidad por pestaña
  const [yo, setYoState] = useState(cargarYo)
  const setYo = useCallback((cambios) => {
    setYoState((prev) => {
      const nuevo = { ...prev, ...cambios }
      try {
        sessionStorage.setItem(CLAVE_YO, JSON.stringify(nuevo))
      } catch {
        /* ignorar */
      }
      return nuevo
    })
  }, [])

  const value = useMemo(() => {
    const comercio = state.comercios.find((c) => c.id === yo.comercioId) || state.comercios[0]
    const entidad = state.entidades.find((e) => e.id === yo.entidadId) || state.entidades[0]
    const voluntario = state.voluntarios.find((v) => v.id === yo.voluntarioId) || state.voluntarios[0]
    return { state, dispatch, yo: { comercio, entidad, voluntario }, setYo, ultimoCambio }
  }, [state, dispatch, yo, setYo, ultimoCambio])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore fuera de StoreProvider')
  return ctx
}

export function nuevoId(prefijo = 'd') {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}
