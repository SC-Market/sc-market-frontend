# Worker SSR (Phase 4)

Public entity pages are rendered at request time by a Cloudflare Pages
Function from the app's own server build. The rest of the site is unchanged:
the prerendered hubs stay static files, and every other path is the static
SPA shell. Design: `ssr-migration-design.md` §5, Phase 4. Prerendered pages:
`prerender.md`.

## What is server-rendered

| Path | Loader (`src/ssr/loaders.ts`) | 404 when |
| --- | --- | --- |
| `/market/<id>` | `prefetchListingPage` | v2 listing 404 |
| `/shops/<slug>[/<tab>]` | `prefetchShopPage` | v2 shop 404 |
| `/contractor/<id>[/<tab>]` | `prefetchOrgPage` | v1 contractor 400/404 |
| `/user/<name>[/<tab>]` | `prefetchUserProfilePage` | v1 user 400/404 |

Every other path on those prefixes (`/market`, `/shops`, aggregates,
bundles) and the other bridged prefixes keep the edge bridge
(`src/bridge/`). Game-data detail pages are the next step (they need the
`useMediaQuery` detail gates fixed first, see below).

## How it works

- **One Function, two renderers.** `functions/{market,shops,contractor,user}`
  re-export `src/ssr/pagesFunction.ts`. It decides (`ssrDecision`), renders,
  and falls back to the bridge (`src/bridge/pagesFunction.ts`) for
  everything it doesn't render. `public/_routes.json` is unchanged: hubs,
  `/assets/*`, `/content/*` and other static files never invoke a Function.
- **Same build as the prerender.** React Router's server build
  (`ssr: false`) is kept in `build/ssr` (`keepServerBuildPlugin`), built
  for workers (`workerSsrResolvePlugin`: `workerd`/`worker` conditions,
  `browser` field, no Node built-ins, code-split so startup only evaluates
  the core). Cloudflare Pages bundles it into the Function after
  `npm run build`. The Function imports it lazily (`src/ssr/serverBuild.ts`)
  and treats every SSR path as prerendered, so the browser gets exactly what
  a prerendered page gives it and hydrates it the same way
  (`entry.client.tsx`). No client changes.
- **Loaders.** Each entity route exports a `loader` (route placeholders in
  `prerender` make that legal with `ssr: false`:
  `src/ssr/routePlaceholders.ts`; `finalize.ts` deletes their files). The
  loader runs the page's prefetch function (generated endpoints only) on a
  per-request store. The route's `clientLoader` handles client navigations,
  so the browser never requests `.data` from the Function.
