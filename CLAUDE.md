# Reglas del repositorio (Rescata · demo de hackatón)

Se aplican a personas y agentes. **Rescata** es una web app móvil (demo) de donación de
excedentes alimentarios para el pequeño comercio de barrio. Especificación completa:
`docs/PLAN.md` (es el documento maestro; si algo no está ahí, no se hace). Tablero:
GitHub Project «Rescata · Hackatón». Todo el texto visible de la app en **español de España**.

## Prioridad absoluta

Que la demo funcione de principio a fin y luzca bien (guion de 2 min, `docs/PLAN.md` §12)
por encima de la completitud técnica. Si vamos mal de tiempo, orden de recorte:
descarga PNG del sello → nivel «Residuo cero» → gráfico mensual → vista doble de escritorio
→ IA real (la demo funciona con mock).

## Stack y límites (obligatorios)

- Vite + React en **JavaScript** (nada de TypeScript). CSS propio en `src/styles.css`.
- Sin backend, base de datos, login ni pagos. Estado en React Context + `useReducer`,
  persistido en `localStorage` y sincronizado entre pestañas (`storage` / `BroadcastChannel`).
- Rutas por hash (`#/comercio`, `#/entidad`, `#/voluntario`, `#/impacto`, `#/sello/:id`).
- Mapa: `leaflet` + `react-leaflet` con OSM. QR: `qrcode`. Nada con compilación nativa.
- Única integración externa permitida: IA de visión (`src/lib/ai.js`) y teselas del mapa.
- Mobile-first (390 px), contenedor centrado máx. ~480 px en escritorio.

## Reglas de producto (no negociables)

- **Doble confirmación**: una donación solo cuenta (contador, CO₂, sello, ranking) si
  `esConfirmada(d)` → `confirmacionComercio && confirmacionEntidad`. Un único helper.
- **Conservadurismo**: todas las cifras redondeadas a la baja (`Math.floor(x * 10) / 10`).
- Solo productos de bajo riesgo: pan, bollería, fruta, verdura y envasados en fecha.
  Nunca permitir publicar un item de categoría `otro`.
- Factores de impacto solo los citados en `src/data/factores.js` (2,7 kg CO₂e y 810 L por kg).
  **No inventar** factores por categoría ni estadísticas del sector.
- Nombres de comercios y entidades **ficticios**. Nada de marcas ni entidades reales.

## Qué no se sube nunca

`.env`, `.env.local` o cualquier clave de IA, `node_modules/`, `dist/`,
`.claude/settings.local.json`, fotos personales pesadas.

## Flujo de trabajo

1. Cada tarea es una issue del Project con casillas y dependencias (skill `gh-issue-management`).
2. Rama desde `main` actualizado con prefijo `h<N>/<slug>` según el hito (skill `start-task`).
3. Al terminar un hito: la app arranca sin errores (`npm run build` y `npm run dev`),
   commits semánticos y PR a `main` con cómo se probó (skill `semantic-commits-and-push`).
4. Los agentes nunca aprueban ni fusionan PRs, ni hacen commits directos a `main`.
5. Las decisiones tomadas sin preguntar se anotan en `README.md` → «Decisiones».

No declarar algo como hecho sin haberlo ejecutado: decir qué se probó (build, navegador,
dos pestañas, móvil) y qué no.
