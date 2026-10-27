# SSR / Prerender Migration — Design Proposal

Status: Draft for review, assumptions validated 2026-10-23 (see §7) · Scope: `frontend/` (plus backend asks)

**Decided so far:**
- Ship the bridge (§1a). **Done:** live since 2026-10-23, covering the homepage, 14 hubs, entity and game-data detail pages.
- Render on-demand + cache instead of prerendering all game data (§5 Phase 3).
- **SSR runs in a Cloudflare Worker (§1b option A).** Decided 2026-10-24.
- **SSR for every visitor on public routes, with one anonymous, cacheable HTML version, and auth-dependent UI filled in on the client (§1c).** Decided 2026-10-24.

**Pre-work done (on main, 2026-10-23):** single base query with an injectable NetworkEnv + `makeStore()`; per-page prefetch functions (future loaders); single lazy chat socket, call-time browser globals, `useSession()`, `useLocalStorageState`, `useHydrated()`, `useCustomDomain()`; central breakpoint hooks, hydration-safe detail gates and seeded state.

## 1. Summary & recommendation

AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot) and link-preview bots (Discord, Twitter) don't run JS. Googlebot and Bingbot do, but late and expensively. The non-JS bots get the 188-line `index.html` shell with `<div id="root"></div>` and generic OG tags. All per-page `<title>`, OG and JSON-LD (35 files use `@unhead/react`) is client-only.

**Recommendation: adopt React Router framework mode, phased, with three changes to the brief:**

