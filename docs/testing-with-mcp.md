# Testing SC Market with browser agents (chrome-devtools MCP) and Playwright

How agents and humans should drive the site in a browser: what to wait on,
how to select things, the rules for browser contexts and real data, and how to
run the Playwright suite.

## 1. Wait on the page-ready signal, never sleep

The main content area carries a standard ready signal:

```html
<main id="main-content" aria-busy="true" data-ready="false">
  <!-- loading -->
  <main id="main-content" aria-busy="false" data-ready="true">
    <!-- loaded  -->
  </main>
</main>
```

`data-ready="true"` means the current page's **primary data** has loaded and
its skeleton is gone, not merely that the page mounted. `aria-busy` always
flips together with it.

- **Background refetches don't flip it back.** Ready is latched per
  navigation: once the page is ready for a location, a refetch of data already
  on screen (polling, cache invalidation, window focus) never makes it busy
  again.
- **Every navigation resets it.** A new URL (path, search params or hash; a
  `replace` navigation counts too) is busy until the new page settles. The
  market's auto-applied search updates the URL, so after typing a query you
  can wait for ready again and the results are the new ones.
- **The skeleton shows while busy.** The route skeleton, lazy-chunk Suspense
  fallbacks, and the layouts' `isLoading` skeletons all report busy.
- A page that renders nothing (for example an org-only route with no current
  org) stays busy. If a page never becomes ready, that is a bug worth
  reporting.

### Waiting with the chrome-devtools MCP

```
navigate_page    pageId=<yours> url=https://sc-market.space/market
evaluate_script  pageId=<yours> function=() => document.querySelector("#main-content")?.dataset.ready === "true"
```

