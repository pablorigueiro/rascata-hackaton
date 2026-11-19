// IA de visión. En la demo solo se usa el modo mock (VITE_AI_PROVIDER=mock por defecto).
// Los proveedores reales quedan para el hito 7 (recortado por tiempo).

const PROPUESTAS = {
  pan: [{ alimento: 'barras de pan', categoria: 'pan', cantidad: 12, peso_kg: 3.0, confianza: 'alta' }],
  bolleria: [{ alimento: 'croissants', categoria: 'bolleria', cantidad: 20, peso_kg: 1.2, confianza: 'alta' }],
  fruta: [{ alimento: 'manzanas', categoria: 'fruta', cantidad: 15, peso_kg: 3.0, confianza: 'media' }],
  verdura: [{ alimento: 'lechugas', categoria: 'verdura', cantidad: 6, peso_kg: 2.4, confianza: 'media' }],
}

export async function analizarFoto(_archivo, pista = 'pan') {
  await new Promise((r) => setTimeout(r, 1200))
  return (PROPUESTAS[pista] || PROPUESTAS.pan).map((i) => ({ ...i }))
}