1. **Target React Router v8, not v7.** v8.0.0 shipped 2026-06-17 (latest is 8.5.0, v7 line ends at 7.18.x). Path: v6.30 → v7.18 with future flags (library mode) → v8 when we enter framework mode. v8 requirements: React ≥ 19.2.7 (we have 19.2.4 installed), Node ≥ 22.22, Vite ≥ 7 for framework mode (we're on 7.3.6). v8 is ESM-only and removes the `react-router-dom` package, which is imported in **315 files**. There's no official codemod; it's a find/replace per the v7 upgrade guide. Before v8 we must adopt v7's `v8_*` flags (`v8_middleware`, `v8_splitRouteModules`, `v8_viteEnvironmentApi`, `v8_passThroughRequests`, `v8_trailingSlashAwareDataRequests`).
2. **Prerender only hub pages; render game-data detail pages on demand and cache them per game version.** Prerendering all ~15.5k game-data pages (live sitemap) doesn't fit: CF Pages allows 20k files per site on Free (100k on paid), builds time out after 20 minutes, everything goes stale every patch, and item pages carry live data anyway (§5 Phase 3).
3. **Runtime SSR is always anonymous.** All auth cookies (`scmarket.sid`, `scmarket.access`, `scmarket.refresh`, `scmarket.cidstate`) are host-only on `api.sc-market.space` (`backend/src/server.ts:194-210`, `api/util/jwt.ts:203-226`: no `domain`, `SameSite=None`). A Worker on `sc-market.space` never sees it. That's fine for SEO (only public pages), and it means no server-side auth work. But we have to remove the hydration mismatches caused by client-only "logged-in" state (§3.4).

Vike, vite-react-ssg and Next.js all lose to RR framework mode for this codebase (§4). If the goal were only crawler visibility at minimum cost, a route-scoped Pages Function is the cheap stop-gap (Option E). It's worth considering as a 2-day bridge while Phases 1-2 land (see §1a).

## 1a. Architecture at a glance

The Express API stays a JSON API in every option. What changes is **who turns that JSON into HTML, and when**.

**Today:** only the browser turns JSON into a page. Crawlers that don't run JS get the empty shell.

![Today](diagrams/1-today.png)

**Bridge (decided, ~3–4 days):** a route-scoped Cloudflare Pages Function fetches the page's JSON from the existing API and uses `HTMLRewriter` to inject `<title>`, meta, JSON-LD and the answer-first summary into `index.html`. Every visitor gets the same response. Humans then run the SPA exactly as today. Express renders nothing.

![Bridge](diagrams/2-bridge.png)

**Target (Phase 4):** a Cloudflare Worker running React Router renders the real React page on the server. Route loaders call the `prefetchXPage(dispatch, params)` functions (branch `worktree-agent-aff73f5281e7e4760`, 11 page types) on a per-request store; the rest of the public routes still need them written. Browsers hydrate from the cache snapshot, then navigate client-side against the API as today.

![Target SSR](diagrams/3-target-ssr.png)

### Bridge vs no bridge

![What crawlers see over time](diagrams/4-bridge-vs-no-bridge.png)

| | No bridge | Bridge |
|---|---|---|
| Crawlers before Phase 4 | Empty shell for ~2 weeks of dev time (Phases 1–2), then hub pages only (Phase 3) | Real title/meta/JSON-LD + summary text on all public pages after ~3–4 days |
| Crawlers after Phase 4 | Full HTML | Full HTML (the bridge is removed prefix by prefix as SSR covers it) |
| Discord/Twitter link previews | Generic until Phase 3/4 | Correct per-page preview after ~2 days |
| Extra code | None | One Function (~1 file + `_routes.json`), reusing `answerContent.ts` builders (4 page types today; listing/shop/org/user/recruiting/blueprint/mission need head builders); deleted after Phase 4 |
| Express changes | Service token (needed for Phase 3/4 anyway) | Same service token, earlier |
| Cost | — | Measured 0.1–0.3 ms CPU per rewrite (workerd), so Free works: 100k requests/day, 10 ms CPU, 50 subrequests. Every public page load counts, logged-in included. Set **fail open** so over-quota serves the plain shell |
| What it doesn't give | — | Rendered page body beyond the summary; real 404s are possible but need care |
| Risk | Visibility delayed weeks | Small: HTML is the same for humans and bots, so no cloaking question (the summary must be visible); failure falls back to the plain shell |
| Gotchas | — | Function responses skip `_headers`/`_redirects`: set `Cache-Control`, `Link`, CORS in code. Fetch the shell via `env.ASSETS.fetch("/")` (pretty path, not `/index.html`) |

## 1b. Where SSR runs: hosting options

Today the API is one Lightsail container service (`cdk/lib/lightsail-stack.ts`): power `medium` (1 vCPU, 4 GB, $40/mo), `scale: 1`, containers `backend` + `discord`, and **only `backend` has the public endpoint**. Postgres is RDS. The API process also runs background jobs on `setInterval` (`backend/src/tasks/tasks.ts`: search-view rebuilds, auctions, listing expiry).

All four options keep static assets and private pages on Cloudflare. Only **public page loads** change. Cloudflare Pages can't proxy a path to another origin (`_redirects` 200 only takes relative URLs), so options B–D still need a thin edge rule or Worker that forwards page paths to Lightsail.

**A. Edge Worker (current plan):** SSR in a Cloudflare Worker, calling the API over HTTPS.

![Option A: edge](diagrams/5-opt-edge.png)

**B. Fold SSR into the Express API process:** Express gets SSR routes; the frontend build is baked into the backend image.

![Option B: Express](diagrams/6-opt-express.png)

**C. Separate Lightsail service for SSR:** a small Node SSR container (`react-router-serve`) deployed from the frontend repo.

![Option C: separate Lightsail service](diagrams/7-opt-lightsail-separate.png)

**D. Sidecar in the existing Lightsail service:** a third container next to `backend`/`discord`, reached via an Express proxy because only one container can be public.

![Option D: sidecar](diagrams/8-opt-sidecar.png)

| | A. Edge Worker | B. In Express | C. Separate Lightsail | D. Sidecar |
|---|---|---|---|---|
| Extra infra | Workers Paid ($5/mo) | none | +$7–15/mo service | none |
| CPU for renders | Cloudflare's; no effect on API | **shares the API's single vCPU** with requests + background jobs | its own | **shares the single vCPU** |
| Crawl spike impact on users | none on the API (edge cache absorbs most) | bots slow the API for everyone | isolated | bots slow the API for everyone |
| Data access | HTTPS to API | in-process (fastest; could skip HTTP) | HTTPS to API | localhost |
| Deploy coupling | frontend deploys alone | **frontend release = backend release**; frontend build inside backend image | frontend deploys alone | Lightsail deploys all containers together |
| Failure blast radius | SSR down → fall back to SPA shell | API down → site and API both down | isolated | API down → both down |
| Render limits | Free: 10 ms CPU (MUI pages need 25–50 ms warm) → Workers Paid; 1 s startup, 128 MB memory, 64 MiB bundle | none | none | none |
| Edge caching | built in | Cloudflare cache rule needed | Cloudflare cache rule needed | Cloudflare cache rule needed |
| Bridge reuse | bridge grows into it | bridge thrown away | bridge thrown away | bridge thrown away |

**Decision (2026-10-24): A, the Cloudflare Worker.** C stays the fallback if Worker CPU/startup limits bite in Phase 4.

**Assessment:** B and D put render CPU on the same 1 vCPU that serves the API and runs the background jobs, so a crawler burst degrades the product for logged-in users. They also couple frontend and backend releases. C is the clean "no CPU caps" alternative if the render-cost spike shows MUI pages are too heavy for Workers. A remains the default because it isolates crawl load, caches at the edge, and evolves from the bridge. Pending: render-cost spike results (validation in progress).

## 1c. Decided: one anonymous SSR render for everyone, personal UI on the client

SSR only produces the first page of a visit; every later click is client-side. Public routes are server-rendered for **every** visitor, logged in or not, with the same anonymous HTML:

- **Cacheable:** the HTML never depends on who's asking, so it's edge-cached per page (+ game version for game data).
- **Fast for everyone:** logged-in users also get server-rendered content immediately; only personal chrome (avatar, cart, notifications, org switcher) appears after hydration.
- **Correct hydration:** auth-dependent components read `useSession()`, which is `"unknown"` on the server and during hydration, so they render a neutral placeholder in both and only switch after mount. No logged-out → logged-in mismatch.
- **One rendering path:** no hint cookie, no per-visitor routing, nothing to keep in sync.
- **No server-side auth:** auth cookies stay host-only on the API domain; the renderer never sees or forwards user credentials.

Rejected alternatives:
- *CSR for logged-in users (hint cookie):* two first-load paths to maintain, and slower first paint for the users who use the site most.
- *Personalized SSR:* would need the auth cookie on `.sc-market.space` and credential forwarding through the edge; nothing is cacheable and it adds security surface.
- *User-agent split (bots get SSR):* Google's "dynamic rendering" workaround; not recommended.

![Public route request flow](diagrams/9-csr-ssr-split.png)

## 2. Goals / non-goals

**Goals**
- Real HTML (content, `<title>`, meta/OG, JSON-LD, canonical) for public pages: `/market/:id`, `/market/aggregate/:id`, `/shops/:slug[/:tab]`, `/contractor/:id[/:tab]`, `/user/:username`, `/recruiting/post/:id`, `/wiki/**`, `/mining/**`, `/blueprints/**`, `/missions/**`, `/resources/**`, plus list/hub pages.
- Correct HTTP status for crawlers (404 for unknown listing, not 200 shell).
- Hreflang-ready: per-language crawlable URLs (`?lng=de`, see §3.5).
- Keep data fetching on generated RTK Query endpoints only. No manual endpoints, no parallel fetch layer.
- Keep Cloudflare invocation cost bounded: route-scoped only, never a root `_middleware`.

**Non-goals**
- SSR for authenticated or private routes (dashboard, orders, messaging, admin, settings). They stay SPA.
- Server-side auth/session.
- Changing the service worker. `src/sw.ts` stays push-only with no precache or fetch handler (it purges caches on activate). Nothing in this plan adds a precache.
- Next.js, RSC, MUI 6→9 upgrade.

## 3. Current state (checked in code)

### 3.1 Routing and entry
- `src/App.tsx` (1,300 lines): `createBrowserRouter` at L150, `RouterProvider` at L147. It has 165 `path:` entries and 154 `lazy:` routes, all wrapped in `retryDynamicImport`. No `loader`s and no v7 future flags. Nested relative children sit under `/org/:contractor_id` and `/shop/:shopSlug`, and the only splat is `/*` (L1291), so `v7_relativeSplatPath` is low risk.
- `src/index.tsx`: `createRoot`, `UnheadProvider` (client `createHead` with the titleTemplate), Bugsnag, the `vite:preloadError` handler, and `initPWA()` delayed by 2s.
- `index.html` holds the meta tags, font preloads, an inline stale-chunk guard `<script>` and inline `<style>`. In framework mode all of this moves into `root.tsx` `Layout`.
- `vite.config.ts` has a Beasties critical-CSS plugin implemented as `transformIndexHtml`. It won't run in framework mode (there is no `index.html`), and it becomes unnecessary once Emotion styles are SSR'd. It also uses VitePWA `injectManifest` with an empty manifest.
- `devDependencies` still contains `@types/react-router-dom@^5.3.3` (stale v5 types). Remove it in Phase 1.

### 3.2 Data layer (RTK Query)
- `src/store/store.ts` creates a **module-level singleton store** (L11) and, at import time, seeds `profileGetUserProfile` from localStorage (L31-41, `features/profile/profileCache.ts`).
- 3 API slices: `serviceApi`, `generatedApi`, `generatedApiV2`. All use `fetchBaseQuery({ credentials: "include" })` plus a 401→`refreshAuth()` retry. Codegen output in `src/store/api/**` is about 26k lines.
- 407 non-generated files call `use*Query` hooks. There are no route loaders anywhere.
- 19 files import the singleton from `store/store`, 14 of them as `{ store }` for direct `dispatch`. Examples: `App.tsx`, `HookProvider.tsx`, `useFeatureFlag.ts`, `profileApi.ts`, `optimisticUpdates.ts`, `reducerInjection.ts`. On the server these must use a per-request store.

### 3.3 Browser globals (module-level vs render-time matters)
Counts exclude tests: `window.` appears 148 times in 72 files (53 are `window.location`), localStorage/sessionStorage in 23 files, `document.` in 25, `navigator.` in 26. Most of it is inside effects or handlers and is harmless. What actually breaks SSR:

| Kind | Where | Effect on server |
|---|---|---|
| **Module-level** | `hooks/contractor/CustomDomain.ts:5` `const hostname = window.location.hostname` (imported by `HookProvider`, `Page.tsx`, `LandingPage`, sidebar, `WhiteLabelAuthGate`, …) | **Crashes at import.** This breaks even the Phase 2 SPA-mode build, because RR renders the root at build time. |
| Module-level (guarded) | `store/store.ts:31` `loadProfileCache()` (try/catch), `util/i18n.ts:164` (`typeof window` guard), `index.tsx:39` | Safe, but the profile seed causes a hydration mismatch (§3.4) |
| **Render-time, unguarded** | `pages/wiki/WikiItemBrowser.tsx:164-165`, `pages/blueprints/BlueprintBrowser.tsx:110` (`useState(() => localStorage…)`), `LoggedInRoute.tsx:36` (`window.location.href =` during render) | ReferenceError during SSR of game-data pages. `BlueprintDetailGate` renders `BlueprintBrowser` on "desktop", which is what the server picks. |
| Render-time, try/catch | `useFeatureFlag.ts:47-53`, `useViewMode.tsx:10-12`, `useDashboardConfig.ts:28-30`, `themeCache.ts:24-30`, `MobileBottomNav.tsx:205` | No crash. Server uses defaults, and the client gets a hydration mismatch (e.g. `nav_v2` in `Root.tsx:26`) |
| Media queries | `useMediaQuery` in 129 files, `noSsr` used nowhere. `HookProvider.tsx:53` resolves "system" theme via `prefers-color-scheme` | MUI default (`noSsr:false`) is hydration-safe but renders the `false` branch first. That means desktop layout and dark theme for "system" users, which causes a layout or theme flip. `BlueprintDetailGate` swaps page vs modal on this. |
| Socket | `MessagesBody.tsx:30`, `MessagesBodyMobile.tsx:1031` `io(...)` at module level | `autoConnect:false`, so safe |

Rough total: about 10 files need real changes for SSR safety, plus a lint rule (`no-restricted-globals` outside effects) to stop regressions. That's far fewer than the 72/23 raw counts suggest.

### 3.4 Auth, theme, flags, i18n on the server
- **Auth:** the session cookie is not visible to the frontend origin (see §1). SSR renders logged-out. On the client, the store seeds the cached profile before hydration (`store.ts:31`), so the first client render is logged-in and **mismatches** the server HTML. Fix: seed the cached profile after hydration (in an effect, or `onAllReady`), not at module import.
- **Theme:** the `theme` cookie (`react-cookie`, `HookProvider.tsx:52`) is a frontend-domain cookie, so the Worker can read it. Only `"system"` users need a client-side resolve.
- **Feature flags:** localStorage-first (`useFeatureFlag.ts`). The server should render anonymous defaults, and the client should apply the stored overrides after hydration.
- **i18n** (`util/i18n.ts:146-158`): a singleton `i18next` instance with `LanguageDetector`, 8 codes / 7 non-English bundles. The detector's default `caches` is `["localStorage"]`, so the server can't see the user's choice. Add `"cookie"` to caches, use `i18n.cloneInstance()` per request, and resolve the locale as `?lng` → `i18next` cookie → `Accept-Language`. `useLocaleMeta.ts` already defers hreflang "until the prerendering project".
- **White-label domains:** `CURRENT_CUSTOM_ORG` comes from `window.location.hostname`. On the server it comes from the request `Host`.

### 3.5 Hosting, crawl surface, API limits
- Cloudflare Pages, pure static. There's no `functions/` and no `wrangler.*`. `public/_redirects` sends `/* → /index.html 200` (memory notes say CF's implicit SPA fallback beats the `/assets/*` 404 rule). `public/_headers` sets `no-cache` only on `/index.html`, immutable on `/assets/*`, and `no-store` on `/sw.js`.
- The last local `dist/` has 1,038 files. Client JS is about 7.0 MB raw / 1.96 MB gzip across 528 assets, a rough proxy for SSR bundle size.
- The sitemap (`backend/src/services/sitemap/sitemap.service.ts` ~L200-240) caps game data at items 10k, ships 2k, missions 5k, blueprints 5k, resources 5k (×2 URLs: `/resources/` and `/wiki/commodities/`), manufacturers 500, ores 500. That's **up to ~33k game-data URLs**, before listings, shops, orgs and users.
- Anonymous API rate limit: **120 req/min per IP** (`backend/src/api/middleware/enhanced-ratelimiting.ts` ~L76-82, keyed on `req.ip`, `trust proxy 2`). Every SSR or prerender fetch is anonymous and comes from Cloudflare or CI egress IPs, so it will hit this limit.

