/**
 * Server entry. At build time (react-router.config.ts has `ssr: false`):
 * - the SPA shell: React Router renders the root route (with its empty
 *   HydrateFallback) to build/client/index.html, served for every app path;
 * - prerendered pages (src/prerender/paths.ts): the real page, rendered with
 *   build-time data, to build/client/<path>/index.html.
 * At request time, on the SSR Pages Function (docs/ssr-worker.md), the
 * entity pages: React Router's loaders load the data, then one render
 * (src/ssr/render.tsx).
 *
 * The page is src/document/document.html with the React tree rendered into
 * its <div id="root">; entry.client.tsx hydrates that same element. The
 * <head> stays static HTML (not React), so the edge bridge's HTMLRewriter
 * can rewrite <title>/meta/JSON-LD without React ever reconciling them.
 */
import type { EntryContext } from "react-router"
import { ServerRouter } from "react-router"
import { prerender } from "react-dom/static"
import { Provider } from "react-redux"
import { CacheProvider } from "@emotion/react"
import { createHead, renderSSRHead, UnheadProvider } from "@unhead/react/server"
import type { ResolvableHead } from "unhead/types"
import documentTemplate from "./document/document.html?raw"
import { renderDocument } from "./document/renderDocument"
import { makeStore, type AppStore } from "./store/store"
import { serviceApi } from "./store/service"
import { generatedApi } from "./store/generatedApi"
import { generatedApiV2 } from "./store/generatedApiV2"
import {
  hydratePrerenderedData,
  PRERENDERED_DATA_ELEMENT_ID,
  type PrerenderedData,
} from "./store/hydration"
import { RenderedContentBodies } from "./features/help/content"
import {
  fulfilledEndpointNames,
  prerenderableApiState,
} from "./server/prerenderData"
import { createServerNetworkEnv } from "./server/serverNetworkEnv"
import { createRenderCache, emotionStyleTags } from "./server/emotionStyles"
import { bridgeHeadTags } from "./server/bridgeHead"
import { buildContentSource } from "./server/contentSource"
import { getSsrRequest } from "./ssr/context"
import { renderSsrPage } from "./ssr/render"
import { isSsrPlaceholderPath } from "./ssr/routePlaceholders"
import { applyTitleTemplate } from "./seo/pageHead"
import { DEFAULT_FRONTEND_URL } from "./seo/constants"
import { provideShell } from "./routes/shell"
import { providePages } from "./routes/definePage"
import { shell } from "./app/shell"
import { pages } from "./app/pages"
import { RenderTimeProvider } from "./util/format/renderTime"

provideShell(shell)
providePages(pages)

// For the SSR Pages Function (src/ssr/protocol.ts SsrEntryModule): it
// reaches the app through this module (React Router's build.entry.module).
export { createSsrLoadContext } from "./ssr/createSsrRequest"

const API_SLICES = [serviceApi, generatedApi, generatedApiV2] as const

/** A page's data has this long to arrive; after that it renders as loading. */
const DATA_TIMEOUT_MS = 20_000
/** Render passes for queries that start once earlier data is in. */
const MAX_DATA_PASSES = 3

/** A render's HTML and the <style> tags for its MUI/Emotion styles. */
interface RenderedApp {
  appHtml: string
  styleTags: string
}

async function renderToHtml(element: React.ReactElement): Promise<RenderedApp> {
  // The styles go to <head>, collected per render (server/emotionStyles.ts).
  const cache = createRenderCache()
  // Wait for the whole tree (no streaming): this is a static file. And keep
  // every Suspense boundary's content in place: by default React moves large
  // boundaries to the end of the HTML (swapped in by an inline script), so a
  // browser could paint the skeleton first and shift, and crawlers would find
  // the page body in a hidden <div>.
  const { prelude } = await prerender(
    <CacheProvider value={cache}>{element}</CacheProvider>,
    { progressiveChunkSize: Number.POSITIVE_INFINITY },
  )
  const appHtml = await new Response(prelude).text()
  return { appHtml, styleTags: emotionStyleTags(cache, appHtml) }
}

