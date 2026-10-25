#!/usr/bin/env node
/* global process, console, fetch, URL, setTimeout, clearTimeout, document, location, Buffer, AbortSignal */
/**
 * Route crawl: load every static route (plus representative parameterized
 * routes with real slugs) of a built SC Market frontend in headless Chrome and
 * record what each one rendered. Used to prove a router upgrade regression-free
 * by diffing a crawl of the old build against a crawl of the new one.
 *
 *   # build against the live API, serve on loopback only
 *   VITE_BACKEND_URL=https://api.sc-market.space npm run build
 *   npx vite preview --host 127.0.0.1 --port 4173 --strictPort
 *
 *   node scripts/route-crawl.mjs --base http://127.0.0.1:4173 --out crawl.json
 *   node scripts/route-crawl.mjs --compare before.json after.json
 *
 * Options:
 *   --base <url>          preview server origin (default http://127.0.0.1:4173)
 *   --out <file>          write JSON results here (default: stdout)
 *   --only <regex>        crawl only routes whose pattern matches
 *   --delay <ms>          pause between routes (default 750)
 *   --api-interval <ms>   min gap between upstream API requests (default 250)
 *   --chrome <path>       Chrome binary (default: system Google Chrome)
 *   --puppeteer-dir <dir> node_modules dir containing puppeteer-core
 *                         (default /tmp/mmd/node_modules; not a repo dependency)
 *   --shard <k>/<n>       crawl only the k-th of n slices of the route list
 *                         (1-based), e.g. to split a long crawl into runs
 *   --merge <out> <in...> merge shard outputs into one crawl file
 *   --discover            print fresh slug candidates from the live API (a few
 *                         read-only GETs) instead of crawling
 *   --compare <a> <b>     print differences between two crawl outputs; exits 1
 *                         if any route differs
 *
 * How the live API is reached: the API only allows CORS from
 * https://sc-market.space, so the browser can't call it from 127.0.0.1. The
 * crawler intercepts every request to the API origin and answers it itself:
 *   - GET: fetched from Node (no cookies → logged out), cached for the rest of
 *     the run, rate-limited to one upstream request per --api-interval;
 *   - OPTIONS: answered locally (CORS preflight);
 *   - anything else (POST/PUT/PATCH/DELETE): refused with 405 — the crawl is
 *     read-only and logged out.
 * Analytics/monitoring (Google Analytics, Bugsnag) are blocked so the crawl
 * doesn't report to production; third-party images/fonts/media are skipped.
 */
import { createRequire } from "node:module"
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const API_ORIGIN = "https://api.sc-market.space"
const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
)

// ── args ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    base: "http://127.0.0.1:4173",
    out: null,
    only: null,
    delay: 750,
    apiInterval: 250,
    chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    puppeteerDir: "/tmp/mmd/node_modules",
    discover: false,
    compare: null,
    shard: null,
    merge: null,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => {
      const v = argv[++i]
      if (v === undefined) throw new Error(`${a} needs a value`)
      return v
    }
    if (a === "--base") args.base = next().replace(/\/$/, "")
    else if (a === "--out") args.out = next()
    else if (a === "--only") args.only = new RegExp(next())
    else if (a === "--delay") args.delay = Number(next())
    else if (a === "--api-interval") args.apiInterval = Number(next())
    else if (a === "--chrome") args.chrome = next()
    else if (a === "--puppeteer-dir") args.puppeteerDir = next()
    else if (a === "--discover") args.discover = true
    else if (a === "--compare") args.compare = [next(), next()]
    else if (a === "--shard") {
      const [k, n] = next().split("/").map(Number)
      if (!(k >= 1 && k <= n))
        throw new Error("--shard expects k/n with 1 <= k <= n")
      args.shard = { k, n }
    } else if (a === "--merge") {
      args.merge = { out: next(), inputs: argv.slice(i + 1) }
      i = argv.length
    } else throw new Error(`unknown argument ${a}`)
  }
  return args
}

// ── route table from src/App.tsx ────────────────────────────────────────────

/**
 * Read the `routes` array literal in src/App.tsx with the TypeScript compiler
 * (already a repo dependency) and return every leaf path pattern — the same
 * flattening the vitest harness does on the live objects.
 */
