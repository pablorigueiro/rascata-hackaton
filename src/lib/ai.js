// IA de visión: la IA propone, el comercio confirma (docs/PLAN.md §3).
//
//   analizarFoto(fileOrDataUrl) → { items: [{ alimento, categoria, cantidad, peso_kg }], confianza, origen, aviso? }
//   categoria ∈ pan | bolleria | fruta | verdura | envasado | otro
//
// Proveedor según VITE_AI_PROVIDER (por defecto «mock»). El mock es también el plan B si la IA
// real falla en directo. Los proveedores reales (anthropic, gemini) llegan en la issue #21.

import { redondeaAbajo } from './donaciones.js'

export const CATEGORIAS =['pan', 'bolleria', 'fruta', 'verdura', 'envasado', 'otro']

export const AVISO_SIN_IA = 'Sin conexión con la IA: usando estimación de ejemplo'

const LADO_MAX = 1024
const CALIDAD_JPEG = 0.8
const ESPERA_MOCK_MS = 1200

// ---------------------------------------------------------------------------
// Redimensionado en cliente (canvas, máx. 1024 px, JPEG 0,8) → data URL
// ---------------------------------------------------------------------------

function leerComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(r.error || new Error('No se pudo leer la foto'))
    r.readAsDataURL(file)
  })
}

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo abrir la foto'))
    img.src = src
  })
}

/** Devuelve la foto como data URL JPEG con el lado mayor ≤ 1024 px. */
export async function redimensionarFoto(fileOrDataUrl, ladoMax = LADO_MAX, calidad = CALIDAD_JPEG) {
  const src = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : await leerComoDataUrl(fileOrDataUrl)
  const img = await cargarImagen(src)
  const escala = Math.min(1, ladoMax / Math.max(img.naturalWidth, img.naturalHeight))
  const ancho = Math.max(1, Math.round(img.naturalWidth * escala))
  const alto = Math.max(1, Math.round(img.naturalHeight * escala))
  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // los PNG con transparencia no salen en negro al pasar a JPEG
  ctx.fillRect(0, 0, ancho, alto)
  ctx.drawImage(img, 0, 0, ancho, alto)
  return canvas.toDataURL('image/jpeg', calidad)
}

// ---------------------------------------------------------------------------
// Mock: ~1,2 s y resultado según el nombre del archivo
// ---------------------------------------------------------------------------

const RESPUESTAS_MOCK = {
  pan: {
    items: [{ alimento: 'barras de pan', categoria: 'pan', cantidad: 12, peso_kg: 3.0 }],
    confianza: 0.92,
  },
  bolleria: {
    items: [
      { alimento: 'croissants', categoria: 'bolleria', cantidad: 16, peso_kg: 0.9 },
      { alimento: 'bollos de leche', categoria: 'bolleria', cantidad: 10, peso_kg: 0.8 },
    ],
    confianza: 0.86,
  },
  fruta: {
    items: [
      { alimento: 'manzanas', categoria: 'fruta', cantidad: 12, peso_kg: 2.4 },
      { alimento: 'plátanos', categoria: 'fruta', cantidad: 8, peso_kg: 1.4 },
    ],
    confianza: 0.88,
  },
  verdura: {
    items: [
      { alimento: 'tomates', categoria: 'verdura', cantidad: 14, peso_kg: 2.1 },
      { alimento: 'lechugas', categoria: 'verdura', cantidad: 4, peso_kg: 1.6 },
    ],
    confianza: 0.84,
  },
  // Sin pista en el nombre: mix de panadería
  mix: {
    items: [
      { alimento: 'barras de pan', categoria: 'pan', cantidad: 8, peso_kg: 2.0 },
      { alimento: 'croissants', categoria: 'bolleria', cantidad: 10, peso_kg: 0.6 },
      { alimento: 'bollos de leche', categoria: 'bolleria', cantidad: 6, peso_kg: 0.4 },
    ],
    confianza: 0.78,
  },
}

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Elige la respuesta del mock a partir del nombre del archivo (sin tildes ni mayúsculas). */
export function claveMock(nombre) {
  const n = normalizar(nombre)
  // «bolleria» antes que «pan» (p. ej. «pan-y-bolleria.jpg» → bollería)
  if (n.includes('bolleria') || n.includes('croissant')) return 'bolleria'
  if (n.includes('verdura')) return 'verdura'
  if (n.includes('fruta')) return 'fruta'
  if (n.includes('pan')) return 'pan'
  return 'mix'
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

function copiar(respuesta) {
  return { items: respuesta.items.map((i) => ({ ...i })), confianza: respuesta.confianza }
}

async function analizarMock(_foto, { nombre, espera = ESPERA_MOCK_MS } = {}) {
  await esperar(espera)
  return { ...copiar(RESPUESTAS_MOCK[claveMock(nombre)]), origen: 'mock' }
}

// ---------------------------------------------------------------------------
// Selector de proveedor
// ---------------------------------------------------------------------------

const PROVEEDORES = {
  mock: analizarMock,
  // anthropic y gemini: issue #21
}

export function proveedorActual() {
  return (import.meta.env?.VITE_AI_PROVIDER || 'mock').trim().toLowerCase()
}

function nombreDe(fileOrDataUrl) {
  return typeof fileOrDataUrl === 'string' ? '' : fileOrDataUrl?.name || ''
}

/**
 * Analiza una foto de excedentes. Nunca lanza por culpa de la IA: si el proveedor no existe
 * o falla, devuelve la estimación del mock con `aviso`.
 * Opciones: `proveedor` (por defecto VITE_AI_PROVIDER), `espera` del mock en ms.
 */
export async function analizarFoto(fileOrDataUrl, opciones = {}) {
  const nombre = nombreDe(fileOrDataUrl)
  const proveedor = opciones.proveedor || proveedorActual()

  if (proveedor === 'mock') return analizarMock(fileOrDataUrl, { nombre, espera: opciones.espera })

  try {
    const analizar = PROVEEDORES[proveedor]
    if (!analizar) throw new Error(`Proveedor de IA desconocido: ${proveedor}`)
    const foto = await redimensionarFoto(fileOrDataUrl)
    return { ...(await analizar(foto, { nombre })), origen: proveedor }
  } catch (err) {
    console.warn('[ai] usando el mock:', err)
    return { ...(await analizarMock(fileOrDataUrl, { nombre, espera: opciones.espera })), aviso: AVISO_SIN_IA }
  }
}

/** Peso total propuesto, redondeado a la baja (regla de conservadurismo). */
export function pesoTotal(items) {
  return redondeaAbajo(items.reduce((s, i) => s + (Number(i.peso_kg) || 0), 0))
}
