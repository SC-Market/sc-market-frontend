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
        networkEnv: createServerNetworkEnv({ fetchFn: options.api.fetch }),
      }),
      notFound: false,
    },
  }
  return { ...context }
}
