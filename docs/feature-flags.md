# Onboarding a new feature flag

How feature flags work across the SC Market stack, and the exact steps to add a new one. Written
from the real implementation — file references included so you can verify.

## How the system works

A flag is resolved per user in this order (backend `feature-flag.service.ts` `isFlagEnabled`):

1. **Per-user override** — a row in `user_feature_overrides (user_id, flag_name, enabled)`.
2. **Global config** — a row in `feature_flag_config (flag_name, enabled, default_version, rollout_percentage)`.
3. **Default** — `disabled` when no config row exists.

The **frontend** (`src/hooks/market/useFeatureFlag.ts`) reads flags synchronously from
`localStorage["feature_flags"]` merged over a `DEFAULT_FLAGS` object, then background-syncs from the
backend and writes the result back to localStorage. **Flag changes take effect on the next session,
not live** (by design — the read is synchronous and never blocks render).

Backend endpoints (TSOA `DebugV2Controller`, base `/api/v2`):
- `GET /api/v2/debug/feature-flag` → `{ flags, overridden_flags, has_override, ... }`
- `POST /api/v2/debug/feature-flag` with `{ flag_name, enabled }` (caller must be admin, in dev mode,
  or already have an override)

Admin/global management: `FeatureFlagAdminController` at `/api/v2/admin/feature-flags/*`.

### Key subtlety — why a migration is (usually) needed

Flag names are **not** constrained anywhere — `flag_name` is a plain `VARCHAR(100)`, no enum, no
allow-list. So a per-user override for *any* name persists for free. **But** `getAllFlags` iterates
**only over `feature_flag_config` rows** (`feature-flag.service.ts` — `getAllFlagConfigs`), so a flag
with no config row **never appears in the `flags` map** returned by `GET /debug/feature-flag`. And
`updateConfig` is **update-only** (no upsert), so there is **no API to create a config row**. New
config rows are seeded exactly the way `market_v2`/`crafting`/`wiki` were: via a migration.

Bottom line:
- **Per-user override only (e.g. dev/QA testing):** no backend change needed — it works for free.
- **First-class flag** (shows up in the `flags` map, supports a global default / % rollout / being
  set globally): **requires a migration** that inserts one row into `feature_flag_config`. This is a
  *data seed*, never a schema/column change — the design is fully dynamic on flag name.

## Steps to add a flag `my_new_flag`

### 1. Frontend default (required)
Add it to `DEFAULT_FLAGS` in `src/hooks/market/useFeatureFlag.ts` (default `false` unless you want it
on for everyone immediately):

```ts
const DEFAULT_FLAGS: FeatureFlags = { market_v2: true, crafting: true, wiki: false, nav_v2: false, my_new_flag: false }
```

The `FeatureFlags` interface has an open index signature, so no type change is needed — but adding the
default keeps behavior predictable before the server sync lands.

### 2. Backend config seed (required for a first-class / rollout flag)
Create a migration (`npm run migrate:make seed_my_new_flag`) that inserts a `feature_flag_config`
row, idempotently. Follow the pattern in
`sc-market-backend/migrations/20260717120000_seed_market_v2_redesign_flag.ts`:

```ts
export async function up(knex: Knex): Promise<void> {
  const existing = await knex("feature_flag_config").where("flag_name", "my_new_flag").first()
  if (!existing) {
    await knex("feature_flag_config").insert({
      flag_name: "my_new_flag",
      enabled: false,
      default_version: "V1",
      rollout_percentage: 0,
    })
  }
}
export async function down(knex: Knex): Promise<void> {
  await knex("feature_flag_config").where("flag_name", "my_new_flag").del()
}
```

Apply with `npm run migrate:latest`. Skip this step only if you truly need per-user overrides and
nothing else.

### 3. Read the flag in components
```tsx
import { useFeatureFlag } from "../hooks/market/useFeatureFlag"

const { flags } = useFeatureFlag()
return flags.my_new_flag ? <NewThing /> : <OldThing />
```

### 4. Gate EVERYTHING behind the flag
When the flag is **off**, the experience must be byte-for-byte identical to before. That includes not
just pages, but **nav items, button labels/CTAs, and link targets**. If you change where an existing
link points or add/remove a nav entry, wrap the change in the flag check and leave the off-path
untouched. Prefer route-level branching (e.g. `MarketV2Routes.tsx`) so you don't touch shared nav
components; if you must edit a shared component, gate only the on-path diff.

## Enabling a flag for yourself

**Locally (frontend only, no backend):** in the browser console, then reload —
```js
const f = JSON.parse(localStorage.feature_flags || "{}"); f.my_new_flag = true; localStorage.feature_flags = JSON.stringify(f)
```

**Persisted server-side (per user):** `POST /api/v2/debug/feature-flag` with `{ "flag_name": "my_new_flag", "enabled": true }`
(admin or dev-mode). Takes effect next session.

**Global default / gradual rollout:** set `enabled` / `rollout_percentage` on the `feature_flag_config`
row via the admin endpoints (`/api/v2/admin/feature-flags/config`) — the row must already exist (step 2).

## Reference — real example

`market_v2_redesign` is a worked example of the full onboarding:
- Frontend default: `src/hooks/market/useFeatureFlag.ts` (`DEFAULT_FLAGS`)
- Migration seed: `sc-market-backend/migrations/20260717120000_seed_market_v2_redesign_flag.ts`
- Flag-gated routing (nothing leaks when off): `src/features/market/v2/MarketV2Routes.tsx`
