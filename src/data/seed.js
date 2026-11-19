// Datos semilla de la demo: un único barrio (Zona Nova / Ensanche, Santiago de Compostela).
// Todos los nombres de comercios, entidades y personas son FICTICIOS.
//
// El histórico se genera de forma determinista (PRNG con semilla fija) y relativa al momento
// en que se crea o reinicia la demo, para que «hoy», «este mes» y los niveles cuadren siempre.
// Totales confirmados por comercio diseñados para el guion de la demo (docs/PLAN.md §12):
//   - Panadería Pan de Mollete ≈ 1.085 kg → Oro (y Residuo cero: dona 6 días por semana)
//   - Frutería A Horta ≈ 320 kg y Pastelería Doce Lúa ≈ 270 kg → Plata
//   - Panadería O Forno = 248,0 kg exactos → Bronce; con los 2,5 kg de la demo sube a Plata
//   - Varios en Bronce y Despensa do Ensanche recién empezada (sin nivel)

export const SEED_VERSION = 1
export const CENTRO_BARRIO = { lat: 42.877, lng: -8.546 }

export const COMERCIOS = [
  { id: 'c1', nombre: 'Panadería O Forno', tipo: 'panaderia', direccion: 'Rúa do Doutor Teixeiro, 12', lat: 42.8781, lng: -8.5452, usaTGTG: true, desde: '2026-03-01' },
  { id: 'c2', nombre: 'Frutería A Horta', tipo: 'fruteria', direccion: 'Rúa da República do Salvador, 8', lat: 42.8772, lng: -8.5478, usaTGTG: false, desde: '2026-03-01' },
  { id: 'c3', nombre: 'Bar O Recuncho', tipo: 'bar', direccion: 'Rúa de Santiago de Chile, 5', lat: 42.876, lng: -8.544, usaTGTG: true, desde: '2026-03-01' },
  { id: 'c4', nombre: 'Ultramarinos Rúa Nova', tipo: 'ultramarinos', direccion: 'Rúa do Hórreo, 40', lat: 42.879, lng: -8.547, usaTGTG: false, desde: '2026-03-01' },
  { id: 'c5', nombre: 'Pastelería Doce Lúa', tipo: 'panaderia', direccion: 'Rúa de Montero Ríos, 22', lat: 42.8765, lng: -8.5495, usaTGTG: true, desde: '2026-03-01' },
  { id: 'c6', nombre: 'Froitas do Sar', tipo: 'fruteria', direccion: 'Rúa de Romero Donallo, 3', lat: 42.8752, lng: -8.5462, usaTGTG: false, desde: '2026-03-01' },
  { id: 'c7', nombre: 'Panadería Pan de Mollete', tipo: 'panaderia', direccion: 'Rúa de Xeneral Pardiñas, 15', lat: 42.8798, lng: -8.544, usaTGTG: true, desde: '2026-03-01' },
  { id: 'c8', nombre: 'Bar A Cunca', tipo: 'bar', direccion: 'Rúa de Frei Rosendo Salvado, 9', lat: 42.8745, lng: -8.5485, usaTGTG: false, desde: '2026-03-01' },
  { id: 'c9', nombre: 'Verduras Avoa Carme', tipo: 'fruteria', direccion: 'Rúa de Alfredo Brañas, 30', lat: 42.8785, lng: -8.55, usaTGTG: false, desde: '2026-03-01' },
  { id: 'c10', nombre: 'Despensa do Ensanche', tipo: 'ultramarinos', direccion: 'Rúa de Santiago del Estero, 4', lat: 42.8758, lng: -8.542, usaTGTG: false, desde: '2026-11-01' },
]

export const ENTIDADES = [
  {
    id: 'e1', nombre: 'Comedor Social Rúa do Hórreo', tipo: 'comedor', ancla: true,
    direccion: 'Rúa do Hórreo, 61', lat: 42.8743, lng: -8.545, telefonoAvisos: '600 000 001',
    perfil: { acepta: ['pan', 'bolleria', 'fruta', 'verdura', 'envasado'], tieneFrio: false, capacidadMaxKg: 30, horario: { noche: true, manana: true } },
  },
  {
    id: 'e2', nombre: 'Parroquia de San Lourenzo', tipo: 'parroquia',
    direccion: 'Praza de San Lourenzo, 1', lat: 42.88, lng: -8.552, telefonoAvisos: '600 000 002',
    perfil: { acepta: ['pan', 'bolleria'], tieneFrio: false, capacidadMaxKg: 10, horario: { noche: false, manana: true } },
  },
  {
    id: 'e3', nombre: 'Banco de Alimentos do Barrio', tipo: 'banco_alimentos',
    direccion: 'Rúa de Ourense, 18', lat: 42.8735, lng: -8.541, telefonoAvisos: '600 000 003',
    perfil: { acepta: ['envasado', 'fruta', 'verdura'], tieneFrio: true, capacidadMaxKg: 50, horario: { noche: false, manana: true } },
  },
]

