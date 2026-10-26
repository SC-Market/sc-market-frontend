/**
 * Route regression harness: mounts the app's real route table (`routes` from
 * src/App.tsx) in a memory router inside the same providers src/index.tsx
 * uses (Redux store from makeStore with a test NetworkEnv, Unhead), and
 * records a stable, diffable description of what each route rendered.
 *
 * The route elements themselves bring HookProvider (theme, i18n locale,
 * CustomDomain, current org), Root (navbar/sidebar/main) and RouteSuspense,
 * exactly as in production — nothing in the tree is replaced.
 *
 * Built to prove the React Router 6 → 7 upgrade regression-free: the records
 * are snapshotted on RR 6 and must be identical (or diff only where expected)
 * after the bump.
 */
import React from "react"
import { act, render } from "@testing-library/react"
import { Provider } from "react-redux"
import {
  createMemoryRouter,
  matchRoutes,
  RouterProvider,
  type RouteObject,
} from "react-router-dom"
import { createHead, UnheadProvider } from "@unhead/react/client"
import { expect, vi } from "vitest"
import { makeStore } from "../../../store/store"
import type { NetworkEnv } from "../../../store/networkEnv"
import { applyTitleTemplate } from "../../../seo/pageHead"
import { LoggedInRoute } from "../../../components/router/LoggedInRoute"
import {
  createFakeApi,
  PARAM_VALUES,
  PATTERN_PARAM_OVERRIDES,
  type FakeApiRequest,
  type SessionKind,
} from "./fixtures"
import { takeRouteErrors } from "./instrument"

/**
 * Anonymous server-style env: no cookies, never refreshes. The session check
 * reports "unsupported" so the profile query still asks the fake API, which
 * decides the session per test (see SessionKind).
 */
export const testNetworkEnv: NetworkEnv = {
  credentials: "omit",
  headers: {},
  onUnauthorized: async () => false,
  checkSession: async () => "unsupported",
  onLoggedOut: () => {},
}

// ── Route table enumeration ────────────────────────────────────────────────

export interface RouteLeaf {
  /** Full path pattern, e.g. "/org/:contractor_id/manage/about". */
  pattern: string
  /** Labels of every route object from the root to this leaf. */
  chain: string[]
  /** Element/guard names wrapping this leaf (LoggedInRoute, OrgAdminRoute…). */
  guards: string[]
  index: boolean
  lazy: boolean
  /** Nearest route in the chain that declares an errorElement. */
  errorBoundaryAt: string | null
}

function elementName(element: React.ReactNode): string | null {
  if (!React.isValidElement(element)) return null
  const type = element.type
  if (typeof type === "string") return type
  if (typeof type === "function") return type.name || "Anonymous"
  return "Element"
}

export function routeLabel(route: RouteObject): string {
  if (route.index) return "(index)"
  if (route.path !== undefined) return route.path
  const name = elementName(route.element) ?? (route.lazy ? "lazy" : "?")
  return `(layout:${name})`
}

function joinPath(parent: string, child: string | undefined): string {
  if (child === undefined) return parent
  if (child.startsWith("/")) return child
  const base = parent.endsWith("/") ? parent.slice(0, -1) : parent
  return `${base}/${child}`
}

export function enumerateRoutes(routes: RouteObject[]): RouteLeaf[] {
  const leaves: RouteLeaf[] = []
  const walk = (
    list: RouteObject[],
    parentPath: string,
    chain: string[],
    guards: string[],
    errorBoundaryAt: string | null,
  ) => {
    for (const route of list) {
      const path = route.index ? parentPath : joinPath(parentPath, route.path)
      const label = routeLabel(route)
      const nextChain = [...chain, label]
      const name = elementName(route.element)
      const nextGuards = name && route.children ? [...guards, name] : guards
      const boundary = route.errorElement ? label : errorBoundaryAt
      if (route.children && route.children.length > 0) {
        walk(route.children, path, nextChain, nextGuards, boundary)
      } else {
        leaves.push({
          pattern: path || "/",
          chain: nextChain,
          guards: nextGuards,
          index: !!route.index,
          lazy: !!route.lazy,
          errorBoundaryAt: boundary,
        })
      }
    }
  }
  walk(routes, "", [], [], null)
  return leaves
}

/** Turn a pattern into a concrete URL using fixture param values. */
export function fillPattern(pattern: string): string {
  const overrides = PATTERN_PARAM_OVERRIDES[pattern] ?? {}
  return pattern
    .split("/")
    .map((segment) => {
      if (segment === "*") return "__unmatched/deep/path"
      if (!segment.startsWith(":")) return segment
      const name = segment.slice(1).replace(/\?$/, "")
      const value = overrides[name] ?? PARAM_VALUES[name]
      if (value === undefined) {
        throw new Error(
          `No fixture value for param :${name} (pattern ${pattern})`,
        )
      }
      return encodeURIComponent(value)
    })
    .join("/")
}

