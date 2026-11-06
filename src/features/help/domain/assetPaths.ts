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
  /** A guide; with a locale, its published translation (domain/locales.ts). */
  guide: (category: string, slug: string, locale = "en") =>
    locale === "en"
      ? `/content/bridge/guides/${category}/${slug}.json`
      : `/content/bridge/guides/${category}/${slug}.${locale}.json`,
} as const