/** Wait for the queries the last render started; false if none were running. */
async function settleQueries(store: AppStore): Promise<boolean> {
  const running = API_SLICES.flatMap((api) =>
    store.dispatch(api.util.getRunningQueriesThunk()),
  )
  if (running.length === 0) return false
  let timer: ReturnType<typeof setTimeout> | undefined
  await Promise.race([
    Promise.allSettled(running),
    new Promise((resolve) => {
      timer = setTimeout(resolve, DATA_TIMEOUT_MS)
    }),
  ])
  clearTimeout(timer)
  return true
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext?: unknown,
): Promise<Response> {
  const ssr = getSsrRequest(loadContext)
  if (ssr) {
    return renderSsrPage(
      request,
      responseStatusCode,
      responseHeaders,
      routerContext,
      ssr,
    )
  }
  // Not a page (src/ssr/routePlaceholders.ts): finalize.ts deletes the file.
  if (isSsrPlaceholderPath(new URL(request.url).pathname)) {
    return new Response("<!-- ssr route placeholder -->", {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  const stylesheets = Object.values(routerContext.manifest.routes).flatMap(
    (route) => route?.css ?? [],
  )
  responseHeaders.set("Content-Type", "text/html; charset=utf-8")

  if (routerContext.isSpaMode) {
    const { appHtml, styleTags } = await renderToHtml(
      <ServerRouter context={routerContext} url={request.url} />,
    )
    return new Response(
      renderDocument(documentTemplate, { appHtml, stylesheets, styleTags }),
      {
        status: responseStatusCode,
        headers: responseHeaders,
      },
    )
  }

  // A prerendered page: anonymous, like every visitor's first render.
  const store = makeStore({ networkEnv: createServerNetworkEnv() })
  // React Router streams loader data into the page once; the data passes
  // render without that stream (only the final render emits it).
  const dataPassContext: EntryContext = {
    ...routerContext,
    serverHandoffStream: undefined,
  }
  // Every pass renders at the same "now", which ships with the page.
  const renderedAt = Date.now()
  const render = (
    head: ReturnType<typeof newHead>,
    context: EntryContext = dataPassContext,
    contentBodies: Set<string> | null = null,
  ) =>
    renderToHtml(
      <Provider store={store}>
        <RenderTimeProvider now={renderedAt}>
          <RenderedContentBodies value={contentBodies}>
            <UnheadProvider value={head}>
              <ServerRouter context={context} url={request.url} />
            </UnheadProvider>
          </RenderedContentBodies>
        </RenderTimeProvider>
      </Provider>,
    )
  const newHead = () =>
    createHead<ResolvableHead>({
      init: [{ titleTemplate: applyTitleTemplate }],
    })

  // RTK Query hooks start their queries while rendering on the server
  // (src/server/rtkQueryReactServer.ts): render, wait for the data, repeat
  // until no render starts anything new, then render the final HTML.
  for (let pass = 0; pass < MAX_DATA_PASSES; pass++) {
    await render(newHead())
    if (!(await settleQueries(store))) break
  }
  // Keep only the data the page ships (game data, see prerenderData.ts) and
  // render once more: everything else is then loading in the HTML, exactly
  // like the browser's first render, which has only the shipped data. (A
  // build-time market listing in the HTML would be stale, and wouldn't match
  // the hydrating render.)
  console.log(
    `prerender ${new URL(request.url).pathname}: fetched ${fulfilledEndpointNames(store.getState()).join(", ") || "(nothing)"}`,
  )
  const shipped = prerenderableApiState(store.getState())
  for (const api of API_SLICES) store.dispatch(api.util.resetApiState())
  store.dispatch(hydratePrerenderedData(shipped))
  const head = newHead()
  // The guide bodies this page shows (this render's own: other pages render
  // at the same time, react-router.config.ts `concurrency`).
  const renderedBodies = new Set<string>()
  const { appHtml, styleTags } = await render(
    head,
    routerContext,
    renderedBodies,
  )
  const contentBodies = [...renderedBodies]

  const url = new URL(request.url)
  const assets = buildContentSource()
  if (!assets) {
    throw new Error(
      "prerender: no build content source (react-router.config.ts registers it)",
    )
  }
  const bridge = await bridgeHeadTags(url.pathname, url.origin, {
    env: {
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      VITE_FRONTEND_URL:
        import.meta.env.VITE_FRONTEND_URL || DEFAULT_FRONTEND_URL,
    },
    assets,
  })
  if (bridge.kind !== "page") {
    console.warn(
      `prerender ${url.pathname}: page head from the app (${bridge.kind === "none" ? bridge.reason : "not found"})`,
    )
  }
  const pageHeadTags =
    bridge.kind === "page"
      ? bridge.tags
      : // Unhead types the server head per entry type; this one is the app's.
        renderSSRHead(head as unknown as Parameters<typeof renderSSRHead>[0])
          .headTags

  const html = renderDocument(documentTemplate, {
    appHtml,
    stylesheets,
    styleTags,
    pageHeadTags,
    data: {
      elementId: PRERENDERED_DATA_ELEMENT_ID,
      value: { api: shipped, contentBodies, renderedAt } satisfies PrerenderedData,
    },
  })

  // Stop anything the renders left subscribed (polling) before the next page.
  for (const api of API_SLICES) store.dispatch(api.util.resetApiState())

  return new Response(html, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