Poll `evaluate_script` until it returns `true`, then call `take_snapshot`.
After clicking a link, check the URL changed, then wait for ready again.
The signal goes busy in the same task as the URL change (it follows the
router, not just React's render), so a new URL never reads "ready" with the
old page's content.

### Waiting in Playwright

```ts
import { waitForReady } from "../support/test"

await page.goto("/market")
await waitForReady(page) // main[data-ready="true"] and aria-busy="false"

await page.getByRole("link", { name: "Buying", exact: true }).click()
await expect(page).toHaveURL(/\/guides\/buying$/) // URL first...
await waitForReady(page) // ...then ready
```

Never use `waitForTimeout` or fixed sleeps.

### Wiring a page into the signal (developers)

The signal is central (`src/components/metadata/PageReady.tsx`, logic in
`pageReadyStore.ts`); pages only report their primary loading state:

- **Layouts:** `StandardPageLayout`, `DetailPageLayout`, `FormPageLayout`,
  `SidebarPageLayout` and `BannerPageLayout` forward `isLoading` to it. If a
  page already passes `isLoading` + `skeleton`, it's done.
- **`<Page loading={...}>`** for pages that use `Page` directly.
- **`usePageReady(loading)`** in a section that loads on its own (a results
  grid under a static header, a list on the dashboard). A page is ready when
  every registered source has finished.
- **`<PageBusy />`** in the Suspense fallback of a primary lazy section:
  `fallback={<><PageBusy /><ResultsSkeleton /></>}`.
- Pass `isPrimaryLoading(queryResult)` (`pageReadyStore.ts`) rather than plain
  `isLoading` when the query arguments can change while mounted (search,
  filters, paging): it also counts "fetching new arguments with nothing to
  show yet" as loading, but not a background refetch.
- A page with no primary data is ready on mount; nothing to do.

The route regression snapshots record the signal per route (`pageReady`), so a
page that stops becoming ready shows up there.

## 2. Selecting elements

The MCP a11y snapshot (`take_snapshot`) and Playwright's `getByRole` both work
from the **accessibility tree**: role + accessible name. Select by those
first; they're also what screen-reader users get.

**Convention, in order of preference:**

1. **Role + accessible name**, e.g. `button "Add Fixture Laser Rifle to cart"`,
   `combobox "Item Type"`, `navigation "Settings sections"`,
   `dialog "Add to Cart"`.
2. **Labelled landmarks/regions to scope** repeated controls:
   `navigation "All guides"`, `main "Main content"`, a dialog's name.
3. **`data-testid` only where a name can't be unique**: repeated cards and
   rows. Use a kebab-case noun for the thing (`listing-card`, `cart-item`)
   plus `data-id` with the entity id:

   ```tsx
   <Box data-testid="listing-card" data-id={listing.listing_id}>
   ```

   ```ts
   page
     .getByTestId("listing-card")
     .filter({ has: page.locator('[data-id="…"]') })
   page.locator('[data-testid="listing-card"][data-id="…"]')
   ```

   Never put a test id on something that can have a good accessible name
   instead, and never select on MUI class names (`css-…` hashes change on
   every style edit).

**Naming rules for developers:**

- Every interactive control needs an accessible name:
  - Icon-only `IconButton`/`Fab`/`ToggleButton`: `aria-label` (a `Tooltip`
    with a string `title` also names it).
  - `TextField`: `label` (or `aria-label` / `inputProps` when there's no
    visible label).
  - MUI `Select` outside a `TextField`: `labelId` pointing at its
    `InputLabel` id, or `aria-label`.
  - `Checkbox`/`Switch`/`Radio`/`Slider`: inside a `FormControlLabel`, or
    `inputProps={{ "aria-label": ... }}`.
- Names on repeated controls include what they act on: "Remove {title} from
  cart", not five "Remove" buttons.
- Translate names with `t()` like any visible text.
- Name the regions agents scope to (`<nav aria-label>`, dialogs with a title
  or `aria-label`).

### Coverage guards

Two checks keep names from regressing; both run in CI (informational) and
locally:

- **Static scan** `npx tsx scripts/a11y-names-scan.ts`: every control in
  `src/**/*.tsx` whose JSX gives it no name (heuristic). `--check` fails when
  a file has more findings than `scripts/a11y-names-baseline.json` allows;
  `--update` rewrites the baseline after you fix some. `--list` prints them.
- **Runtime audit** (Playwright project `a11y`, `e2e/a11y/names.spec.ts`):
  loads every route of the app with the fake API and runs axe-core's name
  rules (`button-name`, `link-name`, `label`, `select-name`,
  `aria-input-field-name`, `aria-toggle-field-name`, ...). A route fails
  when it has more violations than `e2e/a11y-baseline.json` allows.
  `npm run e2e:a11y:report` prints totals per area. To lower the baseline
  after a fix: `A11Y_UPDATE_BASELINE=1 npm run e2e:a11y && npx tsx e2e/a11y/report.ts --update-baseline`.

## 3. Browser rules for agents (chrome-devtools MCP)

These protect the owner's real browser session and real users.

- **Logged out:** use the one shared isolated context named **`shared-anon`**.
  Open pages in it with `new_page` and `isolatedContext: "shared-anon"`.
  Reuse it; don't create other isolated contexts.
- **Logged in:** use the owner's existing logged-in context. Find it with
  `list_pages`: the context of the owner's open, logged-in sc-market.space
  tabs (shown as `isolatedContext=<name>` after the URL, or none for the
  default context). Open a new tab in that same context with `new_page`,
  passing that `isolatedContext` name (or none for the default context).
  Check the tab is logged in (navbar avatar "Account menu", no "Sign in").
- **New tabs are fine; NEVER open new windows or new browser contexts.**
- **Close every tab you opened** with `close_page` when you're done. Leave the
  owner's own tabs alone.
- Use `select_page` before acting, and check with `list_pages` that you're on
  your tab.

## 4. Don't touch real data

Production is real users' marketplace.

- **Read-only on prod.** Don't create listings, buy orders, offers, orders,
  reviews, messages, comments, recruiting posts, shops, orgs or anything else
  other users can see, and don't edit or delete existing ones.
- **Don't notify anyone.** No messages, offers, invites, mentions, reports,
  webhook/Discord tests, or anything that sends a notification or email.
- Don't change the owner's settings, notification preferences, 2FA, API
  tokens or linked accounts. Opening a settings tab to look is fine; saving
  is not.
- Adding to and removing from the owner's **own cart** is only acceptable if
  you remove what you added and nothing else changes; prefer the Playwright
  suite (fake API) for that flow.
- To test a write flow, use the Playwright suite against the fake API.

## 5. Playwright suite

`e2e/` holds read-only smoke flows and the accessible-name audit. They run
against a local **production build** (`vite build` + `vite preview` on
127.0.0.1) with the API **faked at the network layer**
(`e2e/support/fakeApi.ts`, built on the route regression harness fixtures in
`src/router/__tests__/regression/fixtures.ts`).

- The e2e build points the API at the app's own origin, and the fake answers
  every API request inside the test process. Requests to any other origin
  (analytics, CDN, fonts) are aborted. **Nothing reaches production**, and
  writes (cart add/remove) only touch an in-memory fake.
- The browser opens `http://localhost:4173`, mapped to 127.0.0.1: the app
  treats `localhost` as the main site, while any other hostname (including
  `127.0.0.1`) is a white-label custom domain.

Run locally:

```bash
npx playwright install chromium     # once
npm run e2e:build                   # → dist-e2e/
npm run e2e -- --project=smoke      # starts vite preview itself
npm run e2e:a11y                    # runtime name audit
npm run e2e:a11y:report             # its summary
npx playwright show-report          # after a failure (traces kept)
```

Writing tests: import `test`, `expect`, `main` and `waitForReady` from
`e2e/support/test.ts`; `test.use({ session: "user" })` for a logged-in fake
session (`anonymous`, `user`, `admin`, `unverified`, `not-onboarded`). Add
fixtures for new endpoints in `e2e/support/` (unknown endpoints are 404s and
are listed in `api.unhandled`).

CI: the **E2E smoke + a11y names** job in `.github/workflows/ci.yml` builds
the e2e bundle, runs both projects on Chromium (browsers cached) and writes the
audit and static-scan counts to the job summary. Like the type-check job it's
informational: Cloudflare Pages deploys don't wait for it.
