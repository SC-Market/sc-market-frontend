/**
 * Plain constants shared by the SPA and the edge bridge. Unlike
 * util/constants.ts this module must not import assets or read
 * `import.meta.env`, so it can be bundled into a Cloudflare Function.
 */

/** Production frontend origin; util/constants.ts FRONTEND_URL defaults to it. */
export const DEFAULT_FRONTEND_URL = "https://sc-market.space"

export const FALLBACK_IMAGE_URL =
  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