/** Logged-in session for routes behind LoggedInRoute, anonymous otherwise. */
export function defaultSessionFor(leaf: RouteLeaf): SessionKind {
  return leaf.guards.includes(LoggedInRoute.name) ? "admin" : "anonymous"
}

// ── Rendering ──────────────────────────────────────────────────────────────

export interface RenderOptions {
  session: SessionKind
  /** Cookies set before mounting (e.g. current_contractor). */
  cookies?: Record<string, string>
}

export interface RouteRecord {
  url: string
  session: SessionKind
  /** Route chain the initial URL matches (before any redirect). */
  initialMatches: string[]
  finalUrl: string
  historyAction: string
  /** Matched route chain (labels) after everything settled. */
  matches: string[]
  /** router.state.errors (loader/lazy errors), by matched route label. */
  routeErrors: Record<string, string> | null
  /** Errors handed to an errorElement via useRouteError(). */
  errorElementErrors: string[]
  /** Matched routes whose `lazy` never resolved. */
  lazyPending: string[]
  title: string
  h1: string[]
  hasMainNav: boolean
  hasMainLandmark: boolean
  /** A skeleton/spinner is still showing after settling (page stuck loading). */
  stillLoading: boolean
  /** Internal hrefs rendered inside <main>, sorted and de-duplicated. */
  mainLinks: string[]
  consoleErrors: string[]
}

/** The Help & Guides directory nav (GuidesDirectory), on every help page. */
const GUIDES_DIRECTORY_SELECTOR = 'nav[aria-label="All guides"]'

export interface MountedApp {
  router: ReturnType<typeof createMemoryRouter>
  requests: FakeApiRequest[]
  consoleErrors: string[]
  consoleWarnings: string[]
  container: HTMLElement
  settle: () => Promise<void>
  record: () => RouteRecord
  unmount: () => void
}

function clearCookies() {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim()
    if (name)
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

/** Minimal console-style formatting (%s/%d/%o substitution, then the rest). */
function format(...args: unknown[]): string {
  const str = (v: unknown): string => {
    if (v instanceof Error) return `${v.name}: ${v.message}`
    if (typeof v === "string") return v
    if (v && typeof v === "object") {
      try {
        return JSON.stringify(v)
      } catch {
        return String(v)
      }
    }
    return String(v)
  }
  if (typeof args[0] !== "string") return args.map(str).join(" ")
  let i = 1
  const head = args[0].replace(/%[sdifoOc]/g, () =>
    i < args.length ? str(args[i++]) : "",
  )
  return [head, ...args.slice(i).map(str)].join(" ")
}

/**
 * React component stacks in console errors contain absolute file paths. The
 * checkout root (taken from the running test file's path, plus its macOS
 * /tmp ↔ /private/tmp twin) is rewritten to "<root>" so snapshots match in
 * any checkout. (No node:fs/process here: the app tsconfig has no Node types.)
 */
function checkoutRoots(): string[] {
  const testPath = expect.getState().testPath ?? ""
  const at = testPath.lastIndexOf("/src/")
  if (at <= 0) return []
  const root = testPath.slice(0, at)
  const twin = root.startsWith("/private/")
    ? root.slice("/private".length)
    : `/private${root}`
  // Longest first so "/private/tmp/x" is replaced before "/tmp/x".
  return [root, twin].sort((a, b) => b.length - a.length)
}

function stripCheckoutRoot(text: string): string {
  let out = text
  for (const root of checkoutRoots()) out = out.split(root).join("<root>")
  return out
}

function normalizeConsole(args: unknown[]): string {
  const text = stripCheckoutRoot(format(...args))
  const firstLine = text.split("\n")[0] ?? ""
  return firstLine
    .replace(/https?:\/\/localhost(:\d+)?/g, "<origin>")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240)
}

function matchLabel(match: { route: RouteObject }): string {
  return routeLabel(match.route)
}

/**
 * Wait until the router is idle and the rendered page stops changing (lazy
 * routes resolved, React.lazy/Suspense boundaries filled, queries settled).
 */
async function settleApp(
  router: ReturnType<typeof createMemoryRouter>,
  isAlive: () => boolean,
  { tickMs = 25, stableTicks = 8, maxMs = 15_000, busyGraceMs = 5000 } = {},
) {
  const signature = () => {
    const s = router.state
    const h1 = [...document.querySelectorAll("h1")]
      .map((h) => h.textContent)
      .join("|")
    const skeletons = document.querySelectorAll(".MuiSkeleton-root").length
    const spinners = document.querySelectorAll('[role="progressbar"]').length
    return [
      s.initialized,
      s.navigation.state,
      s.location.pathname + s.location.search,
      document.title,
      h1,
      skeletons,
      spinners,
    ].join("::")
  }
  let last = ""
  let stable = 0
  const start = Date.now()
  while (Date.now() - start < maxMs && isAlive()) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, tickMs))
    })
    const sig = signature()
    const idle =
      router.state.initialized && router.state.navigation.state === "idle"
    // A Suspense fallback (route skeleton, MarketLoadingFallback spinner) means
    // a lazy chunk is still loading; the DOM can sit unchanged while vitest
    // transforms a big module, so "unchanged" alone is not "settled".
    const busy =
      document.querySelector('.MuiSkeleton-root, [role="progressbar"]') !== null
    if (sig === last && idle && (!busy || Date.now() - start > busyGraceMs)) {
      stable++
      if (stable >= stableTicks) return
    } else {
      stable = 0
      last = sig
    }
  }
}