## 4. Options compared

| | A. **RR framework mode (recommended)** | B. RR data-mode + hand-rolled SSR | C. Vike (+vike-react) | D. vite-react-ssg | E. Bridge: route-scoped CF Function injects head + summary (HTMLRewriter) | F. Next.js |
|---|---|---|---|---|---|---|
| Fit with current code | Same router and APIs. Route objects → `routes.ts` modules | Keeps `createBrowserRouter` route objects as-is (`createStaticHandler`) | Replaces router; filesystem routing, own data hooks | Peer dep **`react-router-dom ^6`** only, pre-1.0 (0.9.2) → dead end with RR v8 | No app change | Rewrite (router, data, head) |
| SSG + SSR + SPA fallback per route | Yes, built in (`ssr`, `prerender`, `__spa-fallback.html`) | DIY (manifest, prerender script, asset injection) | Yes | SSG only | Head + summary only | Yes |
| Cloudflare | First-party (`@cloudflare/vite-plugin`, Workers) | DIY Worker | Adapter | Static only | Route-scoped Pages Function | OpenNext adapter |
| Users get faster LCP too | Yes | Yes | Yes | Yes (SSG pages) | Slightly (correct head on first byte) | Yes |
| Duplicate render logic | None | None | None | None | Small: head/summary builders shared with the SPA (`answerContent.ts`); same HTML for humans and bots | None |
| Effort | ~4-6 wks total, phased | Similar, more bespoke code to own | 6-8 wks, high churn | Blocked | **~2-4 days** | Months |
| Verdict | **Go** | Fallback if routes.ts conversion proves too costly | No: router swap across 315 files for no gain over A | No | **Optional bridge** for Bing/AI/social now | Rejected (previous decision stands) |

