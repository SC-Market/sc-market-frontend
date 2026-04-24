# Architecture Conventions

This document defines the layered architecture for the SC Market frontend. The goal is clean separation between data fetching, business logic, rendering, and layout.

The canonical example is `features/email/`. When in doubt, look there.

---

## Directory Roles

### `features/<name>/` — Feature modules (the core unit)

Each feature is a self-contained vertical slice. Subdirectories:

| Directory | Purpose | Rules |
|---|---|---|
| `domain/` | Pure types, formatters, validators, constants | **No imports** from React, MUI, store, or other features |
| `api/` | RTK Query slices — the only code that talks to the backend | May import from `domain/`. No UI imports |
| `hooks/` | Business logic hooks. `usePage*` hooks orchestrate data for a page | May import from `api/` and `domain/`. **No JSX** |
| `components/` | Rendering. Receives data via props | May use `useTheme`/`useMediaQuery` for styling. **Never calls mutations or queries directly** |
| `index.ts` | Barrel file — the public API of the feature | Re-exports from all subdirectories |

Dependency flow within a feature:

```
components/ ──→ domain/
hooks/      ──→ api/ ──→ domain/
```

### `pages/` — Thin route shells

A page file should be **under 50 lines**. It does three things:

1. Calls a `usePage*` hook from a feature
2. Picks a layout component
3. Renders the feature's component with the hook's data

```tsx
export function UnsubscribePage() {
  const pageData = usePageUnsubscribe()
  return (
    <StandardPageLayout title="Unsubscribe" maxWidth="sm" noSidebar>
      <UnsubscribeContent data={pageData.data} isLoading={pageData.isLoading} />
    </StandardPageLayout>
  )
}
```

Pages **never** import from `store/` directly.

### `components/` — Shared UI primitives

Reusable components that are **not** specific to any feature: layout shells, buttons, typography, skeletons, modals, navigation, etc.

Rules:
- **No imports from `store/`** — no queries, no mutations, no selectors
- **No feature-specific logic** — if it mentions "order", "contractor", "listing" in its business logic, it belongs in a feature
- Receives all data via props

### `hooks/` — Cross-cutting hooks only

Only truly app-wide concerns live here: `alert/`, `layout/`, `nav/`, `styles/`, `gestures/`, `animations/`, `accessibility/`, `performance/`, `pwa/`, `prefetch/`, `router/`.

Feature-specific context providers belong in their feature's `hooks/` directory, not here.

### `store/` — Legacy (being migrated)

Old-style RTK Query slices that predate the feature module pattern. These are being migrated into `features/*/api/` (see `DECOUPLING_PLAN.md`).

**Do not add new slices here.** New API code goes in `features/<name>/api/`.

### `views/` — Legacy (being migrated)

Large view components that mix data fetching, business logic, and rendering. These are being broken up into `features/*/hooks/` + `features/*/components/` (see `DECOUPLING_PLAN.md`).

**Do not add new files here.** New view code goes in `features/<name>/components/`.

### `datatypes/` — Legacy (being migrated)

Shared type definitions. New types go in `features/<name>/domain/types.ts`. Types that are truly shared across many features can stay here, but prefer feature-owned types.

---

## Rules Summary

| Rule | Enforced By |
|---|---|
| `features/*/domain/` has no React/MUI/store imports | ESLint `no-restricted-imports` |
| `components/` does not import from `store/` | ESLint `no-restricted-imports` |
| No new files in `views/` | Code review |
| No new slices in `store/` (top-level) | Code review |
| Pages are thin shells | Code review |
| Feature components receive data via props, not queries | Code review |

---

## Creating a New Feature

```bash
mkdir -p src/features/<name>/{api,domain,hooks,components}
```

1. **`domain/types.ts`** — Define the types for this feature's data
2. **`api/<name>Api.ts`** — Create the RTK Query slice (or move it from `store/`)
3. **`hooks/use<Name>.ts`** — Business logic hook
4. **`hooks/usePage<Name>.ts`** — Page-level data orchestration
5. **`components/<Name>.tsx`** — Rendering component
6. **`index.ts`** — Barrel exports
7. **`pages/<name>/<Page>.tsx`** — Thin shell

## Migrating an Existing View

For a file like `views/orders/CreateService.tsx` (1,055 lines):

1. Extract pure logic → `features/orders/domain/serviceTypes.ts`
2. Extract data fetching + state → `features/orders/hooks/useCreateService.ts`
3. Remaining rendering → `features/orders/components/CreateServiceForm.tsx`
4. Page becomes thin shell → `pages/contracting/CreateService.tsx`
5. Delete the old `views/` file