function readRoutePatterns() {
  const require = createRequire(import.meta.url)
  const ts = require("typescript")
  const file = resolve(ROOT, "src/App.tsx")
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  let routesArray = null
  const find = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(sf) === "routes" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      routesArray = node.initializer
    }
    if (!routesArray) ts.forEachChild(node, find)
  }
  find(sf)
  if (!routesArray)
    throw new Error("could not find `routes` array in src/App.tsx")

  const prop = (obj, name) =>
    obj.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === name,
    )

  const join = (parent, child) => {
    if (child === undefined) return parent
    if (child.startsWith("/")) return child
    return `${parent.replace(/\/$/, "")}/${child}`
  }

  const leaves = []
  const walk = (array, parentPath) => {
    for (const el of array.elements) {
      if (!ts.isObjectLiteralExpression(el)) continue
      const pathProp = prop(el, "path")
      const indexProp = prop(el, "index")
      const childrenProp = prop(el, "children")
      const isIndex =
        indexProp && indexProp.initializer.kind === ts.SyntaxKind.TrueKeyword
      const path = isIndex
        ? parentPath
        : join(
            parentPath,
            pathProp && ts.isStringLiteralLike(pathProp.initializer)
              ? pathProp.initializer.text
              : undefined,
          )
      if (
        childrenProp &&
        ts.isArrayLiteralExpression(childrenProp.initializer)
      ) {
        walk(childrenProp.initializer, path)
      } else {
        leaves.push(path || "/")
      }
    }
  }
  walk(routesArray, "")
  return [...new Set(leaves)]
}

/**
 * Representative parameterized routes with real public slugs (picked from the
 * live API on 2026-10-24 with --discover). Hardcoded so two crawls hit the same
 * entities; if one is deleted upstream it shows up as a diff in BOTH crawls.
 */
const PARAM_ROUTES = {
  "/market/:id": "/market/3f3b5a39-e5d6-4ef1-86e3-9258e266cd1f",
  "/market/aggregate/:id":
    "/market/aggregate/d2a758d8-0fdd-48fb-a80c-1c8481c2dd6e",
  "/market/category/:name": "/market/category/Ranged%20Weapon",
  "/buyorder/:id": "/buyorder/b7eb62d6-fae6-4e58-accb-4607c035ea4d",
  "/shops/:slug": "/shops/birdinc",
  "/shops/:slug/:tab": "/shops/birdinc/reviews",
  "/contractor/:id": "/contractor/BIRDINC",
  "/contractor/:id/:tab": "/contractor/BIRDINC/reviews",
  "/user/:username": "/user/Marshall_Apollyon",
  "/user/:username/:tab": "/user/Marshall_Apollyon/reviews",
  "/recruiting/post/:post_id":
    "/recruiting/post/74c409a8-c647-4a53-b48b-f77fa6923933",
  "/wiki/items/:id": "/wiki/items/30cb2460-872c-4f47-8119-4b364c671807",
  "/wiki/ships/:id": "/wiki/ships/317fb7ba--aegis-avenger-stalker",
  "/wiki/commodities/:id":
    "/wiki/commodities/1c18ba70-a7c7-42da-beff-1acc3df0f51d",
  "/wiki/manufacturers/:id": "/wiki/manufacturers/aegs",
  "/missions/:slug": "/missions/PU_Delivery_Local_DrugProduction_KlimIntro",
  "/blueprints/:slug": "/blueprints/280f47b7-8434-410c-b854-380768fdccec",
  "/resources/:resource_id": "/resources/1c18ba70-a7c7-42da-beff-1acc3df0f51d",
  "/mining/ores/:name": "/mining/ores/bexalite_raw",
  "/mining/locations/:name": "/mining/locations/aaronhalo",
  // Logged-out views of nested authenticated trees (expect the login redirect).
  "/org/:contractor_id/manage/about": "/org/BIRDINC/manage/about",
  "/shop/:shopSlug/listings": "/shop/birdinc/listings",
  "/messages/:chat_id": "/messages/chat-1",
  // Splat
  "/*": "/route-crawl/does-not-exist",
}

