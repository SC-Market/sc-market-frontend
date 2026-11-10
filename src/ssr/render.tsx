/**
 * The request-time render of a server-rendered page (entry.server.tsx, on
 * the SSR Pages Function; docs/ssr-worker.md). React Router has already run
 * the route's loader, which loaded the page's data into `ssr.store`.
 *
 * One render, complete (`allReady`): the HTML is cached and served to
 * everyone (crawlers and visitors), and MUI/Emotion's styles can only be
 * collected from a complete render (emotion#2800). The document is the one
 * a prerendered page gets (src/document/document.html, the bridge's head
 * tags, the store's data as JSON next to #root), so the browser hydrates it
 * exactly like a prerendered page (entry.client.tsx).
 */
import type { EntryContext } from "react-router"
import { ServerRouter } from "react-router"
import { renderToReadableStream } from "react-dom/server"
import { Provider } from "react-redux"
import { CacheProvider } from "@emotion/react"
import { createHead, renderSSRHead, UnheadProvider } from "@unhead/react/server"
import type { ResolvableHead } from "unhead/types"
import documentTemplate from "../document/document.html?raw"
import { renderDocument } from "../document/renderDocument"
import {
  PRERENDERED_DATA_ELEMENT_ID,
  type PrerenderedData,
} from "../store/hydration"
import {
  fulfilledApiState,
  transientQueryFailures,
} from "../server/prerenderData"
import { createRenderCache, emotionStyleTags } from "../server/emotionStyles"
import { bridgeHeadTags } from "../server/bridgeHead"
import { applyTitleTemplate, whiteLabelPageHead } from "../seo/pageHead"
import { DEFAULT_FRONTEND_URL } from "../seo/constants"
import { whiteLabelDocument } from "./whiteLabel"
import { RenderedContentBodies } from "../features/help/content"
import { RequestContextProvider } from "./requestContext"
import { I18nextProvider } from "react-i18next"
import i18n, { loadLocale } from "../util/i18n"
import { setServerRenderLanguage } from "../util/renderLanguage"
import { setServerRenderWhiteLabel } from "../util/renderHost"
import { RenderTimeProvider } from "../util/format/renderTime"
import type { SsrRequest } from "./context"
import {
  SSR_FAILURE_HEADER,
  SSR_OUTCOME_HEADER,
  SSR_PARTIAL_HEADER,
} from "./protocol"

/** Longest a render may wait for lazy page code / suspended parts. */
const RENDER_TIMEOUT_MS = 3000

export async function renderSsrPage(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  ssr: SsrRequest,
): Promise<Response> {
  if (ssr.notFound) {
    return new Response(null, {
      status: 404,
      headers: { [SSR_OUTCOME_HEADER]: "not-found" },
    })
  }
  if (ssr.failed) {
    // The page's primary data failed (429, 5xx, timeout): fail open, cache
    // nothing (loaders.ts).
    return new Response(null, {
      status: 503,
      headers: {
        [SSR_OUTCOME_HEADER]: "failed",
        [SSR_FAILURE_HEADER]: ssr.failed,
      },
    })
  }
  if (responseStatusCode !== 200) {
    // A route error (an unexpected throw in a loader, no match): the
    // Function fails open rather than caching an error page.
    return new Response(null, {
      status: responseStatusCode,
      headers: { [SSR_OUTCOME_HEADER]: "route-error" },
    })
  }

  const url = new URL(request.url)
  // The page head (title, meta, canonical, JSON-LD) from the bridge's
  // builders. Before freeze(): it reuses the loaders' API answers.
  const bridge = await bridgeHeadTags(url.pathname, url.origin, {
    env: {
      VITE_BACKEND_URL: ssr.env.VITE_BACKEND_URL,
      VITE_FRONTEND_URL: ssr.env.VITE_FRONTEND_URL || DEFAULT_FRONTEND_URL,
    },
    assets: ssr.assets,
    fetch: ssr.api.fetch,
    waitUntil: ssr.waitUntil,
  })
  // Gone (sold, cancelled) or an unknown tab: the bridge answers 404/410 +
  // noindex, as for an unknown entity.
  if (bridge.kind === "notFound") {
    return new Response(null, {
      status: bridge.status,
      headers: { [SSR_OUTCOME_HEADER]: "not-found" },
    })
  }
  // Another spelling of the page (bare UUID, stale slug): 301 to the
  // canonical URL, as the bridge does.
  if (bridge.kind === "redirect") {
    return new Response(null, {
      status: 301,
      headers: { [SSR_OUTCOME_HEADER]: "redirect", Location: bridge.location },
    })
  }
  // From here on, queries no loader started stay loading (apiFetch.ts).
  ssr.api.freeze()

  // The page's language: this request's own i18next instance (sharing the
  // loaded strings), never the module-wide one other requests also use.
  const { lng, theme } = ssr.requestContext
  if (lng !== "en") await loadLocale(lng)
  const i18nInstance = i18n.cloneInstance({ lng, initAsync: false })

  return renderExclusively(() =>
    renderPage(request, responseHeaders, routerContext, ssr, bridge, {
      i18nInstance,
      lng,
      theme,
    }),
  )
}

/**
 * One render at a time per isolate: renders are CPU-bound anyway (no gain
 * from interleaving them), and helpers outside React read the render's
 * language from module state (util/renderLanguage.ts).
 */
let renderQueue: Promise<unknown> = Promise.resolve()
function renderExclusively<T>(render: () => Promise<T>): Promise<T> {
  const run = renderQueue.then(render, render)
  renderQueue = run.catch(() => {})
  return run
}

interface Variant {
  i18nInstance: typeof i18n
  lng: string
  theme: "light" | "system"
}

