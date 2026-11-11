# Worker SSR (Phase 4)

Public entity pages are rendered at request time by a Cloudflare Pages
Function from the app's own server build. The rest of the site is unchanged:
the prerendered hubs stay static files, and every other path is the static
SPA shell. Design: `ssr-migration-design.md` §5, Phase 4. Prerendered pages:
`prerender.md`.

## What is server-rendered

| Path                                                                                                                               | Loader (`src/ssr/loaders.ts`)            | Cache (fresh / stale / crawlers)                    |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `/market/<id>`, `/shops/<slug>[/<tab>]`, `/contractor/<id>[/<tab>]`, `/user/<name>[/<tab>]`                                        | the pages' `prefetchXPage`               | 60 s / 600 s / 24 h                                 |
| `/wiki/items/<id>`, `/wiki/commodities/<id>`                                                                                       | item / commodity prefetch + LIVE version | per game version: 10 min / 6 h / 24 h (live prices) |
| `/wiki/ships/<id>`, `/mining/ores/<name>`, `/mining/locations/<name>`, `/blueprints/<slug>`, `/missions/<slug>`, `/resources/<id>` | the detail query + LIVE version          | per game version: 6 h / 7 days / 7 days             |

Unknown entities (v2 404, v1 400/404), and pages the bridge's builders mark
gone (a sold or expired listing, an unknown tab: 404; a cancelled listing:
410), answer from the bridge: 404/410 + noindex. Another spelling of a page
whose canonical is its own URL (a bare listing UUID, a stale slug: the
bridge's `canonicalRedirect`) gets the same 301 as from the bridge, and a
trailing slash or a query that changes the page (`hasPageQuery`) is left
to the bridge (301 / robots noindex, `src/seo/queryIndexing.ts`). The
bridge summary's link lists (seller, related and similar pages: the
`related` lookups) are appended to `#root` as a `<nav data-bridge-summary>`
the browser removes before hydrating, so the HTML links everywhere the
bridge's page does. Everything else on those prefixes (hubs, aggregates, bundles, manufacturers)
keeps the bridge; the prerendered hubs never invoke a Function.

- **Detail gates** (ships, ores, mining locations, blueprints, missions):
  the server renders the standalone detail page, and a gate that hydrates
  server HTML keeps it (`useShowDetailPage`, decided at mount), so there is
  one canonical server render and no swap to browser + modal afterwards.
- **Variants** (the light theme, other languages, orgs' white-label
  hosts): see "Variants" below. Each is switched on separately
  (`SSR_VARIANTS`).
- **Live data:** after hydrating, the page refetches the live queries it
  shipped on a scratch store and writes successful answers into the page
  (`src/store/refreshShippedData.ts`); a failed refresh changes nothing.
- **Game items:** the "How to get <item>" section (player listings,
  missions, blueprints and ingredients, in-game shops, resource info) from
  `GET /api/v2/game-items/{id}/acquisition`, prefetched by the item loader;
  the bridge renders the same facts and links from the same helpers
  (`src/seo/itemAcquisition.ts`), so its head and link lists match.
- **Missions:** readable placeholders, disambiguated titles, a quotable
  summary, every tab panel in the HTML, giver/faction/reputation rows,
  chips, blueprint rewards, their crafted items, item rewards and
  prerequisites as `<a href>`, the freshness
  stamp ("Data from Star Citizen <build> LIVE, updated <date>, from game
  files") and JSON-LD `dateModified` (`src/seo/missionText.ts`, shared with
  the head and the bridge).

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
  `lng`, `theme`, URL and the resolved white-label org, for components that
  would read `window`, cookies or localStorage during render.

## Variants

The default page is the main site's, anonymous, dark and in English: what
crawlers and most visitors get, one cache entry per path. Three variants
can be rendered besides it, each behind `SSR_VARIANTS` (see "Switches"). A
visitor whose variant is switched off gets the default HTML, which the
browser renders from scratch instead of hydrating (as before: no mismatch,
just no hydration speed-up).