/** Extra URLs that exercise search params / redirects. */
const EXTRA_URLS = {
  "/market?query": "/market?query=laser&page=2",
  "/services (redirect)": "/services",
  "/shop/:shopSlug (index redirect, logged out)": "/shop/birdinc",
  "/org/:contractor_id/manage (index redirect, logged out)":
    "/org/BIRDINC/manage",
}

function crawlTargets(only) {
  const targets = []
  for (const pattern of readRoutePatterns()) {
    if (!pattern.includes(":") && !pattern.includes("*"))
      targets.push({ route: pattern, url: pattern })
  }
  for (const [route, url] of Object.entries(PARAM_ROUTES))
    targets.push({ route, url })
  for (const [route, url] of Object.entries(EXTRA_URLS))
    targets.push({ route, url })
  return targets
    .filter((t) => !only || only.test(t.route))
    .sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0))
}

// ── live API proxy (read-only, cached, rate-limited) ────────────────────────

function createApiProxy({ base, intervalMs }) {
  const cache = new Map()
  let nextSlot = 0
  let upstream = 0
  const throttle = async () => {
    const now = Date.now()
    const wait = Math.max(0, nextSlot - now)
    nextSlot = Math.max(now, nextSlot) + intervalMs
    if (wait) await new Promise((r) => setTimeout(r, wait))
  }
  const corsHeaders = {
    "access-control-allow-origin": base,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-allow-methods": "GET, OPTIONS",
  }
  async function get(url) {
    if (!cache.has(url)) {
      cache.set(
        url,
        (async () => {
          await throttle()
          upstream++
          try {
            const res = await fetch(url, {
              headers: {
                "user-agent": "scmarket-route-crawl (read-only, logged out)",
              },
              signal: AbortSignal.timeout(30_000),
            })
            return {
              status: res.status,
              contentType:
                res.headers.get("content-type") ?? "application/json",
              body: Buffer.from(await res.arrayBuffer()),
            }
          } catch (error) {
            return {
              status: 502,
              contentType: "text/plain",
              body: Buffer.from(String(error)),
            }
          }
        })(),
      )
    }
    return cache.get(url)
  }
  return {
    get upstreamRequests() {
      return upstream
    },
    async handle(request) {
      const method = request.method()
      if (method === "OPTIONS") {
        return request.respond({ status: 204, headers: corsHeaders, body: "" })
      }
      if (method !== "GET") {
        return request.respond({
          status: 405,
          headers: { ...corsHeaders, "content-type": "application/json" },
          body: JSON.stringify({
            error: { message: "route-crawl is read-only" },
          }),
        })
      }
      const r = await get(request.url())
      return request.respond({
        status: r.status,
        headers: { ...corsHeaders, "content-type": r.contentType },
        body: r.body,
      })
    },
  }
}

// ── crawling ────────────────────────────────────────────────────────────────

/** Make text comparable across builds: drop asset hashes, line:col, origins. */
function normalize(text, base) {
  return String(text)
    .split(base)
    .join("<base>")
    .replace(/(\/assets\/[\w.-]+?)-[\w-]{8}(\.(?:js|css|mjs))/g, "$1-[hash]$2")
    .replace(/:\d+:\d+\)?/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300)
}

