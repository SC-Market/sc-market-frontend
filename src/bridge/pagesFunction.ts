/**
 * Cloudflare Pages Function entry for the edge bridge. The route files in
 * /functions re-export this; public/_routes.json limits which paths invoke
 * it. Only this module touches Workers globals.
 */
import { handleBridgeRequest, type BridgeEnv } from "./handler"
import type { HtmlRewriterConstructor } from "./render"

// Workers runtime globals, declared module-locally so they don't leak into
// the SPA's type environment.
declare const HTMLRewriter: HtmlRewriterConstructor
declare const caches: { default: Cache }

/** The parts of Pages' EventContext the bridge uses. */
interface PagesContext {
  request: Request
  env: BridgeEnv
  next(): Promise<Response>
  waitUntil(promise: Promise<unknown>): void
}

export async function onRequest(context: PagesContext): Promise<Response> {
  try {
    return await handleBridgeRequest(
      {
        request: context.request,
        env: context.env,
        next: () => context.next(),
        waitUntil: (promise) => context.waitUntil(promise),
      },
      {
        HTMLRewriter,
        cache: caches.default,
        fetch: (input, init) => fetch(input, init),
      },
    )
  } catch (error) {
    // Last-resort fail open: whatever happens, serve what Pages would have.
    console.error("bridge error", error)
    return context.next()
  }
}
