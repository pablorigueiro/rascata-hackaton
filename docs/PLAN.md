# Rescata · Plan maestro de la demo

Documento de referencia del proyecto. Las issues del tablero citan sus secciones (`PLAN §N`).
Tiempo total: **< 2 h** contando pruebas. Prioridad: que la demo funcione de principio a fin
y luzca bien, por encima de la completitud técnica.

## 1. Contexto del producto

> Las grandes cadenas ya tienen herramientas para donar porque la ley les obliga. La panadería
> de tu calle no: tira el pan cada noche porque donar 3 kg no le compensa. Rescata junta las
> donaciones pequeñas de todo un barrio en una ruta para que sí compense.

Rescata es la plataforma de donación de excedentes alimentarios para el **pequeño comercio de
barrio** (panaderías, fruterías, bares, ultramarinos). Las grandes superficies ya están cubiertas
por la Ley 1/2025 de prevención del desperdicio alimentario y por herramientas como Donations+ de
Too Good To Go; el pequeño comercio (microempresas y locales de menos de 1.300 m²) está exento y
nadie lo atiende. Rescata no compite con Too Good To Go: va después («lo que no vendiste, dónalo
en un toque»).

**Roles**: Comercio (publica lo que le sobra) · Entidad social (comedor, parroquia, banco de
alimentos: recibe solo lo que le sirve) · Voluntario (ruta de recogida agrupada por el barrio).

**Principios** (respuestas a las críticas del jurado):

- La IA propone, las personas confirman: el peso estimado es editable por el comercio.
- Doble confirmación: solo cuenta cuando el comercio confirma la entrega y la entidad la recepción.
- Conservadurismo: todas las cifras se redondean a la baja.
- Solo productos de bajo riesgo: pan, bollería, fruta, verdura y envasados en fecha.
- Perfil de entidad (qué acepta, frío, capacidad, horario): solo recibe avisos compatibles.
- Aviso tipo WhatsApp/SMS para entidades (simulado).
- Ruta agrupada con dos turnos (noche al cierre / mañana siguiente) y nevera solidaria como plan B.
- Gratis siempre para comercios y entidades (modelo: ayuntamientos + patrocinio; solo README).

## 2. Restricciones técnicas

- Vite + React (JavaScript). CSS propio. Sin frameworks de UI pesados.
- Sin backend, BD ni login. Context + `useReducer` persistido en `localStorage`.
- Sincronización entre pestañas (`storage` o `BroadcastChannel`) para la demo con dos pestañas.
- Mapa `leaflet` + `react-leaflet` con OSM (importar `leaflet/dist/leaflet.css` y arreglar los
  iconos por defecto con Vite).
- QR con `qrcode`. Rutas por hash. Mobile-first (390 px; contenedor máx. ~480 px).
- Nada con compilación nativa. `npm run dev -- --host` para abrir desde el móvil.

## 3. IA de visión (`src/lib/ai.js`)

`async analizarFoto(fileOrDataUrl) → { items: [{ alimento, categoria, cantidad, peso_kg }], confianza }`,
`categoria ∈ pan | bolleria | fruta | verdura | envasado | otro`.

- `VITE_AI_PROVIDER=mock|anthropic|gemini` (por defecto `mock`), `VITE_AI_API_KEY`, `VITE_AI_MODEL`.
- Anthropic: `POST https://api.anthropic.com/v1/messages` con `x-api-key`,
  `anthropic-version: 2023-06-01`, `content-type: application/json`,
  `anthropic-dangerous-direct-browser-access: true`; imagen como bloque `image` base64.
- Gemini: `generateContent` con la imagen como `inline_data` base64.
- Prompt: pide JSON estricto; parseo tolerante (primer bloque `{...}`).
- **Mock**: ~1,2 s con spinner «Analizando la foto…»; según el nombre del archivo (`pan`,
  `fruta`, `verdura`, `bolleria`) o mix de panadería.
- Si falla la llamada o el parseo → mock + aviso «Sin conexión con la IA: usando estimación de ejemplo».
- Redimensionar en cliente (canvas, máx. 1024 px, JPEG 0,8).
- README: la clave queda expuesta en el navegador; aceptable solo para una demo local.

## 4. Modelo de datos (`src/data/`)

```
Comercio { id, nombre, tipo: panaderia|fruteria|bar|ultramarinos, direccion, lat, lng, usaTGTG, desde }
Entidad  { id, nombre, tipo: comedor|parroquia|banco_alimentos, direccion, lat, lng, telefonoAvisos,
           perfil: { acepta: [...], tieneFrio, capacidadMaxKg, horario: { noche, manana } } }
Voluntario { id, nombre, transporte: a_pie|bici|coche }
NeveraSolidaria { id, nombre, lat, lng }
Donacion { id, comercioId, items, pesoPropuestoIA_kg, pesoConfirmado_kg, checklistOk,
           turno: noche|manana,
           estado: publicada|reservada|en_ruta|entregada_comercio|confirmada|en_nevera|caducada,
           entidadId, voluntarioId, neveraId, confirmacionComercio, confirmacionEntidad,
           creadaEn, foto }
```

