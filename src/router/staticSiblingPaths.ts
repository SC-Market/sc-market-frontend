/**
 * Static src/App.tsx routes at the same depth as a public dynamic pattern
 * (e.g. "/market/cart" next to "/market/:id"). react-router ranks static
 * segments over dynamic ones, so anything that matches public detail routes
 * outside the router (the hover data prefetch registry, the edge bridge in
 * src/bridge) must exclude these to rank the same way.
 *
 * Plain data, no imports: the edge bridge bundles this into a Cloudflare
 * Function.
 */
export const STATIC_SIBLING_PATHS: readonly string[] = [
  "/market/services",
  "/market/create",
  "/market/me",
  "/market/manage",
  "/market/manage-stock",
  "/market/cart",
  "/shops/create",
  "/blueprints/inventory",
  "/recruiting/post/create",
]
