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
| `/guides`, `/guides/<category>`, `/guides/<category>/<slug>`, `/about` | The whole guide (from `content/`) | — |

Personal UI (sign-in state, cart, notifications, theme and language
choices) is never in the HTML: every page is rendered anonymous, dark and
in English, and the browser adds the visitor's own UI after hydrating, in
slots that keep their size (no layout shift).

`/blueprints` and `/missions` stay on the bridge for now. Their cards and
list rows are real links (`inAppClick`: a plain click still opens the
modal), so a prerender has crawlable content, but:

- `/blueprints` hides unsourceable blueprints in the browser ("Hide
  Unsourceable", on by default), so the first page of 40 shows about 2 of
  them; the bridge links 50. It can be prerendered once
  `searchBlueprints` takes that filter server-side.
- `/missions` renders 40 mission links (measured; the bridge links 50,
  the other prerendered hubs ship 24). To prerender it: add it to
  `GAME_DATA_HUB_PATHS`, export `loader = prerenderLoader` from
  `src/routes/pages/MissionSearch.tsx`, add `"missions"` to
  `PRERENDERED_KINDS`, and exclude `"/missions"` in `public/_routes.json`
  (fewer Function invocations, not more). It adds 2 files
  (`missions.html`, ~350 KB / 36 KB gzip, and `missions.data`).

A URL with a query string that changes the page (`/missions?category=…`,
`/wiki/ships?q=…`; not `utm_*`, `fbclid`, `gclid`, `msclkid`, `ref`,
`lng`) gets the same prerendered file, rendered without it, so the app
renders it from scratch instead of hydrating (`src/document/pageQuery.ts`,
and document.html hides the HTML until then).

## How fresh it is

- **Game data** is a snapshot taken by the build. After a game-data
  import, the hubs show the previous patch's data until the next frontend
  deploy: the browser doesn't refetch the shipped data (searches, filters
  and other pages of a list are fetched live).
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
  from that, and writes the data next to `#root` as JSON.
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
  first render).
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
   (`sx` breakpoints) or wait for `useHydrated()`.

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

## Follow-up: refresh after a game-data import (needs owner setup)

After a game-data import the prerendered hubs keep the previous patch's
data until the next frontend deploy. Options, none built yet:

- **Cloudflare Pages deploy hook** (preferred): create a deploy hook for
  the production branch in the Pages project settings and have the
  backend's import job `POST` to it when an import finishes. A rebuild
  re-runs the prerender with the new data. Needs the owner to create the
  hook and store its URL as a backend secret; it counts against the
  monthly build quota (one build per import).
- **Scheduled rebuild**: a GitHub Actions cron calling the same hook (for
  example daily). Simpler, but up to a day stale and builds even when
  nothing changed.
- **Client refetch of shipped data** after hydration (no setup): the hubs
  would update in place when the data changed, at the cost of an extra
  request per visit and a possible content change after first paint; the
  crawler HTML would still be stale until a deploy.