| Variant  | Read from                                                                                                                                                                                                                   | Rendered as                                                                                                                                                                                                                                                                                                                                           | Browser hydrates when                                                                                                                                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`  | `theme=light` cookie; or no theme cookie / `system` plus `scm_scheme=light` (the pre-theme script in `document.html` writes the OS scheme it saw, so the _next_ page can be light)                                          | The light theme (`useRequestContext().theme`, HookProvider)                                                                                                                                                                                                                                                                                           | The pre-theme script resolves the same scheme (`data-ssr-theme`)                                                                                                                                                                                                            |
| `locale` | `?lng`, then the `i18next` cookie (the detector caches the choice there, SameSite=Lax), then `Accept-Language` (the first visit: the most preferred tag we ship, as i18next picks from `navigator.languages`), else English | A per-request `i18n.cloneInstance` with the locale's strings; `<html lang>` set; renders run one at a time per isolate for the helpers that read the language outside React (`util/renderLanguage.ts`)                                                                                                                                                | `toSupportedLocale(i18n.language)` is the rendered one (`data-ssr-lng`). A visitor whose language is only in localStorage (older visits, before the cookie) differs and gets the page rendered from scratch; the detector writes the cookie then, so the next page hydrates |
| `host`   | The request's `Host`, when it isn't the main site: `GET /api/domain/:host`, then `GET /api/contractors/:sid/theme` (edge-cached 60 s, anonymous)                                                                            | The org's theme and branding: the custom-domain context, sidebar brand and settings (prefetched with the page), "<Org> — <page> · SC Market" titles. The resolved domain and theme ship with the page data (`whiteLabel`), and `entry.client` seeds the browser's domain and theme caches with them before the first render (`src/ssr/whiteLabel.ts`) | `data-ssr-host` is this host and its domain answer was seeded                                                                                                                                                                                                               |

Crawlers (`isCrawler`) always get the default theme and English, whatever
they send. The `host` variant applies to them too (it's the host, not the
visitor).

### Variants and SEO (decision)

- **Language is not in the URL.** There are no per-language URLs
  (`/de/...` or a canonical `?lng=`; design doc §6 Q5 is still open), so
  the indexed page is the English one: crawlers always get English, the
  canonical is the clean URL, and there is no `hreflang`. `?lng=de` is not
  a page query (`src/document/pageQuery.ts`): a crawler on it gets the
  English page with the clean canonical, never a German duplicate.
  The one exception is a guide with a published translation
  (content/STYLE.md, "Translations"): its `?lng=<locale>` is that
  translation's own page (the edge bridge serves it, with its own
  canonical, `<html lang>` and `hreflang` alternates), and only the
  languages that have one are listed. Missing or stale translations keep
  the rule above.
  Visitors get their language on the same URL (dynamic serving, `Vary:
Accept-Language, Cookie` on SSR answers). If per-language URLs are ever
  wanted, they are a route-table and sitemap change; this variant would
  then render them.
- **White-label hosts point at sc-market.space (owner decision,
  2026-11-10: search engines see one site, no duplicates).** A page
  rendered there is always the org's own (its org page, its shops, its
  listings): every other page answers a 302 to the same URL on
  sc-market.space (below). Its canonical, `og:url`, `twitter:url` and the
  JSON-LD's page URL are the main site's URL for the page (the builders use
  `VITE_FRONTEND_URL`; the white-label rules leave URLs alone), so the
  org's domain never competes with the main page. The titles (`<title>`,
  `og:title`, `twitter:title`) carry the org and SC Market,
  "<Org> — <page> · SC Market" (or "<Org> · SC Market"), and
  `og:site_name` / `twitter:domain` are the org's (`whiteLabelPageHead`,
  src/seo/pageHead.ts). The browser applies the same rules
  (`applyWhiteLabelHeadRules`, one function for both) to every head on the
  host through an Unhead plugin (src/seo/whiteLabelHeadPlugin.ts), so a
  page rendered from scratch there (the static `/` redirecting to the
  org's page, a static hub, client-side navigation) gets the same head,
  and a hydrated one keeps it. On a first visit the org is only known once
  the domain answer is in; the head is resolved again then
  (`onDomainOrgChange`, entry.client.tsx). The document drops SC Market's web-app manifest and uses the org theme's
  favicon (`whiteLabelDocument`, src/ssr/whiteLabel.ts). In-app links are
  relative, so they stay on the host.
- **Theme** never changes content, only colours.

### White-label hosts: limits and safety

- **Pages the host doesn't serve: 302.** With `host` on, a white-label
  request the Function sees for a page no org's domain serves
  (`isMainSiteOnlyPath`: users' profiles, game data and the wiki, the shop
  directory, aggregates) answers `302` to the same URL on sc-market.space
  before any lookup (`X-SCM-SSR: handoff`). Another org's page does too,
  after the domain lookup, and so does another seller's listing or shop:
  the page's own hand-off (WhiteLabelRouteGuard /
  `useWhiteLabelOwnerHandoff`) is reported by the render
  (`RequestContextValue.handoff`) and never cached. Pages that never
  invoke the Function (`/buyorders`, `/messages`, `/notifications`, ...)
  keep the browser's hand-off.
- **No robots.txt or sitemap of its own.** A white-label host serves the
  site's static `public/robots.txt` (crawling allowed, the same rules), whose
  only sitemap is `https://sc-market.space/sitemap.xml`; that sitemap lists
  the org's pages under sc-market.space, matching their canonicals. There is
  no per-host sitemap (`/sitemap.xml` on a white-label host is not proxied:
  `sitemapProxy.ts` answers on the main host only), and `/robots.txt` never
  invokes a Function.