/**
 * Per-test timeout for suites that mount the app. Generous on purpose: the
 * settle loop is tick-based, and a timed-out test would keep running in the
 * background and corrupt the next test's fetch stub / cookies.
 */
export const APP_TEST_TIMEOUT_MS = 120_000

/** The app currently mounted by mountApp (one at a time per test file). */
let current: { unmount: () => void } | null = null

export function mountApp(
  routes: RouteObject[],
  url: string,
  { session, cookies = {} }: RenderOptions,
): MountedApp {
  // A test that timed out never ran its unmount; tear its app down here so it
  // can't keep stubbing fetch / draining route errors under the next test.
  current?.unmount()
  localStorage.clear()
  sessionStorage.clear()
  clearCookies()
  for (const [name, value] of Object.entries(cookies)) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/`
  }
  document.title = ""
  takeRouteErrors()

  const api = createFakeApi(session)
  vi.stubGlobal("fetch", vi.fn(api.fetchImpl))

  const consoleErrors: string[] = []
  const consoleWarnings: string[] = []
  const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
    consoleErrors.push(normalizeConsole(args))
  })
  const warnSpy = vi.spyOn(console, "warn").mockImplementation((...args) => {
    consoleWarnings.push(normalizeConsole(args))
  })

  const store = makeStore({ networkEnv: testNetworkEnv })
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  const head = createHead({ init: [{ titleTemplate: applyTitleTemplate }] })

  const result = render(
    <Provider store={store}>
      <UnheadProvider head={head}>
        <RouterProvider router={router} />
      </UnheadProvider>
    </Provider>,
  )

  const routeErrorsSeen: string[] = []
  let alive = true
  const unmount = () => {
    if (!alive) return
    alive = false
    if (current === handle) current = null
    result.unmount()
    errorSpy.mockRestore()
    warnSpy.mockRestore()
    vi.unstubAllGlobals()
  }

  const handle: MountedApp = {
    router,
    requests: api.requests,
    consoleErrors,
    consoleWarnings,
    container: result.container,
    settle: async () => {
      await settleApp(router, () => alive)
      if (alive) routeErrorsSeen.push(...takeRouteErrors())
    },
    record: () => {
      const s = router.state
      const main = document.querySelector("#main-content")
      // Help & Guides pages (the ones with the guides directory) get all their
      // links from /content, and routes.contentLinks.test checks every one.
      // Recording them here made each new guide or content edit break these
      // snapshots, so help pages record a marker instead.
      const isHelpPage = !!main?.querySelector(GUIDES_DIRECTORY_SELECTOR)
      const links = !main
        ? []
        : isHelpPage
          ? ["(help page: links checked by routes.contentLinks.test)"]
          : [...main.querySelectorAll("a[href]")]
              .map((a) => a.getAttribute("href") ?? "")
              .filter((href) => href.startsWith("/"))
      const errors = s.errors
        ? Object.fromEntries(
            Object.entries(s.errors).map(([routeId, error]) => {
              const match = s.matches.find((m) => m.route.id === routeId)
              const label = match ? matchLabel(match) : routeId
              return [
                label,
                error instanceof Error ? error.message : String(error),
              ]
            }),
          )
        : null
      return {
        url,
        session,
        initialMatches: (matchRoutes(routes, url) ?? []).map(matchLabel),
        finalUrl: s.location.pathname + s.location.search + s.location.hash,
        historyAction: s.historyAction,
        matches: s.matches.map(matchLabel),
        routeErrors: errors,
        errorElementErrors: [...new Set(routeErrorsSeen)].sort(),
        lazyPending: s.matches.filter((m) => m.route.lazy).map(matchLabel),
        title: document.title,
        h1: [...document.querySelectorAll("h1")].map((h) =>
          (h.textContent ?? "").trim(),
        ),
        hasMainNav: !!document.querySelector('nav[role="navigation"]'),
        hasMainLandmark: !!main,
        stillLoading:
          document.querySelector('.MuiSkeleton-root, [role="progressbar"]') !==
          null,
        mainLinks: [...new Set(links)].sort(),
        consoleErrors: [...new Set(consoleErrors)].sort(),
      }
    },
    unmount,
  }
  current = handle
  return handle
}

/** Mount, settle, record, unmount. */
export async function renderRoute(
  routes: RouteObject[],
  url: string,
  options: RenderOptions,
): Promise<RouteRecord> {
  const app = mountApp(routes, url, options)
  try {
    await app.settle()
    return app.record()
  } finally {
    app.unmount()
  }
}
