/**
 * Plain constants shared by the SPA and the edge bridge. Unlike
 * util/constants.ts this module must not import assets or read
 * `import.meta.env`, so it can be bundled into a Cloudflare Function.
 */

/** Production frontend origin; util/constants.ts FRONTEND_URL defaults to it. */
export const DEFAULT_FRONTEND_URL = "https://sc-market.space"

/**
 * The missing-image placeholder (public/missing-image.webp), for anything
 * without a photo. Root-relative, so it loads from the current origin on
 * sc-market.space and on white-label domains.
 */
export const MISSING_IMAGE_URL = "/missing-image.webp"

/**
 * The placeholder as an absolute URL, where a relative one doesn't work:
 * og:image / twitter:image, JSON-LD, anything read off the site.
 */
export const MISSING_IMAGE_ABSOLUTE_URL = `${DEFAULT_FRONTEND_URL}${MISSING_IMAGE_URL}`