Notes on E: HTML is served by CF Pages, not Express, so the bridge has to live at the edge: a Pages Function scoped by `_routes.json` (e.g. `/market/*`, `/shops/*`, `/wiki/*`). It runs on **every** document request to those prefixes, from humans too. Earlier drafts had Express render bot-only HTML; that was dropped. Express never serves HTML, and a bot-only template would drift from the UI. Instead the Function calls the existing JSON API and injects the head and summary into `index.html` for every visitor.

## 5. Phased plan

Estimates are focused dev-days for one senior dev. Every phase ships to `main` independently, and CF Pages "rollback deployment" is the instant rollback for all of them.

### Phase 1: v6.30 → v7.18 library mode (≈1.5-2 days)
- **Scope:**
  - Enable the v6 future flags (`v7_startTransition`, `v7_relativeSplatPath`, `v7_fetcherPersist`, `v7_normalizeFormMethod`, `v7_partialHydration`, `v7_skipActionErrorRevalidation`) and fix warnings. Then bump to `react-router@7.18`.
  - Codemod `react-router-dom` → `react-router` / `react-router/dom` in 315 files, as v8 requires.
  - Bump React to ≥ 19.2.7. Remove `@types/react-router-dom`.
  - Check the CF Pages build image runs Node ≥ 22.22 (local is 22.23.2).