async function renderPage(
  request: Request,
  responseHeaders: Headers,
  routerContext: EntryContext,
  ssr: SsrRequest,
  bridge: Awaited<ReturnType<typeof bridgeHeadTags>>,
  variant: Variant,
): Promise<Response> {
  setServerRenderLanguage(variant.lng)
  setServerRenderWhiteLabel(ssr.requestContext.whiteLabel !== null)
  try {
    return await renderPageNow(
      request,
      responseHeaders,
      routerContext,
      ssr,
      bridge,
      variant,
    )
  } finally {
    setServerRenderLanguage(null)
    setServerRenderWhiteLabel(false)
  }
}

async function renderPageNow(
  request: Request,
  responseHeaders: Headers,
  routerContext: EntryContext,
  ssr: SsrRequest,
  bridge: Awaited<ReturnType<typeof bridgeHeadTags>>,
  variant: Variant,
): Promise<Response> {
  const url = new URL(request.url)

  const head = createHead<ResolvableHead>({
    init: [{ titleTemplate: applyTitleTemplate }],
  })
  const cache = createRenderCache()
  // The guide bodies this render shows (per render, like the prerender's).
  const renderedBodies = new Set<string>()
  // Ships with the page: the browser hydrates at this "now" (useNow).
  const renderedAt = Date.now()
  let renderError: unknown
  const stream = await renderToReadableStream(
    <CacheProvider value={cache}>
      <Provider store={ssr.store}>
        <RenderedContentBodies value={renderedBodies}>
          <RequestContextProvider value={ssr.requestContext}>
            <RenderTimeProvider now={renderedAt}>
              <I18nextProvider i18n={variant.i18nInstance}>
                <UnheadProvider value={head}>
                  <ServerRouter context={routerContext} url={request.url} />
                </UnheadProvider>
              </I18nextProvider>
            </RenderTimeProvider>
          </RequestContextProvider>
        </RenderedContentBodies>
      </Provider>
    </CacheProvider>,
    {
      // Keep every Suspense boundary's content in place (see
      // entry.server.tsx renderToHtml).
      progressiveChunkSize: Number.POSITIVE_INFINITY,
      signal: AbortSignal.timeout(RENDER_TIMEOUT_MS),
      onError(error) {
        renderError ??= error
      },
    },
  )
  await stream.allReady
  const appHtml = await new Response(stream).text()
  if (renderError) throw renderError
  // The page hands the visitor to sc-market.space (another seller's listing
  // or shop on this org's domain): the Function answers a 302.
  if (ssr.requestContext.handoff?.leaving) {
    return new Response(null, {
      status: 302,
      headers: { [SSR_OUTCOME_HEADER]: "handoff" },
    })
  }

  const stylesheets = Object.values(routerContext.manifest.routes).flatMap(
    (route) => route?.css ?? [],
  )
  const headTags =
    bridge.kind === "page"
      ? bridge.tags
      : renderSSRHead(head as unknown as Parameters<typeof renderSSRHead>[0])
          .headTags
  const { whiteLabel } = ssr.requestContext
  // On the org's white-label host: "<Org> — <page>", as the browser's title
  // template makes it (entry.client.tsx), and the page's own URL (canonical,
  // og:url, JSON-LD) on the org's host. Every page rendered there is the
  // org's own: the others answer 302 to sc-market.space (pagesFunction.ts).
  const pageHeadTags = whiteLabel
    ? whiteLabelPageHead(headTags, {
        orgName: whiteLabel.domain.name,
        origin: `https://${whiteLabel.hostname}`,
        mainOrigin: (ssr.env.VITE_FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(
          /\/+$/,
          "",
        ),
      })
    : headTags

  if (ssr.api.unprefetched.length > 0) {
    console.log(
      `ssr ${url.pathname}: not prefetched (rendered loading): ${ssr.api.unprefetched.join(", ")}`,
    )
  }

  const documentHtml = renderDocument(documentTemplate, {
    // The bridge summary's link lists after the app (removed before
    // hydrating, like the summary), so the HTML links everywhere the
    // bridge's page does.
    appHtml: bridge.kind === "page" ? appHtml + bridge.relatedHtml : appHtml,
    stylesheets,
    styleTags: emotionStyleTags(cache, appHtml),
    pageHeadTags,
    variant:
      variant.lng !== "en" || variant.theme === "light" || whiteLabel
        ? {
            lng: variant.lng,
            theme: variant.theme,
            host: whiteLabel?.hostname,
          }
        : undefined,
    data: {
      elementId: PRERENDERED_DATA_ELEMENT_ID,
      value: {
        api: fulfilledApiState(ssr.store.getState()),
        contentBodies: [...renderedBodies],
        renderedAt,
        ...(whiteLabel ? { whiteLabel } : {}),
      } satisfies PrerenderedData,
    },
  })

  const html = whiteLabel
    ? whiteLabelDocument(documentHtml, whiteLabel)
    : documentHtml

  responseHeaders.set("Content-Type", "text/html; charset=utf-8")
  responseHeaders.set(SSR_OUTCOME_HEADER, "page")
  // Served, but not cached: some of its data failed transiently (a rate
  // limit, a 5xx, a timeout), or the bridge's head couldn't be built (its
  // API call failed), so the next request renders it again.
  const partial = transientQueryFailures(ssr.store.getState())
  if (bridge.kind === "none") partial.push(`head(${bridge.reason})`)
  if (partial.length > 0) {
    responseHeaders.set(SSR_PARTIAL_HEADER, headerValue(partial.join(", ")))
  }
  return new Response(html, { status: 200, headers: responseHeaders })
}

/** A header-safe (printable ASCII, bounded) form of a diagnostic string. */
function headerValue(value: string): string {
  return value.replace(/[^\x20-\x7e]+/g, " ").slice(0, 300)
}
