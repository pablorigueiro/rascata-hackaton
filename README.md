# Rescata

> Las grandes cadenas ya tienen herramientas para donar porque la ley les obliga. La panadería de tu calle no: tira el pan cada noche porque donar 3 kg no le compensa. Rescata junta las donaciones pequeñas de todo un barrio en una ruta para que sí compense.

Demo de hackatón (web app móvil, sin backend). Especificación: [docs/PLAN.md](docs/PLAN.md). Reglas del repo: [CLAUDE.md](CLAUDE.md).

*README completo en el hito 7.*

## Arranque rápido

```bash
npm install
npm run dev -- --host   # abre la URL «Network» desde el móvil (misma wifi)
```

## Decisiones

Tomadas sin preguntar para no bloquear la demo (ver `docs/PLAN.md`):

- **Histórico más grande que «~40 donaciones»**: para que haya un comercio en Oro (≥ 1.000 kg) sin
  donaciones irreales de 25 kg, el histórico tiene ~520 donaciones confirmadas (la panadería Oro
  dona 6 días por semana, lo que además sirve para el nivel «Residuo cero»). Se genera de forma
  determinista y relativa a la fecha de reinicio, así que «hoy» y «este mes» siempre cuadran.
- **Panadería O Forno empieza en 248,0 kg** (Bronce): con los 2,5 kg del guion sube a Plata.
- **Donaciones de hoy**: 3 ya reservadas por el comedor ancla (7,0 kg) para que la ruta de mañana
  tenga paradas y, con la de O Forno, salgan «4 comercios, 9,5 kg»; 2 sin reservar (fruta y pan de
  noche) que demuestran el filtrado por perfil de la Parroquia (categoría y horario).
- **Identidad por pestaña** (`sessionStorage`): cada pestaña puede ser un rol distinto; el estado de
  las donaciones es compartido (`localStorage` + `BroadcastChannel`).
- **Router propio por hash** en lugar de react-router (menos dependencias). `base: './'` en Vite
  para publicar la build en cualquier hosting estático.
- Versiones fijadas: React 18.3, react-leaflet 4.2 (compatible con React 18), Vite 5.4.
- **Sin Google Fonts**: los títulos usan fuentes redondeadas del sistema (`ui-rounded`), porque la
  única integración externa permitida es la IA y las teselas del mapa, y así la demo no depende de la red.
- **`analizarFoto` devuelve además `origen`** (`mock` o el proveedor) y, si ha caído al mock,
  `aviso` con el texto a mostrar. Nunca lanza por culpa de la IA. En modo `mock` no se redimensiona
  la foto (no se envía a ningún sitio); el redimensionado se aplica antes de llamar a una IA real.
