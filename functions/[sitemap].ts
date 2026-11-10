// Main-host sitemap proxy: /sitemap.xml and /sitemap-<section>-<n>.xml, and
// an org's white-label host's own robots.txt and sitemap.xml (public/_routes.json
// includes just "/sitemap*.xml" and "/robots.txt"; anything else that reaches
// this single-segment route goes to Pages, as does robots.txt on the main
// host). See src/bridge/sitemapProxy.ts and src/bridge/whiteLabelSeo.ts.
import { handleSitemapRequest } from "../src/bridge/sitemapProxy"
import type { BridgeEnv } from "../src/bridge/handler"
import type { SsrSwitchEnv } from "../src/ssr/variants"

declare const caches: { default: Cache }

interface PagesContext {
  request: Request
  env: BridgeEnv & SsrSwitchEnv
  next(): Promise<Response>
  waitUntil(promise: Promise<unknown>): void
}

export async function onRequest(context: PagesContext): Promise<Response> {
  try {
    return await handleSitemapRequest(
      {
        request: context.request,
        env: context.env,
        next: () => context.next(),
        waitUntil: (promise) => context.waitUntil(promise),
      },
      { cache: caches.default, fetch: (input, init) => fetch(input, init) },
    )
  } catch (error) {
    console.error("sitemap proxy error", error)
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "600" },
    })
  }
}
