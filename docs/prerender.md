# Prerendered pages

Some public pages are rendered to HTML at build time (`react-router build`,
`prerender` in `react-router.config.ts`). Visitors and crawlers get the
page's content in the first response, and the browser hydrates it.
Everything else is still the SPA shell (`index.html`, with the edge
bridge's head and summary on the routes it knows).

The full design and its decisions are in `ssr-migration-design.md` (Phase 3).

## Which pages

| Page | In the HTML | Loaded in the browser |
| --- | --- | --- |
| `/` | Hero, h1, intents, all static copy | Latest listings, Wanted now, Top rated shops, the stats (skeletons in the HTML) |
| `/wiki` | The hub | — |
| `/wiki/items` | First page of items (`searchItems`) | Other pages, filters, searches |
| `/wiki/ships` | Ships (`getShips`) | — |
| `/wiki/commodities` | Commodities and categories | — |
| `/wiki/locations` | Locations | — |
| `/wiki/manufacturers` | Manufacturers | — |
| `/wiki/refinery` | Refining methods | — |
| `/mining`, `/mining/locations` | Ores / mining locations, the active game version | Filters |
| `/resources` | Resources and categories | Filters |
| `/blueprints` | First page of blueprints (`searchBlueprints` with `sourceable=true`: "Hide Unsourceable" is on by default, so 40 blueprint links), categories | Other pages, filters, searches; the list revalidates on mount (`refetchOnMountOrArgChange`, for `user_owns`) |
| `/missions` | First page of missions (`searchMissions`, events excluded: 40 mission links), game events | Other pages, filters, searches |
| `/missions/givers`, `/missions/factions`, `/missions/types`, `/missions/systems` | Every hub of the kind with its mission count (`getMissionHubs`) | — |
| `/missions/<kind>/<slug>` (one per hub, ~100) | The hub's intro, its first 100 missions, related hubs (`getMissionHub`) | `?page=N` (head and links from the bridge over the static file, like `/wiki/items`) |
| `/storefronts` | Page 1 of the verified orgs' storefront cards (`getStorefronts` with `storefrontsHubArgs()`: 24 cards, the same query the homepage's "Org storefronts" row reads its 6 from) | The list again on mount (`refetchOnMountOrArgChange`), `?page=N` and the `?field=` filter. `/storefronts` is not in `public/_routes.json` (no Function invocations), so `?page=N` gets this file and the SPA renders that page fresh, with its own canonical and rel prev/next (the bridge's `storefronts` page is paginated too, should the path ever be bridged) |
| `/guides`, `/guides/<category>`, `/guides/<category>/<slug>`, `/about` | The whole guide (from `content/`) | — |

Personal UI (sign-in state, cart, notifications, theme and language
choices) is never in the HTML: every page is rendered anonymous, dark and
in English, and the browser adds the visitor's own UI after hydrating, in
slots that keep their size (no layout shift).

`/blueprints` and `/missions` ship their first page. Their cards and list
rows are real links (`inAppClick`: a plain click still opens the modal).
The build renders them with the page's own default query args (the
blueprint list's `{ page: 1, pageSize: 40, sourceable: true }`, the
mission list's `{ excludeEvents: true, page: 1, pageSize: 40 }`, the same
args as `prefetchBlueprintPage`), so the browser's first render reads the
shipped cache entry and hydrates the same 40 links. Their detail pages
(`/blueprints/<name>`, `/missions/<code>`) stay on the bridge:
`public/_routes.json` excludes only the exact hub paths, and
`/blueprints/*` and `/missions/*` stay included. Each hub adds 2 files
(`blueprints.html`, ~430 KB / 41 KB gzip; `missions.html`, ~350 KB /
36 KB gzip; and their `.data`).

A URL with a query string that changes the page (`/missions?category=…`,
`/wiki/ships?q=…`; not `utm_*`, `fbclid`, `gclid`, `msclkid`, `ref`,
`lng`) gets the same prerendered file, rendered without it, so the app
renders it from scratch instead of hydrating (`src/document/pageQuery.ts`,
and document.html hides the HTML until then).

### Mission hubs

The hub pages are listed at build time from `GET /api/v2/game-data/missions/hubs`
(`src/prerender/missionHubPaths.node.ts`): a deploy prerenders every hub of
the active LIVE version (~105 pages with the indexes). On a Cloudflare
Pages build (`CF_PAGES=1`), an API that keeps failing fails the build (the
previous deployment stays live) rather than shipping without hub pages.
Without a real backend (`VITE_BACKEND_URL` unset or on localhost: local,
CI and E2E builds) no hub page is prerendered and nothing is fetched; any
other non-Pages build logs a failed fetch and goes on without hub pages. Each hub route also
has a placeholder path (`MISSION_HUB_ROUTE_PLACEHOLDERS`) so its `loader`
is legal when no hub is prerendered; `finalize.ts` deletes it. The
`_headers` rules use one splat per hub kind (Pages allows 100 rules).
`public/_routes.json` excludes the four index paths; the hub pages stay on
`/missions/*`, whose bridge passes the clean URL through to the static
file and serves `?page=N`. A hub path the build didn't prerender reaches
Pages' SPA fallback; the bridge (`PRERENDERED_DYNAMIC_KINDS`, handler.ts)
then looks the hub up in the API (edge-cached): a hub that appeared after
a game-data import gets the bridge's head and summary over the shell, an
unknown slug a 404 with noindex, and an API failure the plain shell.