**Regla de oro**: `esConfirmada(d)` = `confirmacionComercio && confirmacionEntidad`; se usa
`pesoConfirmado_kg` redondeado a la baja (`Math.floor(x * 10) / 10`).

## 5. Datos semilla (`src/data/seed.js`)

Zona Nova / Ensanche de Santiago de Compostela (centro ≈ 42.8770, -8.5460), radio ~500 m,
nombres ficticios.

- 10 comercios: Panadería O Forno, Frutería A Horta, Bar O Recuncho, Ultramarinos Rúa Nova,
  Pastelería Doce Lúa, Froitas do Sar, Panadería Pan de Mollete, Bar A Cunca, Verduras Avoa
  Carme, Despensa do Ensanche. Al menos 4 con `usaTGTG: true`.
- 3 entidades: Comedor Social Rúa do Hórreo (ancla; todo bajo riesgo, sin frío, 30 kg, noche y
  mañana) · Parroquia de San Lourenzo (pan y bollería, sin frío, 10 kg, solo mañana) · Banco de
  Alimentos do Barrio (envasados, fruta, verdura, con frío, 50 kg, solo mañana).
- 2 voluntarios (Lucía, Xoán) · 1 nevera (Nevera Solidaria Praza Roxa).
- Histórico: ~40 donaciones confirmadas en 8 meses (≥1 comercio Oro, 2 Plata, varios Bronce,
  1 recién empezado) + 3–4 publicadas hoy sin reservar.
- Botón «Reiniciar demo» en un menú discreto.

## 6. Pantallas

- **6.0 Inicio `#/`**: contador nacional grande, tres tarjetas de rol + enlace a Impacto, selector
  de qué comercio/entidad/voluntario eres.
- **6.1 Comercio `#/comercio`**: Hacer foto / Subir foto → «Analizando la foto…» → items
  editables («La IA propone 3,0 kg · Tú confirmas: [2,5] kg», badge de confianza) → checklist de
  3 casillas obligatorias (items `otro` en rojo, bloquean; se pueden eliminar) → turno (mañana por
  defecto si todo es pan/bollería) → «Publicar donación» → toast. Banner «Después de TGTG» si
  `usaTGTG`. «Mis donaciones de hoy» con estado y «Desliza para confirmar entrega». Acceso a «Mi sello».
- **6.2 Entidad `#/entidad`**: perfil editable; aviso tipo WhatsApp solo si es compatible
  (categorías ⊆ acepta, peso ≤ capacidad restante, turno en horario) con «SÍ» / «No, gracias»;
  contador «N donaciones no encajan con tu perfil» con tooltip del motivo. «SÍ» → reservada.
  «Por recibir»: botón «Recibido ✓» → si también confirmó el comercio → confirmada → contador
  sube, CO₂ de la donación y toast de subida de nivel de sello.
- **6.3 Voluntario `#/voluntario`** ⭐: turno noche/mañana; mapa con comercios (bolsa, color por
  estado), entidad, nevera (gris); polilínea inicio → comercios (vecino más cercano, haversine)
  → entidad, paradas numeradas; lista con kg por parada, total, distancia y tiempo (a pie 5 km/h,
  bici 15 km/h); «4 comercios, 9,5 kg, 1,2 km: una sola ruta en lugar de 4 viajes.»; «Recogido»
  → en_ruta; «Entregar todo» → entregada_comercio; atajo «Simular confirmaciones»; plan B nevera
  → en_nevera; donaciones de noche sin reservar a la hora límite → mañana o caducada.
- **6.4 Impacto `#/impacto`**: tarjetas kg, raciones (0,4 kg/ración), CO₂e y agua; barras SVG/CSS
  de kg por mes (8 meses); ranking de comercios con sello; modal «¿Cómo lo calculamos?»; leyenda
  fija de doble confirmación y redondeo a la baja.
- **6.5 Contador nacional**: count-up «X kg rescatados hoy en España»; Santiago real + ciudades
  simuladas que crecen con `setInterval`; «Último rescate…»; «Mejor día: N kg»; salto con escala
  y color al confirmar; etiqueta «Datos de otras ciudades simulados para la demo.»
- **6.6 Sello**: adhesivo circular «COMERCIO RESCATA» + nombre + nivel + QR. Bronce ≥ 50 kg,
  Plata ≥ 250 kg, Oro ≥ 1.000 kg, Residuo cero (≥ 5 días distintos/semana durante 12 semanas;
  aproximación documentada). Barra de progreso. Descargar PNG. Página pública `#/sello/:id` con
  datos codificados en `?d=<base64url JSON>` (el móvil del jurado no tiene el localStorage).
  Base del QR: `window.location.origin + window.location.pathname`.

## 7. Cálculo de impacto (`src/lib/impacto.js`, `src/data/factores.js`)