- **One render.** `src/ssr/render.tsx`: `renderToReadableStream` +
  `allReady` (complete HTML for everyone: it is cached and served to all,
  and Emotion's styles can only be collected from a complete render),
  per-request Emotion cache, head from the bridge's builders, the store's
  fulfilled queries shipped as JSON next to `#root`. Queries no loader
  started stay loading in the HTML and cost no API call
  (`apiFetch.freeze()`); they are logged (`ssr <path>: not prefetched`).
- **Anonymous.** The API is called with a fresh GET carrying only `Accept`
  (`src/ssr/apiFetch.ts`). Visitor cookies and headers are never forwarded.
  The public API is enough for these pages, so there is **no service
  identity** (the bridge works the same way today). Revisit if the API ever
  rate-limits the Function's calls.
- **Request context.** `src/ssr/protocol.ts` / `requestContext.tsx`: host,
  `lng`, `theme` cookie and URL from the request, for components that would
  read `window` during render. Today every visitor gets the default variant
  (main site, dark, English); light theme, other languages and white-label
  domains render from scratch in the browser exactly as on prerendered pages.

## Caching

- **HTML:** Cache API (`caches.default`, per data center), one entry per
  path and deploy (the build's asset version, `build/ssr/version.json`, is
  in the key, so a cache hit never loads the app). Visitors: fresh 60 s,
  then served for up to 600 s more while it re-renders in the background
  (`s-maxage=60, stale-while-revalidate=600`, stated in
  `CDN-Cache-Control`). Crawlers (`isCrawler`): any entry up to 24 h old,
  no re-render, so several crawlers on one URL cost one render a day.
  Concurrent misses of one path in an isolate share one render.
  Browsers get `Cache-Control: no-cache` as before (stale-chunk recovery).
- **API JSON:** Cache API per URL, 60 s, shared by the loaders and the head
  (its own key namespace: the bridge caches the same URLs differently).
- Response header `X-SCM-SSR: miss | hit | stale`; absent when the bridge
  answered (`X-SCM-Bridge` instead).

## Switches and rollback

| What | How | Takes effect |
| --- | --- | --- |
| Instant kill, all or some paths | Zone Transform Rule (Rules → Transform Rules → Modify Request Header) that sets `X-SCM-SSR-Off: 1`, filtered on the paths to switch off (custom domain only, not pages.dev) | Seconds, no deploy |
| Kill switch | Pages env var `SSR_ENABLED=false` (production: SSR is off unless it is `true`) | Next deployment ("Retry deployment", no code change) |
| Per page kind | Pages env var `SSR_KINDS=listing,shop` (omit kinds to roll them back) | Next deployment |
| Per prefix, permanent | Point `functions/<prefix>/[[path]].ts` back at `src/bridge/pagesFunction` | A commit |
| Everything | Pages → Deployments → Rollback to the previous deployment | Instant |

Failure modes all fail open: a render error, a timeout (2.5 s for loaders
plus render), an unexpected status, or a missing build serve the bridge's
page (which itself fails open to the plain shell). `passThroughOnException()`
serves the static shell if the Function dies (exception or CPU limit).

## Cost guards

- Only the four entity prefixes invoke SSR; hubs, assets and static files
  never invoke a Function (`_routes.json`, unchanged), and `.data` requests
  never render.
- Cache hits cost ~1-2 ms CPU and never load the app; only misses and
  background revalidations render. Crawlers reuse day-old HTML.
- Unknown entities answer from the bridge (its API 404 cache, 60 s).
- A 2.5 s deadline on loaders + render, then the bridge answers.
- CPU cap: on Pages, `limits.cpu_ms` can only come from a Wrangler file,
  and that file becomes the source of truth for the whole project's
  settings (env vars, compatibility date, bindings) for production and all
  previews. It is not added on this branch; see "Go-live" below.

## Go-live (owner)

1. Rocket Loader off (Speed → Optimization → Content Optimization).
2. Usage alerts: Notifications → Add → "Usage Based Billing" for Workers
   (requests and CPU time), e.g. at 8M requests and 25M CPU-ms a month.
3. Optional WAF rate limiting rule (Security → WAF → Rate limiting rules;
   Free includes one): `starts_with(http.request.uri.path, "/market/") or
   starts_with(http.request.uri.path, "/shops/") or
   starts_with(http.request.uri.path, "/contractor/") or
   starts_with(http.request.uri.path, "/user/")`, 60 requests per 10 s per
   IP, action Block or Managed Challenge for 10 s.
4. Prepare the instant kill switch (disabled): Rules → Transform Rules →
   Modify Request Header, "Set static" `X-SCM-SSR-Off` = `1`, expression as
   above (or a single prefix). Enable it to switch SSR off.
5. Optional CPU cap: add `wrangler.toml` with `pages_build_output_dir =
   "dist"`, the project's current compatibility date/flags and env vars
   (copied from the dashboard first: the file replaces them), and
   `[limits] cpu_ms = 500`. Warm renders measure 30-100 ms locally, a cold
   isolate's first render ~350 ms (x1.5-2.5 on Workers).
6. Turn it on: Pages → Settings → Variables (Production) `SSR_ENABLED=true`,
   then redeploy (Deployments → Retry deployment).
7. Watch: Workers & Pages → sc-market-frontend → Functions metrics
   (requests, CPU time median/p99, errors) and Real-time logs
   (`ssr fail-open`, `not prefetched`).

## Measured (local, Node 22 on Apple Silicon; Workers run ~1.5-2.5x slower)

| Page | Warm render CPU (median / max) | HTML |
| --- | --- | --- |
| Listing | 64 / 97 ms | 310 KB (35 KB gzip) |
| Shop (listings tab) | 30-62 / 46-91 ms | 230-430 KB |
| Shop (reviews tab) | 34 / 41 ms | 234 KB |
| Org | 44-55 / 66-100 ms | 263 KB |
| User | 34 / 64 ms | 186 KB |
| Unknown entity | 2 ms | (bridge 404) |

First render in a fresh isolate adds ~250-300 ms (evaluating the app).
`wrangler check startup --pages`: 13.9 ms active (bundle 15.5 MiB, 2.9 MiB
gzip). On the preview: misses 0.5-1.8 s to first byte (API calls), hits
70-100 ms.

## Cost (Workers Paid: $5 incl. 10M requests + 30M CPU-ms)

Assumes ~90 ms CPU per render on Workers (measured x1.7) and ~2 ms per hit.

| Entity page loads / month | Renders | CPU-ms | Monthly |
| --- | --- | --- | --- |
| 1M, 50% hits | 0.5M | 46M | $5.32 |
| 3M (the bridge's Free ceiling), 50% hits | 1.5M | 138M | $7.16 |
| + one aggressive crawler, every entity sitemap URL (~40k) daily | +1.2M | +108M | +$2.16 |
| Worst case: 10 such crawlers, no cache benefit | 12M | 1.1B | ~$27 |

Origin load is the bigger risk in the crawler rows (3-5 API calls per
render, edge-cached 60 s): use the WAF rule and robots crawl-delay.

## Not done yet

- Game-data detail pages (items, ships, ores, locations, blueprints,
  missions): one canonical server render for the five `useMediaQuery`
  detail gates, then Cache API keyed by path + LIVE game version.
- Visitor variants on the server: theme cookie (needs MUI CSS variables or a
  per-theme cache key), `i18n.cloneInstance()` per request with the
  locale's strings, `Host` for white-label shells.
- A background refetch of shipped live data after hydration (the HTML can be
  up to 11 minutes old).
- Delete the bridge's listing/shop/org/user kinds once SSR has run clean.