async function crawlOne(browser, proxy, args, target) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  const baseOrigin = new URL(args.base).origin
  const rec = {
    route: target.route,
    url: target.url,
    finalUrl: null,
    title: null,
    h1: [],
    hasMainNav: false,
    hasMain: false,
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedOwnRequests: [],
    apiNon2xx: [],
    navigationError: null,
    /** Requests still open when a network-idle wait timed out. */
    pendingAtTimeout: [],
  }
  const push = (list, value) => {
    if (!list.includes(value)) list.push(value)
  }

  // Own network-idle tracking. Puppeteer's networkidle never settles after a
  // full-page redirect (LoggedInRoute sets window.location.href) because
  // intercepted requests of the unloaded document never report finished.
  // Requests are tagged with the main-frame document generation and only
  // the current document's requests count.
  const inflight = new Map()
  let generation = 0
  let lastActivity = Date.now()
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      generation++
      lastActivity = Date.now()
    }
  })
  const requestCounts = new Map()
  page.on("request", (request) => {
    inflight.set(request, generation)
    lastActivity = Date.now()
    const key = `${request.method()} ${normalize(request.url(), args.base)}`
    requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1)
  })
  const settled = (request) => {
    inflight.delete(request)
    lastActivity = Date.now()
  }
  page.on("requestfinished", settled)
  page.on("requestfailed", settled)
  const current = () =>
    [...inflight].filter(([, gen]) => gen === generation).map(([r]) => r)
  const pending = () =>
    current()
      .map((r) => `${r.method()} ${normalize(r.url(), args.base)}`)
      .sort()
  const waitForIdle = async (idleMs, timeoutMs) => {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (current().length === 0 && Date.now() - lastActivity >= idleMs)
        return true
      await new Promise((r) => setTimeout(r, 100))
    }
    return false
  }

  await page.setRequestInterception(true)
  page.on("request", (request) => {
    let url
    try {
      url = new URL(request.url())
    } catch {
      return request.continue()
    }
    if (url.origin === API_ORIGIN)
      return proxy.handle(request).catch(() => request.abort())
    // Only the app's own origin and the (proxied) API are loaded. Everything
    // third-party — analytics, Bugsnag, Google Fonts, CDN images — is
    // blocked: it isn't routing, it's volatile, and analytics/monitoring
    // must not receive crawl traffic.
    // Third-party images get a local 1x1 PNG instead of an error: aborting
    // them makes <img onError> fallbacks swap to another blocked URL forever.
    if (url.origin !== baseOrigin && request.resourceType() === "image") {
      return request.respond({
        status: 200,
        contentType: "image/png",
        body: PIXEL_PNG,
      })
    }
    if (url.origin !== baseOrigin) return request.abort("blockedbyclient")
    return request.continue()
  })
  page.on("console", (msg) => {
    const type = msg.type()
    if (type !== "error" && type !== "warn" && type !== "warning") return
    let text = msg.text()
    const source = msg.location()?.url
    if (text.startsWith("Failed to load resource")) {
      // Chrome's network-error line carries no URL; take it from the location.
      if (!source) return
      const url = new URL(source)
      // Requests this crawler blocked on purpose (analytics, third-party media).
      if (text.includes("ERR_BLOCKED_BY_CLIENT")) return
      text = `${text} ${url.origin === API_ORIGIN ? "<api>" : url.origin === baseOrigin ? "" : url.origin}${url.pathname}`
    }
    // Bugsnag complaining that the crawler blocked its delivery.
    if (/^\[bugsnag\] (Session|Event) failed to send/.test(text)) return
    push(
      type === "error" ? rec.consoleErrors : rec.consoleWarnings,
      normalize(text, args.base),
    )
  })
  page.on("pageerror", (error) =>
    push(rec.pageErrors, normalize(error?.message ?? error, args.base)),
  )
  page.on("requestfailed", (request) => {
    const url = new URL(request.url())
    if (url.origin === baseOrigin) {
      push(
        rec.failedOwnRequests,
        `${request.method()} ${normalize(url.pathname, args.base)} ${request.failure()?.errorText ?? "failed"}`,
      )
    }
  })
  page.on("response", (response) => {
    const url = new URL(response.url())
    const status = response.status()
    if (url.origin === baseOrigin && status >= 400) {
      push(
        rec.failedOwnRequests,
        `${response.request().method()} ${normalize(url.pathname, args.base)} ${status}`,
      )
    }
    if (
      url.origin === API_ORIGIN &&
      (status < 200 || status >= 300) &&
      response.request().method() !== "OPTIONS"
    ) {
      // Drop query strings with volatile values (timestamps/cache busters).
      push(
        rec.apiNon2xx,
        `${response.request().method()} ${url.pathname} ${status}`,
      )
    }
  })

  try {
    await page.goto(args.base + target.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    })
    // 1.5s with no request in flight for the current document: lazy route
    // chunks and follow-up queries have all landed.
    if (!(await waitForIdle(1500, 45_000))) {
      rec.navigationError = "network never idle (45s)"
      rec.pendingAtTimeout = pending()
      rec.repeatingRequests = [...requestCounts]
        .filter(([, n]) => n > 3)
        .map(([key]) => key)
        .sort()
    }
  } catch (error) {
    rec.navigationError = normalize(error?.message ?? error, args.base)
    rec.pendingAtTimeout = pending()
  }
  try {
    const dom = await page.evaluate(() => ({
      href: location.pathname + location.search + location.hash,
      title: document.title,
      h1: [...document.querySelectorAll("h1")].map((h) =>
        (h.textContent ?? "").trim(),
      ),
      hasMainNav: !!document.querySelector('nav[role="navigation"]'),
      hasMain: !!document.querySelector("main, #main-content"),
    }))
    rec.finalUrl = dom.href
    rec.title = dom.title
    rec.h1 = dom.h1
    rec.hasMainNav = dom.hasMainNav
    rec.hasMain = dom.hasMain
  } catch (error) {
    rec.navigationError ??= normalize(error?.message ?? error, args.base)
  }
  for (const key of [
    "consoleErrors",
    "consoleWarnings",
    "pageErrors",
    "failedOwnRequests",
    "apiNon2xx",
  ]) {
    rec[key].sort()
  }
  await context.close().catch(() => {})
  return rec
}

