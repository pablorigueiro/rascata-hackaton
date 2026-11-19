import { useState } from 'react'
import QRCode from 'qrcode'
import Identidad from '../components/Identidad.jsx'
import { useStore, nuevoId } from '../store/StoreContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { analizarFoto } from '../lib/ai.js'
import { esHoy, fmtKg, redondeaAbajo, ETIQUETA_ESTADO, ETIQUETA_TURNO } from '../lib/donaciones.js'
import { kgComercio, nivelDe, codificarSello } from '../lib/impacto.js'

const CHECKS = [
  'Es pan, bollería, fruta, verdura o un envasado en fecha.',
  'Lo he guardado limpio y protegido desde que dejó de venderse.',
  'No lleva nata, carne, pescado ni nada que necesite frío.',
]

function Publicar() {
  const { dispatch, yo } = useStore()
  const toast = useToast()
  const [fase, setFase] = useState('inicio') // inicio | analizando | revisar
  const [foto, setFoto] = useState(null)
  const [items, setItems] = useState([])
  const [checks, setChecks] = useState([false, false, false])
  const [turno, setTurno] = useState('manana')

  const analizar = async (archivo, pista) => {
    setFoto(archivo ? URL.createObjectURL(archivo) : null)
    setFase('analizando')
    const propuesta = await analizarFoto(archivo, pista)
    setItems(propuesta.map((i) => ({ ...i, propuesto_kg: i.peso_kg })))
    setChecks([false, false, false])
    setTurno(propuesta.every((i) => ['pan', 'bolleria'].includes(i.categoria)) ? 'manana' : 'manana')
    setFase('revisar')
  }

  const hayOtro = items.some((i) => i.categoria === 'otro')
  const total = redondeaAbajo(items.reduce((s, i) => s + (Number(i.peso_kg) || 0), 0))
  const listo = items.length > 0 && !hayOtro && checks.every(Boolean) && total > 0

  const publicar = () => {
    if (!listo) return
    dispatch({
      type: 'PUBLICAR',
      donacion: {
        id: nuevoId(),
        comercioId: yo.comercio.id,
        items: items.map(({ alimento, categoria, cantidad, peso_kg }) => ({ alimento, categoria, cantidad, peso_kg: Number(peso_kg) })),
        pesoPropuestoIA_kg: items.reduce((s, i) => s + i.propuesto_kg, 0),
        pesoConfirmado_kg: total,
        checklistOk: true,
        turno,
        estado: 'publicada',
        entidadId: null,
        voluntarioId: null,
        neveraId: null,
        creadaEn: Date.now(),
        confirmacionComercio: null,
        confirmacionEntidad: null,
      },
    })
    toast(`Donación publicada: ${fmtKg(total)} para ${ETIQUETA_TURNO[turno]}`)
    setFase('inicio')
    setItems([])
  }

  if (fase === 'inicio')
    return (
      <section className="tarjeta">
        <h2>Publicar donación</h2>
        <p className="nota">Haz una foto de lo que no has vendido. La IA propone, tú confirmas.</p>
        <label className="boton boton--ancho">
          📷 Hacer o subir foto
          <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files[0] && analizar(e.target.files[0], 'pan')} />
        </label>
        <div className="fila">
          {['pan', 'bolleria', 'fruta', 'verdura'].map((p) => (
            <button key={p} className="boton boton--secundario boton--pequeno" onClick={() => analizar(null, p)}>
              Ejemplo: {p === 'bolleria' ? 'bollería' : p}
            </button>
          ))}
        </div>
      </section>
    )

  if (fase === 'analizando')
    return (
      <section className="tarjeta centro">
        {foto && <img src={foto} alt="Foto de la donación" className="foto" />}
        <p className="cargando">Analizando la foto…</p>
      </section>
    )

  return (
    <section className="tarjeta">
      <h2>Revisa la donación</h2>
      {foto && <img src={foto} alt="Foto de la donación" className="foto" />}
      <ul className="items">
        {items.map((i, n) => (
          <li key={n} className={`item ${i.categoria === 'otro' ? 'item--otro' : ''}`}>
            <div>
              <strong>
                {i.cantidad} {i.alimento}
              </strong>{' '}
              <span className={`badge badge--${i.confianza}`}>confianza {i.confianza}</span>
            </div>
            <label className="item__peso">
              La IA propone {fmtKg(i.propuesto_kg)} · Tú confirmas:
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={i.peso_kg}
                onChange={(e) => setItems((it) => it.map((x, k) => (k === n ? { ...x, peso_kg: e.target.value } : x)))}
              />
              kg
            </label>
          </li>
        ))}
      </ul>
      <fieldset className="checks">
        <legend>Antes de publicar</legend>
        {CHECKS.map((t, n) => (
          <label key={n}>
            <input type="checkbox" checked={checks[n]} onChange={(e) => setChecks((c) => c.map((x, k) => (k === n ? e.target.checked : x)))} /> {t}
          </label>
        ))}
      </fieldset>
      <div className="fila">
        {['noche', 'manana'].map((t) => (
          <button key={t} className={`boton boton--pequeno ${turno === t ? '' : 'boton--secundario'}`} onClick={() => setTurno(t)}>
            {t === 'noche' ? '🌙 Esta noche' : '☀️ Mañana'}
          </button>
        ))}
      </div>
      <button className="boton boton--ancho" disabled={!listo} onClick={publicar}>
        Publicar donación · {fmtKg(total)}
      </button>
      <button className="boton boton--secundario boton--ancho" onClick={() => setFase('inicio')}>
        Cancelar
      </button>
    </section>
  )
}