// lat/lng = punto de inicio de la ruta de cada voluntario/a
export const VOLUNTARIOS = [
  { id: 'v1', nombre: 'Lucía', transporte: 'a_pie', lat: 42.8795, lng: -8.5485 },
  { id: 'v2', nombre: 'Xoán', transporte: 'bici', lat: 42.874, lng: -8.543 },
]

export const NEVERAS = [{ id: 'n1', nombre: 'Nevera Solidaria Praza Roxa', lat: 42.8768, lng: -8.5432 }]

// Productos típicos por tipo de comercio: [alimento, categoria, kg por unidad]
const PRODUCTOS = {
  panaderia: [['barras de pan', 'pan', 0.25], ['croissants', 'bolleria', 0.06], ['bollos de leche', 'bolleria', 0.08]],
  fruteria: [['manzanas', 'fruta', 0.2], ['plátanos', 'fruta', 0.18], ['tomates', 'verdura', 0.15], ['lechugas', 'verdura', 0.4]],
  bar: [['barras de pan', 'pan', 0.25], ['magdalenas', 'bolleria', 0.05]],
  ultramarinos: [['paquetes de pasta', 'envasado', 0.5], ['latas de legumbres', 'envasado', 0.4], ['barras de pan', 'pan', 0.25]],
}

// [comercioId, kg totales confirmados, días entre donaciones (aprox.) o 'diaria']
const PLAN_HISTORICO = [
  ['c7', 1085.3, 'diaria'],
  ['c2', 320.4, 3.5],
  ['c5', 270.2, 3.5],
  ['c1', 248.0, 3.5],
  ['c6', 120.6, 7],
  ['c4', 80.3, 7],
  ['c9', 62.1, 14],
  ['c3', 55.4, 14],
  ['c8', 22.5, 30],
]

