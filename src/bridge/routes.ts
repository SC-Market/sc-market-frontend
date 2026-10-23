/**
 * Public routes the edge bridge renders a head + summary for. Patterns are
 * copied from src/App.tsx and matched the way react-router ranks them:
 * static segments beat dynamic ones (STATIC_SIBLING_PATHS), matching is
 * case-insensitive and ignores a trailing slash. A unit test checks this
 * matcher against react-router's own matchRoutes.
 *
 * Keep public/_routes.json in sync: it decides which requests invoke the
 * Function at all; this decides what the Function does with them.
 */
import { STATIC_SIBLING_PATHS } from "../router/staticSiblingPaths"

export type BridgePageKind =
  | "commodity"
  | "item"
  | "ship"
  | "ore"
  | "miningLocation"
  | "blueprint"
  | "mission"
  | "resource"
  | "listing"
  | "shop"
  | "org"
  | "user"
  | "recruitingPost"

export interface BridgeRoute {
  path: string
  kind: BridgePageKind
}

export const BRIDGE_ROUTES: readonly BridgeRoute[] = [
  { path: "/wiki/commodities/:id", kind: "commodity" },
  { path: "/wiki/items/:id", kind: "item" },
  { path: "/wiki/ships/:id", kind: "ship" },
  { path: "/mining/ores/:name", kind: "ore" },
  { path: "/mining/locations/:name", kind: "miningLocation" },
  { path: "/blueprints/:slug", kind: "blueprint" },
  { path: "/missions/:slug", kind: "mission" },
  { path: "/resources/:resource_id", kind: "resource" },
  { path: "/market/:id", kind: "listing" },
  { path: "/shops/:slug", kind: "shop" },
  { path: "/shops/:slug/:tab", kind: "shop" },
  { path: "/contractor/:id", kind: "org" },
  { path: "/contractor/:id/:tab", kind: "org" },
  { path: "/user/:username", kind: "user" },
  { path: "/user/:username/:tab", kind: "user" },
  { path: "/recruiting/post/:post_id", kind: "recruitingPost" },
]

export interface BridgeMatch {
  route: BridgeRoute
  params: Record<string, string>
}

function splitPath(pathname: string): string[] {
  return pathname.split("/").filter((s) => s !== "")
}

const STATIC_SIBLINGS = new Set(
  STATIC_SIBLING_PATHS.map((p) => splitPath(p).join("/").toLowerCase()),
)

/**
 * Match a request pathname (percent-encoded, as in `URL.pathname`) to a
 * bridge route. Params are decoded like react-router's useParams. Returns
 * null for anything else, including static siblings and undecodable paths.
 */
export function matchBridgeRoute(pathname: string): BridgeMatch | null {
  const segments = splitPath(pathname)
  if (STATIC_SIBLINGS.has(segments.join("/").toLowerCase())) return null

  for (const route of BRIDGE_ROUTES) {
    const pattern = splitPath(route.path)
    if (pattern.length !== segments.length) continue

    const params: Record<string, string> = {}
    let matched = true
    for (let i = 0; i < pattern.length; i++) {
      const part = pattern[i]
      const segment = segments[i]
      if (part.startsWith(":")) {
        let value: string
        try {
          value = decodeURIComponent(segment)
        } catch {
          return null
        }
        params[part.slice(1)] = value
      } else if (part.toLowerCase() !== segment.toLowerCase()) {
        matched = false
        break
      }
    }
    if (matched) return { route, params }
  }
  return null
}
