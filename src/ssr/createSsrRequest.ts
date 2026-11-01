/**
 * Builds one request's SSR load context (context.ts) inside the server
 * build (exported by entry.server.tsx for the SSR Pages Function): a fresh
 * store whose queries go through the request's API fetch.
 */
import { makeStore } from "../store/store"
import { createServerNetworkEnv } from "../server/serverNetworkEnv"
import type { SsrLoadContext } from "./context"
import type { SsrRequestOptions } from "./protocol"

export function createSsrLoadContext(
  options: SsrRequestOptions,
): Record<string, unknown> {
  const context: SsrLoadContext = {
    ssr: {
      ...options,
      store: makeStore({
        // No retries: the render's 2.5 s budget can't hold them, and a
        // failed primary query fails open at once (loaders.ts).
        networkEnv: createServerNetworkEnv({
          fetchFn: options.api.fetch,
          retry: false,
        }),
      }),
      notFound: false,
    },
  }
  return { ...context }
}