## How fresh it is

- **Game data** is a snapshot taken by the build. After a game-data
  import, the hubs show the previous patch's data until the rebuild the
  import triggers (the deploy hook below, within 30 minutes plus the build)
  or the next frontend deploy: the browser doesn't refetch the shipped data
  (searches, filters and other pages of a list are fetched live).
- **Guides and About** are the `content/` markdown of the deployed commit.
- **Live data** (listings, buy orders, shops, prices, stats, anything
  per-user) is never shipped. The build renders it in its loading state
  and the browser fetches it, so a prerendered page never shows stale
  listings.

Only the endpoints in `PRERENDERABLE_ENDPOINTS`
(`src/server/prerenderData.ts`) are shipped with the page. A new endpoint
on a prerendered page is fetched in the browser until it is added there.

## How it works

- `src/entry.server.tsx` renders a page on a fresh store, waits for the
  queries the render starts (RTK Query's server-side hooks,
  `src/server/rtkQueryReactServer.ts`), and renders again until nothing new
  starts. It then keeps only the shippable data, renders the final HTML
  from that, and writes the data next to `#root` as JSON, with the guide
  bodies that final render showed (`RenderedContentBodies`, a fresh Set per
  render in `src/features/help/content.ts`).
- Four pages render at a time (`prerender.concurrency` in
  `react-router.config.ts`). Everything a render collects is its own (store,
  head, Emotion cache, guide bodies); nothing on the render path may keep
  per-page state in a module. Measured 2026-11-02 (local, real API): the
  prerender step went from 55 s to 22 s (the whole `react-router build`
  152 s to 116 s), with byte-identical pages and data files.
- The page's `<head>` (title, description, canonical, Open Graph, JSON-LD)
  comes from the bridge's builders (`src/server/bridgeHead.ts`), so a
  prerendered page and a bridged page get the same head.
- MUI/Emotion styles go into `<head>` (`src/server/emotionStyles.ts`), for
  the classes the HTML uses.
- `src/entry.client.tsx` loads the shipped data into the store, loads the
  page's chunk and guide body (`loadMatchedPages`, `preloadContentBodies`),
  and then hydrates. Hydrating before a part of the page has its code would
  make React throw that part away and show its skeleton.
- White-label domains, the light theme and other languages render from
  scratch instead of hydrating (`renderFresh` in `entry.client.tsx`;
  `document.html` hides the prerendered HTML for them until the app's
  first render). Server-rendered entity pages do get these variants
  (ssr-worker.md, "Variants"); prerendered files can't (below).
- `scripts/build/prerendered.ts` (run by `finalize.ts`) inlines the entry
  CSS, adds `Cache-Control: no-cache` for each page to `_headers`, and
  checks the bridge leaves every prerendered path alone.
- Files, laid out for Cloudflare Pages (`layOutForPages`): each page is
  `<path>.html` (`wiki/items.html`; `wiki/items/index.html` would be
  answered with a 308 to `/wiki/items/`), the homepage is `__home.html`
  (`public/_redirects` rewrites `/` to it), and `index.html` stays the SPA
  shell, which `/* /index.html 200` serves for every other path. That
  catch-all has to point at `index.html`: Pages serves existing files
  before it, but a catch-all to any other file is served for every path,
  assets included. The edge bridge fetches the shell as
  `__spa-fallback.html` (the same file).
- `public/_routes.json` excludes the prerendered hubs, `/`, `/guides` and
  `/about` from the Pages Function.

## Adding a page

1. Add its path to `src/prerender/paths.ts` (or, for content, it is picked
   up from `content/`).
2. Export `loader = prerenderLoader` from its route module
   (`src/routes/pages/<Name>.tsx`). Without it React Router reruns the
   route's `clientLoader` on hydration and replaces the page.
3. Add the endpoints whose data the page should ship to
   `PRERENDERABLE_ENDPOINTS`, only if that data does not go stale between
   deploys.
4. Exclude the path in `public/_routes.json` (exact path, not `/*`: the
   detail pages below it stay on the bridge), and mark its bridge kind in
   `PRERENDERED_KINDS` (`src/bridge/routes.ts`).
