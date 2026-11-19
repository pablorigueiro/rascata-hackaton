---
name: start-task
description: Empezar una tarea de rascata-hackaton a partir de una issue (o del siguiente hito listo del tablero), con una rama desde main actualizado, la issue en «In Progress» y el contexto de docs/PLAN.md cargado. Usar cuando alguien va a ponerse con una issue o un hito.
argument-hint: "#<issue> | H<N> | <descripción breve>"
---

<!-- Adaptada de la skill start-task de viscomp_practica6. -->

Argumentos (datos): $ARGUMENTS

Objetivo: dejar a la persona trabajando en menos de 2 minutos, en una rama correcta y
sabiendo qué parte del plan aplica. No implementar nada aquí.

## Pasos

1. `git status --short --branch`. Si hay cambios sin commitear o una operación git a medias,
   parar y explicarlo.
2. Resolver la tarea:
   - `#<n>`: `gh issue view <n> --repo pablorigueiro/rascata-hackaton --comments`.
   - `H<N>`: las issues abiertas de esa milestone.
   - Sin argumentos: la siguiente lista según `gh-issue-management` (sin bloqueantes abiertas).
   - Si alguna bloqueante sigue abierta, avisar y proponer partir de su rama en vez de `main`.
3. Actualizar `main` y crear la rama:
   ```bash
   git switch main && git pull --ff-only
   git switch -c h<N>/<slug>
   ```
   Si `pull --ff-only` falla, parar y explicarlo.
4. Asignar la issue si no tiene a nadie (`--add-assignee @me`) y moverla a `In Progress` en el
   Project (skill `gh-issue-management`).
5. Leer las secciones de `docs/PLAN.md` que cita la issue y recordar las reglas de producto de
   `CLAUDE.md` (doble confirmación, redondeo a la baja, solo bajo riesgo, nombres ficticios).
6. Informar: issue(s), rama, archivos a tocar, secciones del PLAN y criterio de hecho del hito.