- **Members-only and internal domains are noindex.** Their pages carry
  `<meta name="robots" content="noindex, nofollow">` (crawlers may fetch
  them, so they see it): in the browser's head on every page, the static `/`
  included, once the domain answer is in (`whiteLabelHeadPlugin`, `noindex`
  from `isPrivateWhiteLabel`), and on an SSR path the Function's fallback
  adds it to the shell with `X-Robots-Tag: noindex, nofollow`
  (`withPrivateRobots`). `whiteLabelPageHead` applies the same rule.
  Public storefronts and sc-market.space are unchanged.

- Only the SSR prefixes (`/market/<id>`, `/shops/*`, `/contractor/*`,
  `/user/*`, the game-data detail pages) are server-rendered on a
  white-label host. Its home page (`/`) and the hubs are static files
  (`public/_routes.json` excludes them, and Pages picks files by path, not
  host), so they keep rendering from scratch there; covering `/` would mean
  routing it through the Function (not on the Free plan's quota).
- Rendered only for a known host (the domain API answers it) whose org is a
  public storefront: a members-only (`require_membership`) or internal
  (`focus_mode: internal`) domain shows a sign-in gate, which stays the
  browser's (`X-SCM-SSR-Fallback: white-label: members only`). An unknown
  host or a failed lookup falls back too (`white-label: unknown host`,
  `white-label: domain 503`), and the static shell answers as before. Only
  plausible hostnames are looked up (no IPs, ports, single labels).
- Nothing about the visitor is involved: the render is anonymous (no
  cookies or credentials forwarded, GETs of public endpoints only), and no
  account, admin or other sensitive route is ever server-rendered, on any
  host. The custom-domain rules (drafts/custom-domain-isolation-design.md:
  the API's sensitive-route denylist and no admin from custom origins) are
  API-side and unchanged; the HTML of a white-label page is the public page
  every visitor of that host gets.

## Caching

- **HTML:** Cache API (`caches.default`, per data center), one entry per
  path (as requested, case included), variant and deploy (the build's
  asset version, `build/ssr/version.json`, is in the key, so a cache hit
  never loads the app). The variant part (`variantKey`) is empty for the
  default page and `~host=<host>~theme=light~lng=<lng>` otherwise, so a
  variant is never served to another variant's visitors. Visitors: fresh 60 s,
  then served for up to 600 s more while it re-renders in the background
  (`s-maxage=60, stale-while-revalidate=600`, stated in
  `CDN-Cache-Control`). Crawlers (`isCrawler`): any entry up to 24 h old,
  no re-render, so several crawlers on one URL cost one render a day.
  Concurrent misses of one path in an isolate share one render.
  Browsers get `Cache-Control: no-cache` as before (stale-chunk recovery).
- **API JSON:** Cache API per URL, 60 s, shared by the loaders and the head
  (its own key namespace: the bridge caches the same URLs differently).
- Response header `X-SCM-SSR: miss | hit | stale`; absent when the bridge
  answered (`X-SCM-Bridge` instead). When SSR would have rendered the path
  but the bridge answered, `X-SCM-SSR-Fallback` says why (`deadline`,
  `failed: primary 429`, `error`, `off (header)`, `kind off`, `query`,
  `trailing slash`, ...); paths SSR never renders (aggregates, bundles,
  hubs) carry neither header.
- Never cached: a render whose primary query failed for a reason other
  than "doesn't exist" (a 429, a 5xx, a timeout) fails open to the bridge
  (`failed: primary <status>`), so an error page is never stored as the
  page. A render whose other data failed the same way, or whose bridge head
  couldn't be built, is served but not cached (`X-SCM-SSR-Partial:
getPriceHistory(429), ...`; logged `ssr partial`). On a stale hit, such a
  background render leaves the cached page in place.
- The first request for a path in a data center is always a miss, and the
  `cache.put` lands a moment after the response (a request within ~1 s is
  another miss). One pass over a random sample of sitemap URLs therefore
  measures misses only; a second pass is the cache's hit rate.

## Switches and rollback

| What                            | How                                                                                                                                                                         | Takes effect                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Instant kill, all or some paths | Zone Transform Rule (Rules → Transform Rules → Modify Request Header) that sets `X-SCM-SSR-Off: 1`, filtered on the paths to switch off (custom domain only, not pages.dev) | Seconds, no deploy                                   |
| Kill switch                     | Pages env var `SSR_ENABLED=false` (production: SSR is off unless it is `true`)                                                                                              | Next deployment ("Retry deployment", no code change) |
| Per page kind                   | Pages env var `SSR_KINDS=listing,shop` (omit kinds to roll them back)                                                                                                       | Next deployment                                      |
| Per variant                     | Pages env var `SSR_VARIANTS=theme,locale,host` (any subset; `none` for none). Unset: all on previews and localhost, none in production                                      | Next deployment                                      |
| Per prefix, permanent           | Point `functions/<prefix>/[[path]].ts` back at `src/bridge/pagesFunction`                                                                                                   | A commit                                             |
| Everything                      | Pages → Deployments → Rollback to the previous deployment                                                                                                                   | Instant                                              |

Failure modes all fail open: a render error, a timeout (2.5 s for loaders
plus render), a failed primary query, an unexpected status, or a missing
build serve the bridge's page (which itself fails open to the plain shell).
Past the deadline the render keeps running under `waitUntil` and still
fills the cache, so the next request is a hit. Server renders never retry
an API call (`NetworkEnv.retry: false`): the base query's 3 retries with
backoff on a 5xx or a 1.5 s timeout would always outlast the deadline. `passThroughOnException()`
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

| Page                | Warm render CPU (median / max) | HTML                |
| ------------------- | ------------------------------ | ------------------- |
| Listing             | 64 / 97 ms                     | 310 KB (35 KB gzip) |
| Shop (listings tab) | 30-62 / 46-91 ms               | 230-430 KB          |
| Shop (reviews tab)  | 34 / 41 ms                     | 234 KB              |
| Org                 | 44-55 / 66-100 ms              | 263 KB              |
| User                | 34 / 64 ms                     | 186 KB              |
| Unknown entity      | 2 ms                           | (bridge 404)        |

First render in a fresh isolate adds ~250-300 ms (evaluating the app).
`wrangler check startup --pages`: 13.9 ms active (bundle 15.5 MiB, 2.9 MiB
gzip). On the preview: misses 0.5-1.8 s to first byte (API calls), hits
70-100 ms.

## Cost (Workers Paid: $5 incl. 10M requests + 30M CPU-ms)

Assumes ~90 ms CPU per render on Workers (measured x1.7) and ~2 ms per hit.

| Entity page loads / month                                       | Renders | CPU-ms | Monthly |
| --------------------------------------------------------------- | ------- | ------ | ------- |
| 1M, 50% hits                                                    | 0.5M    | 46M    | $5.32   |
| 3M (the bridge's Free ceiling), 50% hits                        | 1.5M    | 138M   | $7.16   |
| + one aggressive crawler, every entity sitemap URL (~40k) daily | +1.2M   | +108M  | +$2.16  |
| Worst case: 10 such crawlers, no cache benefit                  | 12M     | 1.1B   | ~$27    |

Origin load is the bigger risk in the crawler rows (3-5 API calls per
render, edge-cached 60 s): use the WAF rule and robots crawl-delay.

## Cost of variants

A variant adds renders, not requests: every visitor of an SSR path invokes
the Function once whichever variant they get. What changes is the hit
rate, since each variant fills its own cache entries.

- Crawlers (most of the render volume) always share the default entry.
- `theme` and `locale` split the visitors of a path across up to 2 x 8 = 16
  entries, but only the variants that actually visit get entries: a
  listing seen by one German visitor costs one extra render (~90 ms CPU)
  per 11 minutes at most (fresh 60 s + stale 600 s).
- `host`: one more set of entries per white-label host, plus two API
  lookups per render (domain, theme; edge-cached 60 s), and a domain lookup
  on every request to a white-label host (a cache hit, ~1 ms). It adds no
  invocations on the SSR prefixes (a white-label host already invoked the
  Function there, for the bridge's pass-through), and its 302s cost less
  than the pass-through did.
- Rough upper bound: if 30 % of SSR visitors are non-default and none of
  their pages is cached yet, renders grow by about 30 % of visitor misses;
  at the current levels (well under the 8M-request / 25M-CPU-ms alerts)
  that is a few million CPU-ms a month at most. Watch Functions CPU time
  after each `SSR_VARIANTS` step.
- Prerendered pages (hubs, home, guides) don't get variants: Pages picks a
  static file by path only, so a light, translated or org-branded copy
  can't be chosen by cookie or host (prerender.md, "Known limits").

## Not done yet

- Backend: the temporary CORS allowance for
  `https://ssr-phase4.sc-market-frontend.pages.dev` (the preview's own API
  calls fail CORS until then, so browser checks after hydration are
  limited there).
- Delete the bridge's page kinds that SSR now covers once it has run clean.