5. Check it at 390 px and 1440 px with a cold cache: no
   `[hydration] recoverable error` in the console and no layout shift
   after the first paint. Anything that differs between the server and the
   browser's first render (window size, cookies, storage) must be CSS
   (`sx` breakpoints) or wait for `useHydrated()`. Dates and numbers go
   through `util/format` (`useFormatters()`: the page's language, dates in
   UTC until hydrated), and "now" through `useNow()` (the render's time,
   shipped as `PrerenderedData.renderedAt`), never the browser's own
   locale, zone or clock (`toLocaleString()` with no locale is a lint
   error). HTML the parser rewrites breaks
   hydration too: no `<p>` or `<div>` inside a `<p>` (a `Typography`
   around block content needs `component="div"`).
   The first-screen card staging (`components/grid/firstScreen.tsx`,
   used by the market, services and shop grids) renders every card on the
   server and only the first screen in the browser's first render, so a
   grid that uses it must not be prerendered with data until it starts
   full when hydrating. The blueprint and mission grids don't use it.

## Known limits

- The light theme, other languages and white-label domains don't get the
  hydration speed-up: they render from scratch (the theme is not CSS
  variables yet, and translations aren't loaded at build time). What it
  would take, with static files only:
  - **Light theme:** one HTML for both themes, which needs MUI CSS theme
    variables (`cssVariables` + `colorSchemes`, the pre-theme script setting
    the scheme attribute before paint) and the 54 `palette.mode` reads in
    25 files moved to CSS. A second, light copy of each page doesn't work:
    Pages picks the file by path only, never by cookie.
  - **Other languages:** per-language files need per-language paths
    (`/de/wiki/...`); `?lng=` can't select a file. That's a route-table
    and hreflang decision (design doc §6 Q5), plus translations loaded at
    build time; files grow by the page count x 2 per language (today 7
    other languages: x8).
  - **White-label domains:** not possible statically. Every org host is
    served by the same deployment, Pages chooses files by path and not by
    `Host`, and the org's branding comes from the API at runtime. It needs
    the Worker (Phase 4) or a Function, which the Free plan's quota rules
    out. They stay on render-from-scratch.
- The HTML carries each page's MUI styles: about 30-50 KB gzip per page.
- The data passes call the API from the build machine, anonymously. If the
  API is down during a build, a page renders its loading state and the
  browser fetches the data (the build doesn't fail).

## Refresh after a game-data import

The backend POSTs a Cloudflare Pages deploy hook after every successful
game-data import (sc-market-backend
`src/services/game-data/pages-deploy-hook.ts`), so a rebuild re-runs the
prerender with the new patch's data:

- The hook URL is the backend's `CF_PAGES_DEPLOY_HOOK_URL` (a deploy hook
  for the production branch, Pages project settings → Builds → Deploy
  hooks). A secret: never logged, stripped from errors. Unset: imports
  don't rebuild (one warning at startup).
- At most one POST per 30 minutes: the first import after a quiet period
  triggers at once, later ones within 30 minutes are coalesced into one
  more POST at the end of the interval. Each POST is one build against the
  monthly build quota.
- A failed POST is logged and reported (Bugsnag); the import still
  succeeds. Admin › Game Data shows the last trigger, its result and any
  queued one (`GET /api/v2/admin/pages-deploy-hook`). The state is in the
  backend's memory, like the import jobs.

## Blueprint and mission detail pages (not prerendered)

`/blueprints/<name>` and `/missions/<code>` stay on the edge bridge, which
already answers crawlers with the page's title, description, canonical,
JSON-LD, h1, the detail text (rewards, giver, location, description,
ingredients) and its related links. Prerendering them was measured on
2026-11-02 and isn't reasonable on the Pages build:

| | Pages | Measured (local, Apple Silicon, real API) |
| --- | --- | --- |
| Today's prerender | ~230 pages | full build 3 min, 4,038 files |
| Blueprints (search API) | 1,471 | ~0.45 s per page, serial |
| Missions (search API, unique URL-safe codes) | ~3,030 | ~0.45 s per page, serial |
| Both | ~4,500 | +34 min serial (+12 min CPU at best), +9,000 files |

The prerender now renders 4 pages at a time (above), which overlaps the
API waits, but even fully overlapped the CPU alone is ~12 min locally
(Pages build machines are slower; the build limit is 20 min). Each page
also costs the API 2-3 requests per build.

If they are prerendered later (a subset, or a higher concurrency):
the detail gates render the standalone detail page on the server and keep
it when they hydrate (`useShowDetailPage`), but on desktop (`lg` and up) the
UX is the hub with the detail modal over it, which a static file can't
contain (the modal is a Portal, closed on the server). Those pages would
then have to render from scratch on desktop (`renderFresh` in
entry.client.tsx plus document.html's pre-paint check, like the light
theme) and hydrate only below `lg`, so neither viewport swaps the page
after the first paint. The kinds would go in `PRERENDERED_KINDS` and
`PRERENDERED_DYNAMIC_KINDS` (`src/bridge/routes.ts`) so a page the build
didn't make still gets the bridge, and `getBlueprintDetail` /
`getMissionDetail` in `PRERENDERABLE_ENDPOINTS`.