const DIA = 24 * 60 * 60 * 1000
const DIAS_HISTORICO = 240 // ≈ 8 meses

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inicioDelDia(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function item(prod, kg) {
  const [alimento, categoria, kgUnidad] = prod
  return { alimento, categoria, cantidad: Math.max(1, Math.round(kg / kgUnidad)), peso_kg: kg }
}

function entidadPara(categoria, turno, kg, rnd) {
  if ((categoria === 'pan' || categoria === 'bolleria') && turno === 'manana' && kg <= 10 && rnd() < 0.3) return 'e2'
  if (['fruta', 'verdura', 'envasado'].includes(categoria) && rnd() < 0.5) return 'e3'
  return 'e1'
}

function diasDeDonacion(frecuencia, hoy, rnd) {
  const dias = []
  if (frecuencia === 'diaria') {
    // 6 días por semana (descansa el domingo): base del nivel «Residuo cero»
    for (let i = DIAS_HISTORICO; i >= 1; i--) {
      const t = hoy - i * DIA
      if (new Date(t).getDay() !== 0) dias.push(t)
    }
    return dias
  }
  let i = DIAS_HISTORICO - Math.floor(rnd() * frecuencia)
  while (i >= 1) {
    dias.push(hoy - i * DIA)
    i -= Math.max(1, Math.round(frecuencia + (rnd() - 0.5) * frecuencia * 0.6))
  }
  return dias
}

function repartirKg(total, n, rnd) {
  const raw = Array.from({ length: n }, () => 0.6 + rnd() * 0.8)
  const suma = raw.reduce((a, b) => a + b, 0)
  const kg = raw.map((r) => Math.max(0.5, Math.floor((r / suma) * total * 10) / 10))
  const resto = Math.round((total - kg.slice(0, -1).reduce((a, b) => a + b, 0)) * 10) / 10
  kg[n - 1] = resto
  return kg
}

export function crearSeed(ahora = Date.now()) {
  const rnd = mulberry32(20260301)
  const hoy = inicioDelDia(ahora)
  const donaciones = []
  let n = 0

  for (const [comercioId, total, frecuencia] of PLAN_HISTORICO) {
    const comercio = COMERCIOS.find((c) => c.id === comercioId)
    const productos = PRODUCTOS[comercio.tipo]
    const dias = diasDeDonacion(frecuencia, hoy, rnd)
    const kgs = repartirKg(total, dias.length, rnd)
    dias.forEach((dia, i) => {
      const kg = kgs[i]
      const prod = productos[Math.floor(rnd() * productos.length)]
      const turno = prod[1] === 'pan' || prod[1] === 'bolleria' ? (rnd() < 0.6 ? 'manana' : 'noche') : 'manana'
      const creadaEn = dia + 20.5 * 3600e3 + Math.floor(rnd() * 3600e3)
      let confCom = dia + DIA + 9.5 * 3600e3 + Math.floor(rnd() * 1800e3)
      let confEnt = confCom + 20 * 60e3 + Math.floor(rnd() * 1800e3)
      if (confEnt > ahora) {
        // donación de ayer confirmada esta mañana: nunca en el futuro
        confEnt = ahora - (5 + Math.floor(rnd() * 60)) * 60e3
        confCom = Math.min(confCom, confEnt - 10 * 60e3)
      }
      donaciones.push({
        id: `h${++n}`,
        comercioId,
        items: [item(prod, kg)],
        pesoPropuestoIA_kg: Math.round((kg + 0.1 + rnd() * 0.6) * 10) / 10,
        pesoConfirmado_kg: kg,
        checklistOk: true,
        turno,
        estado: 'confirmada',
        entidadId: entidadPara(prod[1], turno, kg, rnd),
        voluntarioId: rnd() < 0.5 ? 'v1' : 'v2',
        neveraId: null,
        confirmacionComercio: confCom,
        confirmacionEntidad: confEnt,
        creadaEn,
        foto: null,
      })
    })
  }

  // Despensa do Ensanche: recién empezada (dos donaciones pequeñas)
  ;[9, 3].forEach((diasAtras, i) => {
    const dia = hoy - diasAtras * DIA
    const kg = i === 0 ? 3.5 : 2.6
    donaciones.push({
      id: `h${++n}`, comercioId: 'c10', items: [item(PRODUCTOS.ultramarinos[0], kg)],
      pesoPropuestoIA_kg: kg + 0.5, pesoConfirmado_kg: kg, checklistOk: true, turno: 'manana',
      estado: 'confirmada', entidadId: 'e3', voluntarioId: 'v2', neveraId: null,
      confirmacionComercio: dia + DIA + 9.7 * 3600e3, confirmacionEntidad: dia + DIA + 10.1 * 3600e3,
      creadaEn: dia + 20.6 * 3600e3, foto: null,
    })
  })

  // Donaciones de hoy (sin confirmar). Ruta de mañana: 3 ya reservadas por el comedor ancla
  // (7,0 kg) + la que publica Panadería O Forno en la demo (2,5 kg) = 4 comercios, 9,5 kg.
  const hace = (min) => ahora - min * 60e3
  const hoyDon = (id, comercioId, prod, kg, turno, estado, entidadId, min) => ({
    id, comercioId, items: [item(prod, kg)], pesoPropuestoIA_kg: Math.round((kg + 0.5) * 10) / 10,
    pesoConfirmado_kg: kg, checklistOk: true, turno, estado, entidadId, voluntarioId: null, neveraId: null,
    confirmacionComercio: null, confirmacionEntidad: null, creadaEn: hace(min), foto: null,
  })
  donaciones.push(
    hoyDon('hoy1', 'c2', PRODUCTOS.fruteria[0], 3.5, 'manana', 'reservada', 'e1', 95),
    hoyDon('hoy2', 'c5', PRODUCTOS.panaderia[1], 1.5, 'manana', 'reservada', 'e1', 80),
    hoyDon('hoy3', 'c4', PRODUCTOS.ultramarinos[0], 2.0, 'manana', 'reservada', 'e1', 64),
    // Sin reservar: fruta (no encaja con la Parroquia por categoría) y pan de noche (no encaja por horario)
    hoyDon('hoy4', 'c6', PRODUCTOS.fruteria[1], 4.0, 'manana', 'publicada', null, 40),
    hoyDon('hoy5', 'c3', PRODUCTOS.bar[0], 1.2, 'noche', 'publicada', null, 25),
  )

  return {
    version: SEED_VERSION,
    comercios: COMERCIOS,
    entidades: ENTIDADES,
    voluntarios: VOLUNTARIOS,
    neveras: NEVERAS,
    donaciones,
    // avisos que cada entidad ha rechazado («No, gracias»): { [entidadId]: [donacionId] }
    rechazos: {},
    creadoEn: ahora,
  }
}
