# Architecture Conventions

This document defines the layered architecture for the SC Market frontend. The goal is clean separation between data fetching, business logic, rendering, and layout.

The canonical example is `features/email/`. When in doubt, look there.

## Where does this code go?

- A rule, calculation, mapping or validation, i.e. anything you could test without rendering, goes in `domain/` as a pure function with a unit test. Pass `now` and the language in; return codes, not translated text.
- Calling the API, chaining mutations, alerts and `t()` go in a hook in the feature's `hooks/`. One hook per job.
- Components and pages render. They call hooks and domain functions, and never RTK mutations, `has_permission` or `toLocaleString()` directly.
- A form edits a draft. Create it from server data once, keyed by the entity id, and turn it into a request with a domain function. Never copy server data into `useState` with a `useEffect` (see `features/shops/domain/shopSettingsForm.ts`).
- Numbers, prices and dates go through `util/format` (`useFormatters()` in components: the render language, and UTC until hydrated), never a bare `toLocale*()` (a lint error), and "now" comes from `useNow()` or is passed in, so server and browser agree.
- If you are about to write the same `if` a second time, it belongs in `domain/`.
- Colour has roles. Green (`primary`, the default) is the one accent: main actions, fields, selection controls, links and the focus ring. `secondary` is the buy side and premium (bid and buy-order prices, "Top bid", the bid curve, supporter and premium badges) and only colours text, chips, badges, chart series and `sx` colours. Secondary-role buttons and outlined chips use `color="neutral"`. Every theme keeps `secondary` and `neutral` at AA as text (`src/hooks/styles/theme/__tests__/accentRoles.test.tsx`).
- Tags are coloured by type, never per call site: `<TagChip tag="category" … />` (`components/tags/tagColors.ts` maps each tag type to one colour from `palette.tag`, which every theme derives at AA). See `docs/theme-tag-colors.md`.

---

## Directory Roles

### `features/<name>/` — Feature modules (the core unit)

Each feature is a self-contained vertical slice. Subdirectories:

| Directory     | Purpose                                                            | Rules                                                                                         |
| ------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `domain/`     | Pure types, formatters, validators, constants                      | **No imports** from React, MUI, store, or other features                                      |
| `api/`        | RTK Query slices — the only code that talks to the backend         | May import from `domain/`. No UI imports                                                      |
| `hooks/`      | Business logic hooks. `usePage*` hooks orchestrate data for a page | May import from `api/` and `domain/`. **No JSX**                                              |
| `components/` | Rendering. Receives data via props                                 | May use `useTheme`/`useMediaQuery` for styling. **Never calls mutations or queries directly** |
| `index.ts`    | Barrel file — the public API of the feature                        | Re-exports from all subdirectories                                                            |

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

