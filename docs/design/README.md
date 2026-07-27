# BarkLog Design Docs

## Canonical Source

Use [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md) as the first-stop source of truth for:

- design tokens
- screen specifications
- route naming
- interaction rules
- premium gating
- animation, haptics, dark mode, and accessibility

If a design doc in this folder conflicts with the canonical spec, the canonical spec wins.

## Current Design Doc Roles

- [screen-architecture.md](./screen-architecture.md)
  - target route map and screen inventory derived from the canonical spec
- [pre-build-readiness.md](./pre-build-readiness.md)
  - setup and launch-readiness checklist before implementation work
- [components.md](./components.md)
  - target shared component registry for BarkLog surfaces
- [screens/README.md](./screens/README.md)
  - guidance for screen-level docs and migration of future detailed specs

## Migration Note

Some older design files in this folder still reflect the earlier prototype direction. Treat them as legacy reference only until they are rewritten against the canonical spec.
