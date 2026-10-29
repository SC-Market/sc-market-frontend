/**
 * Client entry (React Router framework mode, SPA: react-router.config.ts).
 * React Router's inline bootstrap script (<Scripts /> in root.tsx) loads the
 * route manifest and the root route, then imports this module.
 */
import React, { StrictMode, type ErrorInfo } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { HydratedRouter } from "react-router-dom"
import { createHead, UnheadProvider } from "@unhead/react/client"
import { Provider } from "react-redux"
import { setupListeners } from "@reduxjs/toolkit/query"
import { initPWA } from "./util/pwa"
import {
  initializeBugsnagAsync,
  getBugsnagErrorBoundary,
  isBugsnagInitialized,
  notifyBugsnag,
} from "./util/monitoring/bugsnagLoader"
import { clearEmergencyReloadBudget } from "./util/assetReloadGuard"
import { makeStore } from "./store/store"
import { browserNetworkEnv } from "./store/browserNetworkEnv"
import { seedCachedProfile } from "./features/profile/seedCachedProfile"
import { applyTitleTemplate } from "./seo/pageHead"
import { initLazyImagePlaceholders } from "./util/lazyImagePlaceholder"
import i18n, { initialLocaleReady } from "./util/i18n"
import { installLinkIntentPrefetch } from "./router/routePrefetch"
import {
  loadMatchedPages,
  registerRouteModules,
} from "./routes/registerRouteModules"
import { provideShell } from "./routes/shell"
import { shell } from "./app/shell"
import { providePages } from "./routes/definePage"
import { pages } from "./app/pages"
import { removeBridgeSummary } from "./document/bridgeSummary"
import { hasPageQuery } from "./document/pageQuery"
import { isMainSiteHostname } from "./util/mainSiteHost"
import { hydratePrerenderedData, takePrerenderedData } from "./store/hydration"
import { retryDynamicImport } from "./util/retryDynamicImport"
import { matchesMobile, prefetchFirstPageData } from "./router/firstPageData"
import {
  armStartupDeferral,
  whenStartupGateOpen,
} from "./util/startupDeferral"

// The entry chunk has loaded: from here on, chunk failures are handled by the
// app (retryDynamicImport), not by document.html's bootstrap guard.
window.__scmEntryStarted = true

// Failed dynamic import()s: there is deliberately NO vite:preloadError
// listener. Calling preventDefault() on that event makes Vite's preload helper
// resolve the failed import() to `undefined` instead of rejecting, so a page's
// `(await import(...)).Page` throws a TypeError, skipping the retry →
// reload → error page path in retryDynamicImport. A window-level "is a
// prefetch running?" check cannot tell which import failed: when the idle-time
// prefetch is in flight while a route chunk fails, it cancelled the ROUTE's
// error. Every prefetch path (routePrefetch, componentPrefetch, util/prefetch)
// already catches its own rejection, so letting Vite rethrow costs nothing.

// The root and the route modules render the app shell's components and load
// their pages by name (routes/shell.ts, routes/definePage.tsx); the shell and
// the page import()s are bundled here, with the entry.
provideShell(shell)
providePages(pages)

// All route modules are in this bundle; React Router must never import one
// itself (see routes/routeModules.ts).
registerRouteModules()

// The browser's single store. Browser-only side effects live here, not in
// makeStore(), so a server render can create clean per-request stores.
const store = makeStore({ networkEnv: browserNetworkEnv })

setupListeners(store.dispatch)

// A prerendered page (src/prerender/paths.ts) ships the game data its HTML
// was rendered with. Load it before anything else touches the store, and
// hydrate against exactly that state (Provider serverState): what this
// browser adds below (the cached profile, the session check) re-renders
// after hydration instead of mismatching the anonymous HTML.
const prerenderedData = takePrerenderedData()
if (prerenderedData) {
  store.dispatch(hydratePrerenderedData(prerenderedData.api))
}
const serverState = prerenderedData ? store.getState() : undefined