| Rule                                                                                                                                                     | Enforced By                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/*/domain/` has no React/MUI/store imports (`import type` of generated API types from `store/` is allowed)                                      | ESLint `no-restricted-imports` + `@typescript-eslint/no-restricted-imports` with `allowTypeImports` (error, `.ts` and `.tsx`); fixtures in `scripts/__tests__/domainPurityLint.test.ts`                  |
| `components/` does not import from `store/`                                                                                                              | ESLint `no-restricted-imports`                                                                                                                                                                           |
| No new files in `views/`                                                                                                                                 | Code review                                                                                                                                                                                              |
| No new slices in `store/` (top-level)                                                                                                                    | Code review                                                                                                                                                                                              |
| Pages are thin shells                                                                                                                                    | Code review                                                                                                                                                                                              |
| Feature components receive data via props, not queries                                                                                                   | Code review                                                                                                                                                                                              |
| No `any`, `unknown`, or `Record<string, unknown>` as a substitute for real types                                                                         | Code review + `@typescript-eslint/no-explicit-any`                                                                                                                                                       |
| Hooks are called unconditionally, before any early return                                                                                                | ESLint `react-hooks/rules-of-hooks` (error)                                                                                                                                                              |
| No hard-coded route strings in `to=` / `href=` / `navigate()` (helpers in `src/routes/paths.ts`); no `new Date()` in tsx (`useNow()` from `util/format`) | ESLint `no-restricted-syntax` (error)                                                                                                                                                                    |
| Components and views don't call mutations or `has_permission` (mutations go in a named hook in `features/<f>/hooks/`)                                    | ESLint `scm-style/render-layer` (error)                                                                                                                                                                  |
| `palette.secondary` (the buy side and premium) is not used on form controls, buttons, tabs, links, sliders, toggles, progress or focus styles            | ESLint `scm-style/no-secondary-accent` (error; the theme files and the theme editor are exempt); fixtures in `scripts/__tests__/secondaryAccentLint.test.ts`                                             |
| Button icons follow "Button icons" below; no glyph at either end of a button label                                                                       | ESLint `scm-style/button-icons` (error); catalogs: `src/util/__tests__/i18nButtonGlyphs.test.ts`                                                                                                         |
| Dialogs use `ResponsiveDialog` / `ConfirmDialog` (`components/dialog/`); a raw MUI `Dialog` only there and in the three game-data detail modals          | ESLint `@typescript-eslint/no-restricted-imports` (error); files not converted yet are on `DIALOG_LEGACY` in `eslint.config.js`, which only shrinks                                                      |
| tsx files stay under 400 lines                                                                                                                           | ESLint warning (`max-lines`), ratcheted: `npm run lint:ratchet` (CI) fails if the warning or error count rises above `scripts/lint-baseline.json`. Lower the baseline with `--update` when you fix some. |

---

## Button icons

One rule for every button, so similar actions look alike. Icons go in MUI's `startIcon` / `endIcon` (Rounded icons only), never as a glyph in the label.

**Which actions get an icon**

| Action                                                                         | Icon                                                                                     | Examples                                                                                                     |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Create / add (the entry point: opens the create page or dialog, or adds a row) | leading `AddRounded`                                                                     | Create Listing, Create Buy Order, Create Service, Create Shop, Add Lot, Add Webhook, Register your org       |
| Delete / remove (the button that starts it)                                    | leading `DeleteRounded`                                                                  | Delete, Remove, Delete Account, Remove Email                                                                 |
| Next / continue (a step forward in a flow)                                     | trailing `ChevronRightRounded`                                                           | Next, Continue                                                                                               |
| Back (a step back, or back to the parent page)                                 | leading `ChevronLeftRounded`                                                             | Back, Back to My Shops, Back to Wishlist                                                                     |
| External link (another site, or a new tab)                                     | trailing `OpenInNewRounded`                                                              | Join via SC Orgs, Copy Code and Open Profile, a guide's external link                                        |
| Cart and checkout                                                              | leading `AddShoppingCartRounded` / `ShoppingCartRounded` / `ShoppingCartCheckoutRounded` | Add to Cart (`AddShoppingCartRounded`); My Cart, Place Order, Submit Offer (`ShoppingCartRounded`); Checkout |
| Navigation (go to, view, see all, browse, manage, home)                        | none                                                                                     | See all, View Shop, Manage, Browse the market, Go Home                                                       |
| Dialog and form actions (submit, save, confirm, cancel, close)                 | none: the dialog or form already names the action                                        | Create, Save Changes, Unlink, Cancel                                                                         |

Other verbs (filters, refresh / retry, export, import, copy, block, bid, assign, order status steps) may take one leading icon when it helps scanning; the same verb uses the same icon everywhere (retry is `RefreshRounded`, filters `FilterListRounded`). Brand sign-in buttons carry the brand mark (Discord, Citizen iD). A toggle's state can use a leading icon (`CheckRounded` on "Owned").

**Size.** Don't set `fontSize` on a `startIcon` / `endIcon` icon: MUI sizes it from the button (small 18px, medium 20px, large 22px). In an `IconButton`, a `size="small"` button takes `fontSize="small"` (20px) on its icon; medium and large take the default 24px.

**Icon-only actions** are an `IconButton` (or a `Fab`) with an `aria-label` (a `Tooltip` around it names it too), never a `Button` holding only an icon. A text link to another site ends with a small `OpenInNewRounded` (`fontSize: "1em"`, `aria-hidden`), not "→".

**Labels.** No "+", "→", "←", "✓", "×" or "▸" at either end of a label, in code or in any of the 8 catalogs.

Enforced by ESLint `scm-style/button-icons` (error; `scripts/button-icons.mjs`, fixtures in `scripts/__tests__/buttonIconsLint.test.ts`): glyphs at either end of a `Button` / `LoadingButton` / `ToggleButton` / `Fab` label (JSX text, literals, and `t()`: the en value or the default), `fontSize` on a `startIcon` / `endIcon` icon, a `Button` holding only an icon, and an `IconButton` without an `aria-label` or `Tooltip`. The catalogs: `src/util/__tests__/i18nButtonGlyphs.test.ts` (no value in any locale starts or ends with one of the glyphs, except a short list of non-label keys such as "+3 more").

---

## Type Safety

**Do not use `any`, `unknown`, or `Record<string, unknown>` as a workaround for missing types.** These mask real problems and spread untyped data through the codebase.

When you encounter untyped data:

1. **API responses** — Update the OpenAPI spec on the backend, then regenerate the frontend client with `npm run codegen:api`. The generated types in `store/api/v2/` are the source of truth.
2. **Hand-written API slices** — Add proper request/response types to `features/*/domain/types.ts` and use them in the endpoint definitions in `features/*/api/`.
3. **Third-party data** — Create an interface in the relevant `domain/types.ts` that describes the shape you actually use.
4. **Temporary escape hatches** — If you genuinely need `any` during a migration, add a `// TODO: type this` comment with a ticket reference. These should not persist.

```typescript
// ❌ Bad
const data = response as any
const items = (result as Record<string, unknown>)["items"]

// ✅ Good — update the OpenAPI spec and regenerate
interface OrderDetail {
  items: OrderItemDetail[]
  total_price: number
}
const { data } = useGetOrderDetailQuery({ orderId })

// ✅ Good — define the type in domain/
import type { OrderDetail } from "../domain/types"
```

The `@typescript-eslint/no-explicit-any` rule is set to `warn`. Treat warnings as errors in new code.

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
