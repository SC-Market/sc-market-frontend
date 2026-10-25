/**
 * Static files the content build emits into dist/ (scripts/vite/contentPlugin.ts).
 * The edge bridge reads the /content/bridge/* files through env.ASSETS; the
 * backend sitemap fetches the manifest. Plain data: bundled into the Function.
 */
export const CONTENT_ASSET_PATHS = {
  /** Every content URL + lastmod, for the backend sitemap. */
  manifest: "/content/manifest.json",
  /** Categories + guide metadata (no bodies), for hub/category pages. */
  index: "/content/bridge/index.json",
  about: "/content/bridge/about.json",
  category: (category: string) => `/content/bridge/guides/${category}.json`,
  guide: (category: string, slug: string) => `/content/bridge/guides/${category}/${slug}.json`,
} as const
