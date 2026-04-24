# Architecture Decoupling Plan

> Audit date: 2026-04-23
> Last updated: 2026-04-24
> Goal: Decouple business logic, data fetching, rendering, and layout across the entire codebase using the pattern already established in `features/email/`.

## Status Summary

| Phase | Status | Summary |
|---|---|---|
| Phase 0: Conventions | ✅ | ARCHITECTURE.md, ESLint rules, type safety guidance |
| Phase 1: Store migration | ✅ | All 16 store slices → features/*/api/, shims deleted |
| Phase 2: Feature shells | ✅ | 21 feature modules, all with index.ts barrel files |
| Phase 3: Extract from views/ | ✅ | 11 view files decomposed (~2,500 lines extracted into hooks) |
| Phase 4: Clean components/ | ✅ | OrderSettings, NotificationsButton, UserActionsDropdown, SelectGameItem extracted |
| Phase 5: Context providers | ✅ | 12 contexts moved to owning features, shims deleted |
| Phase 6: Fill feature gaps | ✅ | Domain types for 12 features, 21 API files, 72 hooks |

---

## Current State: Two Architectures Coexisting

The `features/` directory represents the target architecture. The rest of the app hasn't caught up yet.

### The Target Pattern (`features/email/` as exemplar)

```
features/email/
  index.ts              ← barrel exports, public API
  api/emailApi.ts       ← RTK Query slice, owned by the feature
  domain/types.ts       ← pure types, no UI imports
  domain/formatters.ts  ← pure functions, no side effects
  hooks/useEmailSettings.ts    ← business logic hooks (no JSX)
  hooks/usePageUnsubscribe.ts  ← page-level data orchestration
  components/EmailSettings.tsx ← rendering, receives data via props
```

Pages are thin shells:

```tsx
// pages/email/UnsubscribePage.tsx — ~30 lines
export function UnsubscribePage() {
  const pageData = usePageUnsubscribe()
  return (
    <StandardPageLayout ...>
      <UnsubscribeContent data={pageData.data} />
    </StandardPageLayout>
  )
}
```

### What's Not There Yet

| Layer | Files | Problem |
|---|---|---|
| `views/` | 118 tsx | 48 call mutations directly, 65 call queries directly, mix business logic + rendering + layout in single files |
| `views/orders/` | 17 files | No `features/orders/` exists. `CreateService.tsx` is 1,055 lines with inline state, mutations, formatting, and rendering |
| `views/settings/` | 14 files | No `features/settings/` exists |
| `views/contracts/` | 12 files | No `features/contracts/` exists (`features/contracting/` only has hooks) |
| `views/people/` | 6 files | No `features/people/` exists |
| `components/` | 271 tsx | 76 call queries, 19 call mutations — many are "smart" components that should be split |
| `pages/` | 110 tsx | 54 call queries, 14 call mutations — better than views/ but many still have inline business logic |
| `hooks/` | 21 context providers | Global state scattered across `hooks/contract/`, `hooks/layout/`, `hooks/login/`, etc. |
| `store/` | 20 old-style slices | 263 imports across the codebase. Only 6 slices migrated to `features/*/api/` |

### Dependency Flow Today

```
pages/ ──→ views/ ──→ store/ (old slices)
  │           │         ↑
  │           ├──→ components/ (smart, also call store/)
  │           └──→ hooks/ (context providers)
  │
  └──→ features/ ──→ features/*/api/ (clean)
```

### Target Dependency Flow

```
pages/ ──→ features/*/hooks/usePage*()
              │
              ├──→ features/*/api/
              ├──→ features/*/domain/
              └──→ features/*/components/ (dumb, props only)
                      │
                      └──→ components/ (shared UI primitives, no store access)
```

---

## Phase 0: Establish Conventions ✅

Create `ARCHITECTURE.md` and lint rules. See that file for the conventions.

**Effort:** 1 day

---

## Phase 1: Migrate Old Store Slices

The 20 old-style slices in `store/` are the root cause of coupling. Every view and component that imports from `store/profile` or `store/contractor` is tightly bound to the data layer.

**Strategy:** For each slice, move it to `features/X/api/`, re-export from the old path temporarily, then update importers feature-by-feature.

Priority order by import count:

| Slice | Importers | Target Feature |
|---|---|---|
| `store/profile` | 107 | `features/profile/api/` |
| `store/contractor` | 47 | `features/contractor/api/` |
| `store/offer` | 23 | `features/offers/api/` |
| `store/orders` | 13 | `features/orders/api/` (new) |
| `store/services` | 13 | `features/services/api/` (new) |
| `store/recruiting` | 13 | `features/recruiting/api/` |
| `store/notification` | 13 | `features/notifications/api/` (already exists) |
| `store/public_contracts` | 8 | `features/contracting/api/` |
| `store/orderSettings` | 5 | `features/orders/api/` |
| `store/ships` | 5 | `features/fleet/api/` |
| `store/admin` | 5 | `features/admin/api/` |
| `store/organizations` | 5 | `features/contractor/api/` |
| `store/moderation` | 3 | `features/admin/api/` |
| `store/transactions` | 3 | `features/money/api/` |
| `store/comments` | 2 | `features/comments/api/` (new) |
| `store/commodities` | 1 | `features/wiki/api/` (new) |

**Effort:** 2–3 weeks

---

## Phase 2: Create Missing Feature Modules

These view/page directories have no corresponding feature:

| Domain | views/ files | pages/ files | Create |
|---|---|---|---|
| orders | 17 | — | `features/orders/{api,domain,hooks,components}/` |
| settings | 14 | — | `features/settings/{hooks,components}/` |
| contracts | 12 | — | Expand `features/contracting/` with api/domain/components |
| people | 6 | 4 | `features/people/{hooks,components}/` |
| wiki | — | 10 | `features/wiki/{api,domain,hooks,components}/` |
| wishlists | — | 6 | `features/wishlists/{api,domain,hooks,components}/` |
| blueprints | — | 6 | `features/blueprints/{hooks,components}/` |
| missions | — | 4 | `features/missions/{hooks,components}/` |
| crafting | — | 3 | `features/crafting/{hooks,components}/` |
| member | 3 | — | Fold into `features/contractor/` |
| transactions | 1 | — | Fold into `features/money/` |
| comments | 1 | — | `features/comments/{api,components}/` |

**Effort:** 1 week

---

## Phase 3: Extract Business Logic from views/

For each view file:

1. Extract pure logic (formatters, validators, constants) → `features/X/domain/`
2. Extract data fetching + mutations → `features/X/hooks/useXxx.ts`
3. What remains is the rendering component → `features/X/components/`
4. The page becomes a thin shell

Example — `views/orders/CreateService.tsx` (1,055 lines) becomes:

```
features/orders/domain/serviceTypes.ts       ← romanize(), PAYMENT_TYPES mapping
features/orders/hooks/useCreateService.ts    ← mutations, form state, validation
features/orders/components/CreateServiceForm.tsx ← rendering only
pages/contracting/CreateService.tsx          ← thin shell
```

Priority order (by file size × coupling):

1. `views/orders/` — 17 files, largest 1,055 lines
2. `views/contracts/` — 12 files, `ServiceView.tsx` 794 lines
3. `views/offers/` — 9 files, `ReceivedOffersArea.tsx` 903 lines
4. `views/contractor/` — 19 files, `OrgRoles.tsx` 714 lines
5. `views/settings/` — 14 files
6. `views/admin/` — 11 files
7. `views/authentication/` — 10 files
8. Everything else

**Effort:** 4–6 weeks

---

## Phase 4: Clean Up components/

After Phase 3, split any component that still calls queries/mutations directly:

- `components/settings/OrderSettings.tsx` (1,438 lines)
- `components/sidebar/SidebarEntries.tsx` (557 lines)
- `components/table/PaginatedTable.tsx` (626 lines)
- `components/rating/ListingRating.tsx` (623 lines)
- `components/modal/SelectPhotosArea.tsx` (665 lines)

Pattern: extract data-fetching into a hook, pass data down as props.

**Effort:** 1–2 weeks

---

## Phase 5: Consolidate hooks/ Context Providers

Move feature-specific contexts to their owning feature:

| Current Location | Move To |
|---|---|
| `hooks/contract/*` (5 contexts) | `features/contracting/hooks/` |
| `hooks/contractor/*` (2 contexts) | `features/contractor/hooks/` |
| `hooks/login/CurrentOrg.tsx` | `features/authentication/hooks/` |
| `hooks/offer/CounterOfferDetails.tsx` | `features/offers/hooks/` |
| `hooks/order/CurrentOrder.tsx` | `features/orders/hooks/` |
| `hooks/recruiting/*` (2 contexts) | `features/recruiting/hooks/` |
| `hooks/market/AddToCartContext.tsx` | `features/market/hooks/` |
| `hooks/wishlist/WishlistContext.tsx` | `features/wishlists/hooks/` |
| `hooks/time/AvailabilityHook.tsx` | `features/availability/hooks/` |

Keep in `hooks/` (truly cross-cutting): `alert/`, `layout/`, `nav/`, `styles/`, `gestures/`, `animations/`, `accessibility/`, `performance/`, `pwa/`, `prefetch/`, `router/`.

**Effort:** 2–3 days

---

## Phase 6: Fill Incomplete Feature Modules

| Feature | Has api/ | Has domain/ | Has hooks/ | Has components/ | Gap |
|---|---|---|---|---|---|
| admin | ✗ | ✗ | ✓ | ✓ | Needs api/, domain/ |
| authentication | ✗ | ✗ | ✓ | ✗ | Needs components/ |
| availability | ✗ | ✗ | ✓ | ✗ | Needs components/ |
| contracting | ✗ | ✗ | ✓ | ✗ | Needs api/, domain/, components/ |
| contractor | ✗ | ✗ | ✓ | ✓ | Needs api/, domain/ |
| fleet | ✗ | ✗ | ✓ | ✓ | Needs api/ |
| money | ✗ | ✗ | ✓ | ✓ | Needs api/ |
| offers | ✗ | ✗ | ✓ | ✗ | Needs api/, domain/, components/ |
| recruiting | ✗ | ✗ | ✓ | ✓ | Needs api/ |
| services | ✗ | ✗ | ✗ | ✓ | Needs api/, domain/, hooks/ |

**Effort:** 1–2 weeks

---

## Total Effort Estimate

| Phase | Effort |
|---|---|
| Phase 0: Conventions | 1 day |
| Phase 1: Store migration | 2–3 weeks |
| Phase 2: Feature shells | 1 week |
| Phase 3: Extract from views/ | 4–6 weeks |
| Phase 4: Clean components/ | 1–2 weeks |
| Phase 5: Move contexts | 2–3 days |
| Phase 6: Fill gaps | 1–2 weeks |
| **Total** | **9–14 weeks** (1 developer) |

## Recommended Execution Order

Don't do this all at once. Do it feature-by-feature, fully completing one domain (Phases 1–6) before moving to the next:

1. **Phase 0** first (conventions doc + lint rules)
2. Pick one domain and do Phases 1–6 end-to-end. Start with **orders** — most coupled (17 view files, 13 store imports), establishes the pattern.
3. Then **contractor** (47 store imports, 19 view files)
4. Then **profile** (107 store imports, already partially migrated)
5. Continue by import count

Each domain migration is self-contained and shippable.
