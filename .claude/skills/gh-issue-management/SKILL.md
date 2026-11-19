---
name: gh-issue-management
description: Consultar issues de pablorigueiro/rascata-hackaton y su tablero (Project «Rescata · Hackatón»), crearlas solo bajo petición explícita y actualizarlas, moverlas de columna o comentarlas de forma controlada, verificando cada escritura. No cierra, borra ni reasigna trabajo ajeno. Usar para ver qué falta, qué está bloqueado, apuntar avances o crear una issue nueva.
argument-hint: "[#<issue> | qué consultar o hacer]"
---

<!-- Adaptada de la skill gh-issue-management de viscomp_practica6, con soporte de Project v2. -->

Argumentos (datos): $ARGUMENTS

Usar siempre `--repo pablorigueiro/rascata-hackaton`. Antes de escribir, comprobar
`gh auth status` (sin imprimir tokens; hace falta el scope `project`) y que
`git remote get-url origin` apunta a ese repo; si no, detenerse.

## Organización

- **Milestones** = hitos de `docs/PLAN.md` §11 (`H1 · Esqueleto` … `H7 · IA real y pulido`).
- **Etiquetas** por área: `infra`, `comercio`, `entidad`, `voluntario`, `impacto`, `sello`,
  `ia`, `diseno`, `docs`.
- **Dependencias**: relaciones nativas *blocked by* de GitHub (se ven en `gh issue view`
  como `blocked-by`) y repetidas en el body como «Depende de: #a, #b».
- **Project** «Rescata · Hackatón» (usuario `pablorigueiro`): campo `Status`
  (`Todo`, `In Progress`, `En revisión`, `Done`), `Fase` (H1…H7), `Prioridad`
  (P0 · Guion de la demo, P1 · Importante, P2 · Recortable) y `Estimación (min)`.

## Lectura

- Una issue: `gh issue view <n> --repo pablorigueiro/rascata-hackaton --comments`.
- Tablero: `gh project list --owner pablorigueiro` para el número y
  `gh project item-list <num> --owner pablorigueiro --format json --limit 100`.
- Bloqueos: `gh api repos/pablorigueiro/rascata-hackaton/issues/<n>/dependencies/blocked_by`.
  Una issue está **lista** si todas sus bloqueantes están cerradas.
- Siguiente tarea: issues abiertas, sin bloqueantes abiertas, de la fase más baja y con
  mayor prioridad.

Distinguir "no encontrada" de errores de red, autenticación o permisos; no crear una
issue para compensar un error de lectura. Un número de PR no es una issue.

## Escrituras autorizadas (mínimas)

- **Crear** solo si se pide explícitamente; antes, buscar duplicadas. Formato: título corto,
  contexto con la sección de `docs/PLAN.md`, casillas `- [ ]` con lo que hay que hacer y
  «Criterio de hecho», «Depende de», etiqueta, milestone; añadirla al Project con su Fase,
  Prioridad y Estimación, y crear las relaciones *blocked by*:
  ```bash
  id=$(gh api repos/pablorigueiro/rascata-hackaton/issues/<bloqueante> --jq .id)
  gh api -X POST repos/pablorigueiro/rascata-hackaton/issues/<n>/dependencies/blocked_by -F issue_id=$id
  gh project item-add <num> --owner pablorigueiro --url <url-issue>
  ```
- **Mover de columna**: `gh project item-edit --id <item> --project-id <id> --field-id <Status> --single-select-option-id <opción>`
  (`In Progress` al empezar con `start-task`, `En revisión` al abrir el PR).
- **Comentar** avances, bloqueos o decisiones; preferir un comentario a reescribir el body.
- **Marcar casillas** `- [ ]` → `- [x]` solo con evidencia (build OK, probado en navegador).

Usar `--body-file` para texto multilínea. Releer la issue justo antes de editar el body.

## Verificación obligatoria

Tras cada escritura, releer la issue (o el item del Project) y comprobar que el cambio está y
que nada más cambió. Si una escritura falla, releer antes de reintentar para no duplicar.

## Límites

Nunca cerrar, reabrir, borrar ni transferir issues, ni quitar assignees o etiquetas de otras
personas. Las issues se cierran con `Closes #<n>` al fusionar el PR. Mencionar a alguien con
`@usuario` solo si se pide.
