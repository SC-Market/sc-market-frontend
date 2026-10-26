/**
 * Server entry. Runs only at build time (react-router.config.ts has
 * `ssr: false`): React Router renders the root route through here to write
 * build/client/index.html, the one HTML shell served for every path.
 *
 * The page is src/document/document.html with the React tree rendered into
 * its <div id="root">; entry.client.tsx hydrates that same element. The
 * <head> stays static HTML (not React), so the edge bridge's HTMLRewriter
 * can rewrite <title>/meta/JSON-LD without React ever reconciling them.
 */
import type { EntryContext } from "react-router"
import { ServerRouter } from "react-router"
import { prerender } from "react-dom/static"
import documentTemplate from "./document/document.html?raw"
import { renderDocument } from "./document/renderDocument"

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
): Promise<Response> {
  // Wait for the whole tree (no streaming): this is a static file.
  const { prelude } = await prerender(
    <ServerRouter context={routerContext} url={request.url} />,
  )
  const appHtml = await new Response(prelude).text()

  const html = renderDocument(documentTemplate, {
    appHtml,
    stylesheets: Object.values(routerContext.manifest.routes).flatMap(
      (route) => route?.css ?? [],
    ),
  })

  responseHeaders.set("Content-Type", "text/html; charset=utf-8")
  return new Response(html, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
