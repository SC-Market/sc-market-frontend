import { shopContextFromState } from "./shopContextState"
import type { NavContext } from "./sidebarNavItems"

/** Which context the sidebar is in, and the shop or org it is showing. */
export interface NavSelection {
  ctx: NavContext
  shopSlug: string | null
  orgId: string | null
}

/** The sidebar context a URL implies (before the user switches it). */
export function inferNavSelection(path: string, state: unknown): NavSelection {
  if (path.startsWith("/admin"))
    return { ctx: "admin", shopSlug: null, orgId: null }
  const shopMatch = path.match(/^\/shop\/([^/]+)/)
  if (shopMatch) return { ctx: "shop", shopSlug: shopMatch[1], orgId: null }
  const orgMatch = path.match(/^\/org\/([^/]+)/)
  if (orgMatch) return { ctx: "org", shopSlug: null, orgId: orgMatch[1] }
  // A listing page reached from a shop (after creating or editing one of
  // its listings) stays in that shop's context.
  const fromShop = shopContextFromState(state)
  if (fromShop) return { ctx: "shop", shopSlug: fromShop, orgId: null }
  return { ctx: "browse", shopSlug: null, orgId: null }
}
