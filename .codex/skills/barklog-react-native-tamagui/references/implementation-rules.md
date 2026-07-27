# BarkLog Expo and Tamagui Rules

## Stack Truth

- routing: `app/` with Expo Router
- styling: `tamagui.config.ts`, `TamaguiProvider`, generated CSS
- state: Zustand plus manager services
- services: `src/managers`
- bootstrap: `src/app/bootstrap`

## File Placement

- route shells and screen registration: `app/`
- reusable UI: `src/components`
- hooks: `src/hooks`
- stores: `src/store`
- service integrations: `src/managers` and `src/api`

## Delivery Heuristics

- prefer vertical slices over broad scaffolding
- prefer one clear home-screen action cluster over dense dashboards
- make first render meaningful even before all secondary data is loaded
- keep offline-safe journaling local-first where possible

## Validation

- `npm run check-types`
- targeted `eslint` on touched files
- relevant Jest coverage if logic changed
- `npm run tamagui:generate` after config changes
- `npx expo start -c` after Metro or theme issues

## Known Repo Reality

- repo-wide `npm run lint` currently contains inherited debt outside new BarkLog work
- use targeted lint unless the task explicitly addresses the lint backlog
