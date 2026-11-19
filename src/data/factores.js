// Factores de impacto ambiental por kg de alimento rescatado.
// Regla: no se inventan valores. Mientras un factor por categoría no esté verificado,
// se usa el factor por defecto, que sí tiene fuente publicada.

export const FACTOR_POR_DEFECTO = {
  co2e_kg_por_kg: 2.7,
  agua_l_por_kg: 810,
  fuente:
    'Too Good To Go, valor publicado para 1 kg de comida salvada (análisis de ciclo de vida de Mérieux NutriSciences | Blonk, 2024)',
  url: 'https://www.toogoodtogo.com/en-gb/about-us/esg',
}

// TODO: sustituir por el factor por categoría de Poore & Nemecek (2018) / Our World in Data.
// Hasta entonces co2e_kg_por_kg y agua_l_por_kg quedan en null y verificado en false.
export const FACTORES_POR_CATEGORIA = {
  pan: { co2e_kg_por_kg: null, agua_l_por_kg: null, verificado: false, fuente: null },
  bolleria: { co2e_kg_por_kg: null, agua_l_por_kg: null, verificado: false, fuente: null },
  fruta: { co2e_kg_por_kg: null, agua_l_por_kg: null, verificado: false, fuente: null },
  verdura: { co2e_kg_por_kg: null, agua_l_por_kg: null, verificado: false, fuente: null },
  envasado: { co2e_kg_por_kg: null, agua_l_por_kg: null, verificado: false, fuente: null },
}

// Supuesto orientativo: 1 ración ≈ 0,4 kg de alimento.
export const KG_POR_RACION = 0.4

export function factorDe(categoria) {
  const f = FACTORES_POR_CATEGORIA[categoria]
  return f && f.verificado ? f : FACTOR_POR_DEFECTO
}