// Start the session check (GET /api/auth/session) before anything renders:
// the profile query and every auth-only query wait on its answer instead of
// probing with requests that 401 for anonymous visitors.
const sessionChecked = browserNetworkEnv.checkSession()

// Signed-in chrome (badges, chats, shops, push status) and the cached
// profile's refetch wait until the page has shown its content
// (util/startupDeferral.ts).
armStartupDeferral()

// Seed the profile from localStorage (no logged-out flash for returning
// users). Its refetch (which also waits for the session check) reconciles
// the copy once the startup gate opens.
void seedCachedProfile(store, undefined, whenStartupGateOpen())

// The page's own data starts now, in parallel with its chunk and the session
// check, not after the app's first commit (router/firstPageData.ts). After
// serverState above: the hydration render must see the prerendered state.
const pageData = prefetchFirstPageData(store, window.location, {
  isMobile: matchesMobile(),
  mainSite: isMainSiteHostname(window.location.hostname),
  session: sessionChecked,
})

// Before the first render, so the first images' load events are seen.
initLazyImagePlaceholders()

// Warm a link's route chunk when the visitor presses, focuses or hovers it.
installLinkIntentPrefetch()

// Unhead manages the document <head> (replaces react-helmet, which is
// unmaintained and unsafe under React 19 concurrent rendering). The global
// titleTemplate is the single source of truth for the " - SC Market" suffix.
//
// It is IDEMPOTENT: pages that set only a bare title (e.g. "Agricium") get the
// suffix appended → "Agricium - SC Market", while pages with a keyword-rich
// title that already contains the brand (e.g. "Aurora MR — Star Citizen Ship |
// SC Market") pass through untouched. This lets per-page <title> tags keep
// their SEO-optimized, front-loaded phrasing without double-appending the
// brand, while still guaranteeing every page ends in the brand name.
//
// Because this template owns the suffix, imperative writers must NOT append it
// themselves — see Page.tsx and src/hooks/router/usePageTitle.ts, which now set
// bare titles through Unhead (useHead) rather than writing document.title.
const head = createHead({
  init: [
    {
      titleTemplate: applyTitleTemplate,
    },
  ],
})

// Get error boundary (will use fallback if Bugsnag not loaded yet)
const ErrorBoundary = getBugsnagErrorBoundary(React)

// Hydration errors React recovered from (it re-rendered on the client).
// Bugsnag starts after the page is interactive, so earlier ones wait for it.
const pendingRecoverableErrors: Array<[unknown, ErrorInfo]> = []
function reportRecoverableError(error: unknown, errorInfo: ErrorInfo) {
  const err = error instanceof Error ? error : new Error(String(error))
  notifyBugsnag(err, {
    kind: "react-recoverable-error",
    componentStack: errorInfo.componentStack,
  })
}
function onRecoverableError(error: unknown, errorInfo: ErrorInfo) {
  // Visible in the console too (agents and tests look for it).
  console.warn("[hydration] recoverable error:", error)
  if (isBugsnagInitialized()) reportRecoverableError(error, errorInfo)
  else pendingRecoverableErrors.push([error, errorInfo])
}

// Initialize Bugsnag asynchronously (non-blocking)
// This happens after page is interactive to avoid blocking critical rendering
initializeBugsnagAsync(import.meta.env.VITE_BUGSNAG_API_KEY || "")
  .then(() => {
    for (const [error, info] of pendingRecoverableErrors.splice(0)) {
      reportRecoverableError(error, info)
    }
  })
  .catch((error) => {
    // Silently fail - error monitoring is not critical for app functionality
    if (import.meta.env.DEV) {
      console.warn("Bugsnag initialization failed (non-critical):", error)
    }
  })

const container = document.getElementById("root")!

// The edge bridge's crawler summary is not part of the React tree.
removeBridgeSummary(container)

const app = (
  <StrictMode>
    <Provider store={store} serverState={serverState}>
      <UnheadProvider head={head}>
        <ErrorBoundary>
          <HydratedRouter />
        </ErrorBoundary>
      </UnheadProvider>
    </Provider>
  </StrictMode>
)