- **Risks:** `startTransition` changes Suspense timing around `RouteSuspense` and lazy routes. Relative links in nested `/org/:id/*` and `/shop/:slug/*` children.
- **Verify:** `npm run check`, `npm test`, a manual click-through of nested org and shop tabs and a stale-chunk reload (delete a chunk in a preview deploy).
- **Rollback:** revert one commit.

### Phase 2: framework mode, `ssr:false` SPA mode, RR v8 (≈5-8 days)
- **Scope:**
  - Add `react-router.config.ts` (`ssr:false`).
  - Add `app/root.tsx` `Layout`, porting `index.html` head, fonts, the inline guard script, and `<Meta/><Links/><Scripts/>`. `UnheadProvider` stays.
  - Add `entry.client.tsx`, porting `index.tsx`: Bugsnag, `vite:preloadError`, PWA init. Wire `onRecoverableError` → Bugsnag so hydration errors are visible.
  - Convert 154 lazy route objects into `routes.ts` with route modules. Many routes point to named exports of shared files (e.g. `MarketRouter.tsx` gates), so this needs ~100 thin default-export wrappers. Generate them with a script.
  - Fix `CustomDomain.ts:5`, which is required because the SPA-mode build renders the root on Node.
  - Move `sw.ts` to its own small build step (or keep VitePWA if it cooperates with RR's `build/client` output). Ship the web manifest statically. **No precache, no fetch handler**: add a CI grep for `precacheAndRoute(` with a non-empty manifest or `registerRoute`.
  - Drop the Beasties plugin.
  - Re-check `retryDynamicImport` and the reload guard against RR's own route-module loading.
- **Risks:** this is the biggest diff (route table + entry). Stale-chunk recovery semantics change. `vite-plugin-pwa` compatibility.
- **Verify:**
  - No behavior change: same HTML shell served for all paths.
  - Lighthouse and bundle diff are within noise.
  - Deploy a preview, navigate across 20 routes, force a stale chunk.
  - `curl -sI https://<preview>/assets/missing.js` behaves the same as today.
- **Rollback:** CF Pages rollback. Keep the branch-free history so one revert restores `index.html` and `App.tsx`.

**Phase 2 as built (branch `feat/rr-framework-mode`, React Router 7.18, not v8 yet):**
- `react-router.config.ts` (`ssr:false`, `appDirectory: "src"`), `src/root.tsx`, `src/entry.client.tsx`, `src/entry.server.tsx`. `npm run build` = `react-router build` + `scripts/build/finalize.ts` (lays `build/client` out as `dist/`, inlines the entry CSS, builds `sw.js`, checks the shell) + the asset carry-over. Pages settings unchanged.
- The `<head>` is NOT React: `src/document/document.html` (was `index.html`) is filled by `entry.server.tsx`, and React hydrates `<div id="root">` only. That keeps the bridge's HTMLRewriter edits (title/meta/JSON-LD) out of React's way; the bridge's summary carries `data-bridge-summary` and the client removes it before hydrating.
- Adding a route: an entry in `src/routes.ts`, a module under `src/routes/{pages,elements,layouts}` (a page module is `definePage("Name")`), and for a page an entry in `src/app/pages.ts` (its `import()`). Components route modules render come from `src/app/shell.ts`.
- Stale chunks: React Router's own route-module loader reloads on any failed import with no limit. It never runs here: every route module is bundled into the entry and registered with React Router before it starts (`src/routes/registerRouteModules.ts`). Page chunks load through `definePage` → `retryDynamicImport` (retry, 2 reloads / 120 s, then the error in place). The inline guard also covers React Router's inline bootstrap script.
- The import()s live in `src/app/pages.ts`, not in the route modules: React Router makes every route module a build entry, and chunks imported from there split the app shell into ~200 shared chunks.
- Service worker: built on its own, no workbox; build + CI fail on any precache/route/fetch handler.

### Phase 3: prerender hub pages and a bounded game-data set (≈4-6 days incl. backend ask)
- **Decision: prerender hubs only.** "Prerender all game-data pages" doesn't fit:
  - The live sitemap has ~15.5k game-data URLs (items capped at 10k of 11,555), ×2 files (`.html` + `.data` for routes with a server loader), ×N per locale, against 20k files per site on Free (100k on paid) and a 20-minute Pages build timeout.
  - Every game patch invalidates all of them, and item pages show live listings/prices that go stale immediately.
  - Five detail routes (ships, ores, mining locations, blueprints, missions) render "browser + modal" on desktop, so their prerendered HTML would have no entity content until the gates are fixed.
  - Instead: detail pages are rendered on demand in Phase 4 and cached keyed by page + game version.
  - (The old "10+ hours at 120 req/min" figure was wrong: v2 game-data endpoints have no rate limit today. Origin capacity, one 1-vCPU box, is the real constraint.)
- **Scope:**
  - `ssr:false` + `prerender`: the ~25 static sitemap routes (`/market`, `/shops`, `/wiki/*` lists, `/mining`, `/blueprints`, …), plus bounded sets that fit a file budget (e.g. ships ≤2k, manufacturers, ores, mining locations). Re-run on game-patch import.
  - Everything else uses `__spa-fallback.html` (update `_redirects`).
  - Data comes from loaders that `await store.dispatch(api.endpoints.X.initiate(args))` on a **per-request store** (generated endpoints only). They return `dehydrate(state[reducerPath])`. The client store rehydrates via `extractRehydrationInfo` on all 3 slices.
  - Only dehydrate the static game data. Keep live parts client-fetched, e.g. `WikiItemDetail`'s `useSearchListingsQuery` and `useGetItemShopsQuery` (L60-70). Otherwise `keepUnusedDataFor:600` shows stale listings.
  - Fix the render-time localStorage reads in §3.3.
  - Add `_headers` `Cache-Control: no-cache` for prerendered `/*.html` (today only `/index.html` has it). Without it, a stale prerendered page could reference deleted chunks, which is the same failure class as the old SW.
  - **Backend asks:** a bulk export endpoint per entity, or a rate-limit-exempt build token header.
- **Risks:** build time. File limit. Unhead and Emotion style extraction must work at prerender time (same work as Phase 4, see below).
- **Verify:** `curl -s -A "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)" https://sc-market.space/wiki/ships/<slug>` contains the ship name in `<h1>`, `<title>…SC Market`, `og:title`, and `application/ld+json`. Repeat with `ClaudeBot`, `Bingbot`, `Discordbot`, and test a Discord link preview. Check Search Console / Bing Webmaster "URL inspection" rendered HTML.
- **Rollback:** remove paths from `prerender`, so they fall back to the SPA.

**Phase 3 as built (branch `feat/rr-prerender`; per-page details in `docs/prerender.md`):**
- Prerendered: `/`, the game-data hubs (`/wiki`, its 6 lists, `/mining`, `/mining/locations`, `/resources`), `/guides` with every category and guide, and `/about`. No detail pages (Phase 4). `/blueprints` and `/missions` stay on the bridge until their cards are links. Hub cards are now real links (crawlable).
- No CF changes: still `ssr:false`, a static build plus the existing Pages Function. `_redirects` serves `__spa-fallback.html`; `_routes.json` excludes the prerendered paths (62 of 100 rules); `_headers` gets no-cache per page.
- Data: no loaders and no backend ask. The build renders each page on a fresh store with RTK Query's server-side hooks and waits for its queries (`entry.server.tsx`). Only the game-data endpoints in `PRERENDERABLE_ENDPOINTS` are shipped (JSON next to `#root`, `extractRehydrationInfo` on all 3 slices); everything live renders as loading and is fetched by the browser, so the homepage's live sections are skeletons in the HTML.
- Each prerendered route exports `loader = prerenderLoader` (returns null): without a server loader React Router reruns the `clientLoader` on hydration and swaps the page for the root `HydrateFallback`.
- Head: the bridge's builders (`src/server/bridgeHead.ts`), so prerendered and bridged pages get the same title/meta/JSON-LD.
- Emotion: styles are collected per render into `<head>` (`src/server/emotionStyles.ts`). Emotion's default inline mode loses the rules written during a render attempt that React retries, which left classes without CSS and shifted the page after hydration.
- Hydration waits for the page's chunk and guide body (`loadMatchedPages`, `preloadContentBodies`): a part of the page that suspends while hydrating is replaced by its skeleton as soon as anything above it updates.
- Responsive markup: layout differences between mobile and desktop are CSS (`sx` breakpoints); the persistent drawer and desktop-only header controls are hidden by CSS on small screens until hydration. Signed-in UI is added after hydration in fixed-size slots.
- Render-fresh fallback: white-label domains, the light theme and non-English visitors render from scratch (`createRoot`) instead of hydrating; `document.html` keeps the prerendered HTML hidden for them until the first render. Removing this needs the theme as CSS variables and build-time translations.
- Measured locally (dev build, 390 and 1440: the homepage, every hub, /guides, a category, a guide and /about; the guide also with a cold cache): CLS 0, no hydration warnings.

### Phase 4: runtime SSR for listings/shops/orgs/users and the game-data long tail (≈8-12 days)
- **Scope:**
  - Move to Workers + `@cloudflare/vite-plugin`. Workers static assets with `run_worker_first` limited to the public prefixes, or Pages with a `_routes.json` include list. Never a catch-all.
  - Make `makeStore()` per request and refactor the 14 direct `store` importers to `useDispatch` / `useStore`.
  - Emotion: per-request `createCache` + `@emotion/server` critical extraction.
  - Unhead: `@unhead/react/server` → `transformHtmlTemplate` / `renderSSRHead` (the package already ships the `server` and `stream/server` exports).
  - **Turn off Cloudflare Rocket Loader** on the zone before SSR ships (it's on today). It rewrites every `<script>` tag to defer it, which is known to break React hydration. Harmless for today's SPA and the bridge.
  - Emotion critical-CSS extraction only works with `renderToString`-style complete renders (emotion#2800 is open). Either wait for `allReady` for everyone and extract, or stream with Emotion's default inline `<style>` tags (measured: same CPU, similar HTML weight). On Workers the default entry uses `renderToReadableStream` + `await body.allReady` for bots.
  - If the RTK cache is serialized by hand, escape it (`JSON.stringify(state).replace(/</g, "\\u003c")`) to prevent `</script>` XSS.
  - i18n per request (§3.4) and hreflang alternates via `?lng=`.
  - Loaders throw `404` for missing entities.
  - Each route has a `loader` plus a `clientLoader` that doesn't call `serverLoader`. Client-side navigations then keep using RTK hooks and never hit the Worker (no `.data` invocations).
  - Edge-cache game-data HTML keyed by LIVE game version (Cache API, long TTL). Entity pages get short `s-maxage` + SWR.
  - Backend: a **non-user service identity** for the renderer, so responses stay anonymous (existing `scm_` tokens log in as a user and personalize responses). Use an established mechanism rather than a home-made shared secret, e.g. Cloudflare Access service tokens / mTLS from the Worker to the API, or a dedicated non-user principal in the existing token system. The bridge doesn't need one: v2 has no limiter and v1 is limited per visitor IP. Coordinate with the planned v2 rate-limit floor (`RATE_LIMITING_PLAN.md` H2; v2 has no limiter today). Same-zone Worker subrequests carry the visitor's IP in `CF-Connecting-IP`.
  - Loaders must map v1's 400 for unknown contractors/users to 404 (or fix the backend).
- **Cost (measured):** a realistic MUI page with the real theme takes ~10 ms CPU in local workerd on an M3 Pro, projecting to **25–50 ms warm, 100 ms+ on a cold isolate, 2–2.5× for big listing pages** on Workers. That exceeds Free's 10 ms cap, so **Paid ($5/mo) is required**: 10M requests and 30M CPU-ms included, overage $0.30/M requests and $0.02/M CPU-ms. 1M renders/month at 30 ms fits the included CPU. Bundle: ~2.0 MiB gzip minified (limit is 64 MiB uncompressed since 2026-09-04); the real constraint is **1 s startup** because RR imports every route module at boot (check with `wrangler check startup`). Static assets stay free.
- **Risks:**
  - Hydration mismatches: profile seed, feature flags, theme "system", `useMediaQuery` gates. Watch React 19 recoverable errors in Bugsnag.
  - Worker CPU spikes on huge listing pages.
  - API load from bots crawling 30k+ URLs. Mitigate with edge cache and the crawl-delay in robots.
- **Verify:**
  - The same curl matrix (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Bingbot, Twitterbot) on `/market/<slug>`, `/shops/<slug>`, `/contractor/<sid>`.
  - `curl -o /dev/null -w "%{http_code}" -A GPTBot …/market/does-not-exist` → `404`.
  - `?lng=de` returns German HTML with `<html lang="de">`.
  - A human UA with the `theme=light` cookie gets the light theme with no flash.
  - Zero hydration errors in Bugsnag over 48h.
  - CF analytics: Worker invocations only on the included prefixes.
- **Rollback:** remove a prefix from `run_worker_first` / `_routes.json`, so it falls back to SPA. A full rollback goes back to the Phase 3 static build.

**Total:** ~26–40 dev-days after validation (Phase 1: 1.5–3, Phase 2: 7–10, Phase 3: 2–4 hubs-only, Phase 4: 12–18, plus the pre-work refactors already in progress). The bridge (3–4 days) runs in parallel and is deleted as Phase 4 covers each prefix.

## 6. Open questions

1. **Bridge or not?** Ship Option E (route-scoped Function + HTMLRewriter, §1a) now for Bing/AI/social, or wait about 4-6 weeks for Phases 1-4?
2. **Cloudflare plan:** which plan is the account on? Phase 4 needs Workers Paid (10 ms CPU cap on Free), and the Pages file limit decides Phase 3's scope. Are you OK moving Pages → Workers static assets?
3. **Bot traffic volume:** do you have CF analytics for current bot document requests to `/market/*`, `/wiki/*`, etc.? That's the main input for the cost estimate.
4. **Backend:** OK to add (a) an SSR/build service token that's exempt from or has a higher anonymous rate limit, and (b) bulk export endpoints for game-data prerender? (Both would be TSOA-generated, so they stay inside the codegen-only rule.)
5. **Per-language URLs:** is `?lng=xx` acceptable as the canonical per-language URL for hreflang, or do you want `/de/...` path prefixes? Path prefixes would double the route table.
6. **Mobile vs desktop gates:** `BlueprintDetailGate` (and similar `useMediaQuery` page/modal swaps) needs one canonical SSR rendering. Should bots always get the full-page detail variant?
7. **Timing:** Phase 2 rewrites the route table and touches `App.tsx` and its 154 lazy routes, so it needs a merge window when no one else has large in-flight changes there.

## 7. Assumptions & validation (2026-10-23)

Five subagents checked this doc against primary sources (vendor docs, npm, the code, the live API, and a render-cost spike in `/tmp/ssr-spike`). Corrections are already applied above; this table records what changed.

| Area | Assumption in the original draft | Result |
|---|---|---|
| Crawlers | Bingbot doesn't run JS | **Wrong.** Googlebot and Bingbot render JS; AI crawlers and link-preview bots don't |
| React Router | v8.0.0 on 2026-06-17, latest 8.5.0; React ≥ 19.2.7, Node ≥ 22.22 | Confirmed. Vite ≥ 7 is framework-mode only; v8 is ESM-only |
| React Router | v6 → v7 flags → v8 | **Incomplete.** v7's `v8_*` flags must be adopted first; no official codemod |
| React Router | Prerender writes `.html` + `.data` per path | `.data` only for routes with a server loader; `__spa-fallback.html` only when `/` is prerendered |
| React Router | SPA mode renders only the root at build time | Once `prerender` is on, **every route module** is imported into the server build |
| Emotion | Per-request cache + extraction, streaming for humans | **Conflict.** Extraction needs a complete render (emotion#2800). Inline Emotion styles do stream, measured at the same CPU |
| PWA | Keep VitePWA if it cooperates | No official RR framework support (vite-plugin-pwa#809 open). Separate `sw.ts` build is the default |
| Cloudflare | Pages limit 20k files per deployment | **Per site:** 20k Free, 100k paid (needs `PAGES_WRANGLER_MAJOR_VERSION=4`) |
| Cloudflare | Build image runs Node ≥ 22.22 | **Wrong.** Default is 22.16; pin with `.node-version`/`NODE_VERSION` |
| Cloudflare | Worker bundle limit 10 MB compressed | **Out of date.** 64 MiB uncompressed since 2026-09-04; startup (1 s) and memory (128 MB) are the real limits |
| Cloudflare | Workers Free 10 ms CPU; Paid $5 with 10M req + 30M CPU-ms | Confirmed |
| Cloudflare | `@cloudflare/vite-plugin` covers SSR + prerender | **SSR only:** prerender and SPA mode aren't supported by the plugin |
| Cloudflare | Cache API for long-tail HTML | Works, but per data center; consider Workers Cache (tiered) and its billing |
| Cloudflare | (missed) | 20-minute build timeout; 50 subrequests per request on Free; `_headers`/`_redirects` don't apply to Function responses |
| Backend | 120 anon req/min limits every SSR fetch | **Wrong for v2:** v2 (game data, listings, shops) has no rate limit today. Same-zone Worker calls are keyed by the visitor IP |
| Backend | One session cookie | Four auth cookies, all host-only on the API domain |
| Backend | Service token = existing API token | **No:** `scm_` tokens log in as a user and personalize responses; SSR needs a non-user service identity via an established mechanism (not a home-made secret) |
| Backend | Unknown entities return 404 | v2 yes; **v1 returns 400** (contractors, users) |
| Backend | ~33k game-data URLs | Cap is 33k; **live is 15.5k** (items truncated at 10k of 11,555). Total sitemap ≈ 57.5k, users are the largest section |
| Backend | 2–3 queries per page | Item page 5; commodity 2; ship/ore/location/blueprint/mission render the browser on desktop |
| Backend | (missed) | No `Cache-Control` on game-data endpoints; anonymous shell fires `/api/profile` + `/api/v2/shops/mine` → 401 → refresh (~3 wasted calls per page today) |
| Frontend | ~10 files need SSR-safety changes | **~18**, including `useFeatureFlag.ts` (crashes every page: L53 outside the try), WhiteLabelAuthGate, WikiManufacturerList, MissionSearch, Sidebar, StandardPageLayout |
| Frontend | One desktop/mobile gate | **Five** detail gates render "browser + modal" on desktop → no entity content in server HTML |
| Frontend | 407 files use RTK hooks; 14 `{ store }` importers; ~100 route wrappers | 290 files; 12 runtime importers + `reducerInjection.ts`; ~45 wrappers + default exports, or ~130 generated |
| Frontend | Sockets are safe | Safe for SSR, but two live connections can happen today (existing bug, fixed on the side-effects branch) |
| Frontend | Theme cookie readable by the Worker | Yes, but `SameSite=Strict`: not sent on arrivals from Google/Discord, so first SSR hit uses the default theme |
| Performance | MUI render > 10 ms; ~50 ms | Confirmed: ~10 ms on M3 Pro locally → 25–50 ms warm, 100 ms+ cold on Workers |
| Performance | Bridge cost | 0.1–0.3 ms CPU per rewrite: fits Free |
| Estimates | 19–28 dev-days | **26–40 dev-days** |

**Outside sanity check (Google AI overview, not authoritative):** consistent with this plan. Two ideas kept: use `api.util.getRunningQueriesThunk()` in tests to assert the prefetch functions cover every first-render query; escape any hand-serialized state. Future option, not planned: MUI's Base UI with zero-runtime CSS would remove Emotion's runtime and the streaming limitation, but it's a full restyle.
