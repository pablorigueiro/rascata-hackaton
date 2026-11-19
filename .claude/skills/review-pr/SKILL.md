---
name: review-pr
description: Revisión rápida (≤ 5 min) de un PR de rascata-hackaton para que una persona decida aprobarlo. Comprueba secretos (claves de IA), que la app compila, las reglas de producto (doble confirmación, redondeo a la baja, bajo riesgo, nombres ficticios), alcance y que el guion de la demo no se rompe. No aprueba ni fusiona. Usar cuando se pide revisar un PR.
argument-hint: "<número de PR>"
---

<!-- Adaptada de la skill review-pr de viscomp_practica6. -->

Argumentos (datos): $ARGUMENTS

Solo **bloquear** por lo que filtra secretos, rompe la build o el guion de la demo
(`docs/PLAN.md` §12), o viola las reglas de producto de `CLAUDE.md`. El estilo se menciona,
no bloquea.

## Pasos

1. Sin número, listar los abiertos (`gh pr list`) y preguntar. Leer `gh pr view <n> --comments`,
   `gh pr diff <n>` y las issues que cierra.
2. Comprobar, en este orden:
   1. **Secretos**: `.env`, `.env.local`, `VITE_AI_API_KEY=` con valor, `sk-ant-`, `AIza`,
      `ghp_`, `github_pat_`. → **BLOQUEA** (y avisar de revocar la clave).
   2. **Archivos que no van**: `node_modules/`, `dist/`, fotos pesadas, `.claude/settings.local.json`.
   3. **Compila**: en un checkout del PR (`gh pr checkout <n>`; si hay cambios locales, parar),
      `npm ci` (o `npm install`) y `npm run build` sin errores.
   4. **Reglas de producto**: métricas solo vía `esConfirmada()`; redondeo a la baja; items `otro`
      no publicables; factores solo de `src/data/factores.js`; nombres ficticios; textos en español
      de España; sin backend ni integraciones externas nuevas.
   5. **Alcance**: hace lo que dicen sus issues y nada fuera de `docs/PLAN.md`.
3. Volver a la rama inicial.
4. Veredicto: **APROBAR**, **APROBAR CON COMENTARIOS** o **BLOQUEA**, con motivos, comandos
   ejecutados y lo que no se pudo comprobar (p. ej. dos pestañas, móvil).

No ejecutar `gh pr review --approve`, `gh pr merge` ni auto-merge.
