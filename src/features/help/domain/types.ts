/**
 * Help & Guides content model. Markdown in /content is compiled at build time
 * (src/features/help/build/compile.ts, run by scripts/vite/contentPlugin.ts)
 * into this small block tree. The SPA renders it with ContentBlocks and the
 * edge bridge flattens it to text, so neither ships a Markdown parser.
 *
 * Pure types only: imported by the SPA, the bridge (Workers) and the build.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong" | "em" | "del"; c: Inline[] }
  | { t: "code"; v: string }
  /** `href` is site-relative ("/market") or absolute https. */
  | { t: "link"; href: string; c: Inline[] }
  | { t: "br" }

export type CalloutKind = "note" | "tip" | "important" | "warning" | "caution"

export type Block =
  | { t: "p"; c: Inline[] }
  /** Depth 2-4 (the page title is the only h1); `id` is the anchor. */
  | { t: "h"; depth: 2 | 3 | 4; id: string; c: Inline[] }
  | { t: "ul"; items: Block[][] }
  | { t: "ol"; start: number; items: Block[][] }
  | { t: "callout"; kind: CalloutKind; c: Block[] }
  | { t: "quote"; c: Block[] }
  /** Screenshot: `src` is a hashed asset URL; `caption` from the image title. */
  | { t: "img"; src: string; alt: string; caption?: string }
  /** A paragraph holding only `[Label](/path "cta")`: rendered as a button. */
  | { t: "cta"; href: string; label: string }
  | { t: "code"; v: string }
  | { t: "hr" }

export interface CategoryMeta {
  /** URL segment, e.g. "buying". */
  id: string
  title: string
  description: string
  order: number
}

export interface GuideMeta {
  /** "category/slug", e.g. "buying/buy-an-item". */
  id: string
  category: string
  slug: string
  title: string
  /** First sentence of the guide; meta description and card text. */
  description: string
  order: number
  /** ISO date (YYYY-MM-DD). */
  updated: string
  author: string
  keywords: string[]
  /** Guide ids for "Next steps" (validated at build). */
  related: string[]
  /** Emit HowTo JSON-LD from the guide's "Steps" list. */
  howto: boolean
  /**
   * Published translations (content/guides/<category>/<slug>.<locale>.md
   * whose `source_hash` matches this English text). Missing and stale ones
   * aren't listed: those languages get the English guide.
   */
  translations: GuideTranslationMeta[]
}

/** A guide's metadata in another language (domain/locales.ts). */
export interface GuideTranslationMeta {
  /** A shipped locale other than English ("de", "zh-CN"). */
  locale: string
  title: string
  description: string
  keywords: string[]
  /** ISO date (YYYY-MM-DD): the translation's own, else the English guide's. */
  updated: string
}

export interface AboutMeta {
  title: string
  description: string
  updated: string
  author: string
}

/** A published changelog entry (content/changelog/<date>.md). */
export interface ChangelogMeta {
  /** URL segment and file name: the entry's date, "2026-11-02". */
  slug: string
  /** ISO date (YYYY-MM-DD), the same as `slug`. */
  date: string
  title: string
  /** Meta/OG description and the index card text. */
  summary: string
  tags: string[]
}

/** Body key of a changelog entry (content.ts `bodies`). */
export function changelogBodyKey(slug: string): string {
  return `changelog/${slug}`
}

/** A compiled page body (one lazy chunk per page in the SPA). */
export interface ContentBody {
  blocks: Block[]
  /** Plain-text steps of the first ordered list under a "Steps" heading. */
  steps: string[]
}

/** Everything the hub/category pages need, without bodies. */
export interface ContentIndex {
  categories: CategoryMeta[]
  guides: GuideMeta[]
  about: AboutMeta
  /** Published changelog entries, newest first. */
  changelog: ChangelogMeta[]
}

/** Every bridge asset carries the full directory (crawlable links). */
interface WithDirectory {
  directory: import("./directory").ContentDirectory
}

/** /content/bridge/guides/<category>/<slug>.json */
export interface GuideAsset extends WithDirectory {
  version: 1
  /**
   * The language of `guide` (title, description) and `body`: "en", or a
   * translation's locale for /content/bridge/guides/<category>/<slug>.<locale>.json.
   */
  locale: string
  guide: GuideMeta
  category: CategoryMeta
  body: ContentBody
  related: { href: string; text: string }[]
}

/** /content/bridge/guides/<category>.json */
export interface CategoryAsset extends WithDirectory {
  version: 1
  category: CategoryMeta
  guides: GuideMeta[]
}

/** /content/bridge/about.json */
export interface AboutAsset extends WithDirectory {
  version: 1
  about: AboutMeta
  body: ContentBody
}

/** /content/bridge/index.json */
export interface IndexAsset extends ContentIndex {
  version: 1
}

/**
 * /content/manifest.json: every content URL, for the backend sitemap
 * (sc-market-backend src/services/sitemap/content-manifest.ts).
 */
export interface SitemapManifest {
  version: 1
  pages: SitemapPage[]
}

export interface SitemapPage {
  /** Site-relative URL; a translated guide is its path plus `?lng=<locale>`. */
  path: string
  updated: string
  /** The page's language, on translated guides only (English otherwise). */
  lang?: string
  /**
   * A guide with published translations: every language version, itself
   * included, plus "x-default" (the English page), for the sitemap's
   * xhtml:link hreflang alternates.
   */
  alternates?: { hreflang: string; path: string }[]
}

/** Plain text of inline nodes (links flattened to their text). */
export function inlineText(nodes: readonly Inline[]): string {
  let out = ""
  for (const node of nodes) {
    switch (node.t) {
      case "text":
      case "code":
        out += node.v
        break
      case "br":
        out += " "
        break
      default:
        out += inlineText(node.c)
    }
  }
  return out
}