function Sello({ comercio, kg }) {
  const [qr, setQr] = useState(null)
  const { actual, siguiente, progreso } = nivelDe(kg)
  const abrir = async () => {
    const datos = codificarSello({ n: comercio.nombre, k: kg, l: actual?.nombre || null, d: comercio.direccion })
    const url = `${window.location.origin}${window.location.pathname}#/sello/${comercio.id}?d=${datos}`
    setQr({ url, img: await QRCode.toDataURL(url, { margin: 1, width: 220 }) })
  }
  return (
    <section className="tarjeta">
      <h2>Mi sello</h2>
      <p>
        Nivel <strong>{actual ? actual.nombre : 'sin nivel'}</strong> · {fmtKg(kg)} confirmados
      </p>
      {siguiente && (
        <>
          <div className="barra" aria-label="Progreso al siguiente nivel">
            <div className="barra__relleno" style={{ width: `${progreso * 100}%` }} />
          </div>
          <p className="nota">
            Te faltan {fmtKg(siguiente.min - kg)} para {siguiente.nombre}.
          </p>
        </>
      )}
      {qr ? (
        <div className="sello">
          <p className="sello__titulo">COMERCIO RESCATA</p>
          <p className="sello__nombre">{comercio.nombre}</p>
          <p className="sello__nivel">{actual ? actual.nombre : '—'}</p>
          <img src={qr.img} alt="Código QR del sello" width="160" height="160" />
          <a href={qr.url} target="_blank" rel="noreferrer" className="nota">
            Abrir página pública
          </a>
        </div>
      ) : (
        <button className="boton boton--acento boton--ancho" onClick={abrir}>
          Ver mi sello y QR
        </button>
      )}
    </section>
  )
}

export default function Comercio() {
  const { state, yo, dispatch } = useStore()
  const toast = useToast()
  const c = yo.comercio
  const deHoy = state.donaciones.filter((d) => d.comercioId === c.id && esHoy(d.creadaEn))
  const kg = kgComercio(state.donaciones, c.id)

  const confirmar = (d) => {
    dispatch({ type: 'CONFIRMAR_COMERCIO', id: d.id })
    toast(d.confirmacionEntidad ? 'Entrega confirmada por las dos partes' : 'Entrega confirmada. Falta que la entidad marque «Recibido».')
  }

  return (
    <div className="pila">
      <Identidad rol="Comercio" nombre={c.nombre} detalle={c.direccion} />
      {c.usaTGTG && (
        <p className="banner">🔁 ¿Usas Too Good To Go? Rescata es para lo que queda <strong>después</strong>: lo que nadie ha comprado al cierre.</p>
      )}
      <Publicar />
      <section className="tarjeta">
        <h2>Mis donaciones de hoy</h2>
        {deHoy.length === 0 ? (
          <p className="nota">Aún no has publicado nada hoy.</p>
        ) : (
          <ul className="lista">
            {deHoy.map((d) => (
              <li key={d.id}>
                {d.items.map((i) => i.alimento).join(', ')} · {fmtKg(d.pesoConfirmado_kg)} · <em>{ETIQUETA_ESTADO[d.estado]}</em>
                {d.estado !== 'publicada' && d.estado !== 'confirmada' && !d.confirmacionComercio && (
                  <button className="boton boton--pequeno" onClick={() => confirmar(d)}>
                    ✓ Confirmar entrega
                  </button>
                )}
                {d.confirmacionComercio && !d.confirmacionEntidad && <span className="nota"> · esperando a la entidad</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <Sello comercio={c} kg={kg} />
    </div>
  )
}
