/**
 * Keeps the sidebar in a shop's context across pages that aren't under
 * /shop/:slug, such as a listing's page or its edit page, when you got there
 * from that shop (creating or editing one of its listings). Navigations pass
 * it as router state; the sidebar reads it back.
 */

export interface ShopContextState {
  shopContext: string
}

/** Router state that keeps the sidebar in the shop `slug`'s context. */
export function withShopContext(slug: string): ShopContextState {
  return { shopContext: slug }
}

/** The shop slug a navigation asked the sidebar to stay in, if any. */
export function shopContextFromState(state: unknown): string | null {
  if (typeof state !== "object" || state === null || !("shopContext" in state)) return null
  return typeof state.shopContext === "string" && state.shopContext ? state.shopContext : null
}