async function crawl(args) {
  const require = createRequire(resolve(args.puppeteerDir, "noop.js"))
  const puppeteer = require("puppeteer-core")
  const targets = crawlTargets(args.only).filter(
    (_, i) => !args.shard || i % args.shard.n === args.shard.k - 1,
  )
  const launch = () =>
    puppeteer.launch({
      executablePath: args.chrome,
      headless: true,
      args: [
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
      ],
    })
  let browser = await launch()
  const proxy = createApiProxy({
    base: new URL(args.base).origin,
    intervalMs: args.apiInterval,
  })
  const routes = {}
  let relaunches = 0
  try {
    for (const [i, target] of targets.entries()) {
      process.stderr.write(`[${i + 1}/${targets.length}] ${target.url}\n`)
      // A crashed/disconnected Chrome (seen under heavy machine load) gets
      // relaunched and the route retried once; the result never depends on it.
      for (let attempt = 0; ; attempt++) {
        try {
          if (!browser.connected) {
            relaunches++
            browser = await launch()
          }
          const started = Date.now()
          const before = proxy.upstreamRequests
          let timer
          routes[target.route] = await Promise.race([
            crawlOne(browser, proxy, args, target),
            new Promise((_, reject) => {
              timer = setTimeout(
                () => reject(new Error("route took over 150s")),
                150_000,
              )
            }),
          ]).finally(() => clearTimeout(timer))
          process.stderr.write(
            `  ${Date.now() - started}ms, ${proxy.upstreamRequests - before} new upstream API requests\n`,
          )
          break
        } catch (error) {
          process.stderr.write(`  browser error: ${error?.message ?? error}\n`)
          await browser.close().catch(() => {})
          if (attempt >= 1) throw error
        }
      }
      if (args.delay) await new Promise((r) => setTimeout(r, args.delay))
    }
  } finally {
    await browser.close().catch(() => {})
  }
  const sorted = Object.fromEntries(
    Object.keys(routes)
      .sort()
      .map((k) => [k, routes[k]]),
  )
  return {
    meta: {
      base: args.base,
      api: API_ORIGIN,
      crawledAt: new Date().toISOString(),
      routeCount: targets.length,
      upstreamApiRequests: proxy.upstreamRequests,
      browserRelaunches: relaunches,
    },
    routes: sorted,
  }
}

// ── discover ────────────────────────────────────────────────────────────────

