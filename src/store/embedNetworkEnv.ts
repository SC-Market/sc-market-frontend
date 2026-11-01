/**
 * The NetworkEnv of the /embed/* widgets (iframed on other sites): never
 * credentialed. No cookies are sent (credentials "omit"), no session check,
 * no refresh on 401, so a widget on a third-party page can't act as the
 * visitor or show their data; it only reads public, anonymous endpoints.
 */
import type { NetworkEnv } from "./networkEnv"

export const embedNetworkEnv: NetworkEnv = {
  credentials: "omit",
  headers: {},
  onUnauthorized: async () => false,
  checkSession: async () => "anonymous",
  onLoggedOut: () => {},
}

/** The read-only embeddable widgets live under this path (public/_headers lets other sites frame it). */
export const EMBED_PATH_PREFIX = "/embed/"

export function isEmbedPath(pathname: string): boolean {
  return pathname.startsWith(EMBED_PATH_PREFIX)
}