- Factor por defecto: **2,7 kg CO₂e y 810 L de agua por kg** (Too Good To Go, ACV de Mérieux
  NutriSciences | Blonk, 2024 — https://www.toogoodtogo.com/en-gb/about-us/esg).
- Estructura por categoría con `verificado: false` y `// TODO: Poore & Nemecek (2018) / OWID`.
  Mientras no esté verificado, se usa el factor por defecto. **No inventar valores.**
- `calcularImpacto(confirmadas) → { kg, raciones, co2e_kg, agua_l }`, todo a la baja;
  `raciones = floor(kg / 0.4)` (orientativo).
- Modal con qué se cuenta, redondeo, factores y fuentes, supuesto de raciones y la frase
  «Si una cifra no se puede defender, no la mostramos.»

## 8. Diseño visual

Cálido y de barrio. Verde salvia (acción/impacto), crema de fondo, terracota de acento (sello y
avisos), gris oscuro para texto, contraste AA. Botones ≥ 48 px. Emoji o lucide-react. Count-up,
toasts, deslizador, salto del contador. Barra de navegación inferior. Vista doble opcional > 1000 px.

## 9. Estructura de archivos

```
src/main.jsx  App.jsx  styles.css
src/store/StoreContext.jsx
src/lib/{ai,impacto,ruta,sello}.js
src/data/{seed,factores}.js
src/components/{Contador,SlideToConfirm,AvisoWhatsApp,MapaRuta,SelloAdhesivo,ModalMetodologia,Toast}.jsx
src/pages/{Inicio,Comercio,Entidad,Voluntario,Impacto,SelloPublico}.jsx
```

## 10. Lo que NO se hace

Backend, BD, autenticación, pagos; integraciones reales con WhatsApp o TGTG; factores por
categoría inventados; nombres reales; publicar cocinado o refrigerado; contar sin doble
confirmación; tests exhaustivos o TypeScript; funcionalidades fuera de este documento.

## 11. Hitos (fases del tablero)

| Hito | Contenido | Tiempo | Criterio de hecho |
|---|---|---|---|
| H1 Esqueleto | Vite, router, store, sync, semilla, selector, navegación, estilos | 15 min | Navego por las 4 secciones y los datos persisten al recargar |
| H2 Comercio | Foto → IA mock → pesos → checklist → turno → publicar; TGTG; hoy | 25 min | Publico y aparece en la pestaña de entidad sin recargar |
| H3 Entidad | Perfil, compatibilidad, aviso WhatsApp, reservar, Recibido | 15 min | Incompatible no avisa; compatible sí |
| H4 Voluntario | Mapa, paradas, polilínea, resumen, recogido/entregar, nevera | 25 min | Ruta con 3–4 paradas y «una sola ruta en lugar de N viajes» |
| H5 Confirmación e impacto | Deslizador, doble confirmación, contador, impacto, metodología | 20 min | Con las dos confirmaciones el contador salta; sin ambas, nada cambia |
| H6 Sello | Niveles, progreso, adhesivo QR, página pública | 15 min | Escaneo el QR desde otro dispositivo y veo la página |
| H7 IA real + pulido | Proveedores reales con fallback, textos, responsive, README | resto | Guion §12 sin fallos |

## 12. Guion de la demo (2 min)

1. Inicio: el contador nacional se mueve.
2. Comercio (Panadería O Forno): banner TGTG; foto `pan.jpg`; la IA propone «12 barras, 3,0 kg»;
   corrijo a 2,5 kg; checklist; turno mañana; publico.
3. Entidad (Comedor Social Rúa do Hórreo) en otra pestaña: llega el aviso; «SÍ». La Parroquia no
   recibe un aviso de fruta porque no encaja.
4. Voluntario (Lucía): ruta de mañana con 4 comercios: «4 comercios, 9,5 kg, una sola ruta en
   lugar de 4 viajes». Recogidas y entrega.
5. Confirmación: deslizo en el comercio y «Recibido» en la entidad → contador salta, CO₂ y
   «¡Panadería O Forno sube a nivel Plata!».
6. Sello: «Mi sello», el jurado escanea el QR y ve la página pública.
7. Impacto: «¿Cómo lo calculamos?».

`public/demo/`: `pan.jpg`, `fruta.jpg`, `verdura.jpg`, `bolleria.jpg` (fotos reales que pone el
equipo; no descargar de internet).

## 13. README

Pitch, arranque (`npm install`, `npm run dev -- --host`), configuración de IA (`.env.example`),
demo con dos pestañas, publicación estática para el QR, metodología con fuentes, aviso de clave
expuesta y «Siguientes pasos» (WhatsApp real, factores por categoría verificados, más barrios,
panel para ayuntamientos, patrocinio de rutas).

## 14. Flujo de trabajo y tablero

- Project de GitHub «Rescata · Hackatón»: columnas `Todo` → `In Progress` → `En revisión` → `Done`;
  campos **Fase** (H1…H7), **Prioridad** (P0 imprescindible para el guion, P1, P2 recortable) y
  **Estimación (min)**. Dependencias como relaciones nativas *blocked by* de GitHub y en el body.
- Milestones = hitos. Etiquetas por área: `infra`, `comercio`, `entidad`, `voluntario`, `impacto`,
  `sello`, `ia`, `diseno`, `docs`.
- Ramas `h<N>/<slug>`; un PR por hito con `Closes #…` de sus issues.