async function discover() {
  const gets = [
    [
      "/market/:id",
      "/api/v2/listings/search?page=1&page_size=1",
      (j) => j.listings?.[0]?.listing_id,
    ],
    [
      "/market/aggregate/:id",
      "/api/v2/listings/search?page=1&page_size=1",
      (j) => j.listings?.[0]?.game_item_id,
    ],
    [
      "/buyorder/:id",
      "/api/v2/buy-orders/search?page_size=1",
      (j) => j.buy_orders?.[0]?.buy_order_id,
    ],
    ["/shops/:slug", "/api/v2/shops?page_size=1", (j) => j.shops?.[0]?.slug],
    [
      "/wiki/items/:id",
      "/api/v2/game-data/wiki/items?page_size=1",
      (j) => j.items?.[0]?.id,
    ],
    [
      "/wiki/ships/:id",
      "/api/v2/game-data/wiki/ships?page_size=1",
      (j) => j.ships?.[0] && `${j.ships[0].id} (${j.ships[0].name})`,
    ],
    [
      "/missions/:slug",
      "/api/v2/game-data/missions/search?page_size=1",
      (j) => j.missions?.[0]?.mission_code,
    ],
    [
      "/blueprints/:slug",
      "/api/v2/game-data/blueprints/search?page_size=1",
      (j) => j.blueprints?.[0]?.blueprint_code,
    ],
    [
      "/resources/:resource_id",
      "/api/v2/game-data/resources/search?page_size=1",
      (j) => j.resources?.[0]?.resource_id,
    ],
    [
      "/recruiting/post/:post_id",
      "/api/recruiting/posts?index=0&pageSize=1",
      (j) => j.data?.items?.[0]?.post_id,
    ],
  ]
  for (const [route, path, pick] of gets) {
    const res = await fetch(API_ORIGIN + path, {
      headers: { "user-agent": "scmarket-route-crawl --discover" },
    })
    const value = res.ok ? pick(await res.json()) : `HTTP ${res.status}`
    console.log(`${route.padEnd(28)} ${value}`)
    await new Promise((r) => setTimeout(r, 1000))
  }
}

// ── compare ─────────────────────────────────────────────────────────────────

function compare(fileA, fileB) {
  const a = JSON.parse(readFileSync(fileA, "utf8")).routes
  const b = JSON.parse(readFileSync(fileB, "utf8")).routes
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
  let differing = 0
  for (const key of keys) {
    if (!(key in a)) {
      console.log(`+ ${key}: only in ${fileB}`)
      differing++
      continue
    }
    if (!(key in b)) {
      console.log(`- ${key}: only in ${fileA}`)
      differing++
      continue
    }
    const lines = []
    for (const field of [
      ...new Set([...Object.keys(a[key]), ...Object.keys(b[key])]),
    ]) {
      const va = a[key][field]
      const vb = b[key][field]
      if (JSON.stringify(va) === JSON.stringify(vb)) continue
      if (Array.isArray(va) && Array.isArray(vb)) {
        for (const x of va)
          if (!vb.includes(x))
            lines.push(`    - ${field}: ${JSON.stringify(x)}`)
        for (const x of vb)
          if (!va.includes(x))
            lines.push(`    + ${field}: ${JSON.stringify(x)}`)
        if (!lines.length) lines.push(`    ~ ${field}: order changed`)
      } else {
        lines.push(
          `    ${field}: ${JSON.stringify(va)} → ${JSON.stringify(vb)}`,
        )
      }
    }
    if (lines.length) {
      differing++
      console.log(`~ ${key}`)
      for (const line of lines) console.log(line)
    }
  }
  console.log(`\n${differing} of ${keys.length} routes differ`)
  return differing
}

// ── main ────────────────────────────────────────────────────────────────────

function merge({ out, inputs }) {
  const parts = inputs.map((f) => JSON.parse(readFileSync(f, "utf8")))
  const routes = Object.assign({}, ...parts.map((p) => p.routes))
  const merged = {
    meta: {
      ...parts[0].meta,
      crawledAt: parts.map((p) => p.meta.crawledAt).sort()[0],
      routeCount: Object.keys(routes).length,
      upstreamApiRequests: parts.reduce(
        (n, p) => n + p.meta.upstreamApiRequests,
        0,
      ),
      browserRelaunches: parts.reduce(
        (n, p) => n + (p.meta.browserRelaunches ?? 0),
        0,
      ),
      mergedFrom: inputs.length,
    },
    routes: Object.fromEntries(
      Object.keys(routes)
        .sort()
        .map((k) => [k, routes[k]]),
    ),
  }
  writeFileSync(out, JSON.stringify(merged, null, 2) + "\n")
}

const args = parseArgs(process.argv.slice(2))
if (args.merge) {
  merge(args.merge)
} else if (args.compare) {
  process.exit(compare(...args.compare) ? 1 : 0)
} else if (args.discover) {
  await discover()
} else {
  const result = await crawl(args)
  const json = JSON.stringify(result, null, 2) + "\n"
  if (args.out) writeFileSync(args.out, json)
  else process.stdout.write(json)
  process.stderr.write(
    `crawled ${result.meta.routeCount} routes, ${result.meta.upstreamApiRequests} upstream API requests\n`,
  )
}