// A prerendered page is the main site's, anonymous, in English and dark. On
// an org's white-label domain, in another language, in the light theme or
// with a filter in the URL (hasPageQuery) the app renders from scratch
// instead of hydrating it (document.html keeps it hidden until the root
// route's first effect).
const renderFresh = () =>
  container.hasAttribute("data-prerendered") &&
  (!isMainSiteHostname(window.location.hostname) ||
    hasPageQuery(window.location.search) ||
    !i18n.language.toLowerCase().startsWith("en") ||
    // Set by document.html's pre-theme script for the light theme.
    document.documentElement.getAttribute("data-pre-theme") === "light")

// A non-English visitor's first render waits (briefly, capped) for their
// locale's strings, so the page doesn't render English and then reflow; for
// English it resolves at once. See initialLocaleReady in util/i18n.ts.
//
// The first render waits for the current page's chunk (started right away,
// in parallel with the session check): a page that is still loading would
// suspend, so the app would first show the route skeleton and then mount the
// page (with its own loading state) in its place. The shell's
// HydrateFallback (the app frame, or the prerendered HTML) is on screen
// meanwhile.
const pageCode = loadMatchedPages(window.location.pathname)

// A prerendered page also waits for its guide body. Anything still loading
// while hydrating is replaced by its fallback (a skeleton) as soon as
// something above it updates, e.g. when the session check answers: the page
// would flash and shift.
// It also waits (capped) for the session check: its answer decides signed in
// or out, and a store update that lands while the first, long render is
// under way makes React render the whole app a second time (measured:
// +0.5-1 s at 4x CPU for signed-in visitors). The cached profile's refetch
// is not waited for: it is deferred until the page is ready (see above).
// For the same reason a page rendered from scratch (not hydrated) also waits,
// within the same cap, for its own first data (pageData above): it then
// renders its content straight away, without a skeleton pass and without
// the response restarting that first render. A hydrated page doesn't: it
// renders the prerendered state (serverState) and takes its data after.
const FIRST_RENDER_DATA_WAIT_MS = 1500
const firstRenderData = Promise.race([
  Promise.allSettled([sessionChecked, prerenderedData ? undefined : pageData]),
  new Promise<void>((resolve) =>
    window.setTimeout(resolve, FIRST_RENDER_DATA_WAIT_MS),
  ),
])

async function firstRenderCode(): Promise<void> {
  const bodies = prerenderedData?.contentBodies ?? []
  await Promise.allSettled([
    pageCode,
    firstRenderData,
    bodies.length > 0
      ? retryDynamicImport(() => import("./features/help/content")).then(
          (content) => content.preloadContentBodies(bodies),
        )
      : undefined,
  ])
}

void initialLocaleReady.then(async () => {
  if (renderFresh()) {
    container.replaceChildren()
    container.removeAttribute("data-prerendered")
    createRoot(container, { onRecoverableError }).render(app)
  } else {
    await firstRenderCode()
    hydrateRoot(container, app, { onRecoverableError })
  }
})

// Reset reload budget only after the shell has been stable long enough for lazy chunks
// to load — clearing on every boot caused infinite reload loops with stale index.html.
// If "load" already fired before this module ran (a script loader such as
// Cloudflare Rocket Loader can run the entry late, and React Router imports
// this module from a script), start the timer now.
{
  const clearLater = () => {
    window.setTimeout(() => clearEmergencyReloadBudget(), 20_000)
  }
  if (document.readyState === "complete") clearLater()
  else window.addEventListener("load", clearLater, { once: true })
}

// Initialize PWA features (service worker registration, online detection)
// Delay initialization significantly to ensure app is fully loaded and Redux is set up
// This is non-critical and won't block app startup
setTimeout(() => {
  try {
    initPWA()
  } catch (error) {
    // Silently fail - PWA is a progressive enhancement, not critical for app functionality
    if (import.meta.env.DEV) {
      console.warn("PWA initialization failed (non-critical):", error)
    }
  }
}, 2000) // Wait 2 seconds to ensure app is fully initialized
