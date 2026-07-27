# Commands Reference

## Canonical Source

Use [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md) for stack and setup direction.

## Current Repo Commands

### Dependency and App Start

```bash
corepack pnpm install
pnpm web
pnpm android
pnpm ios
```

### Validation

```bash
pnpm check-types
pnpm lint
pnpm test
```

### Tooling

```bash
npx expo start -c
```

## Notes

- Older manager-toggle commands from the boilerplate are no longer BarkLog source-of-truth workflow.
- Do not rely on `module-registry.json` manager operations as the primary BarkLog architecture model.
