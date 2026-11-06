/**
 * Pure, framework-free page head model shared by the SPA (rendered through
 * <SeoHead>) and the Cloudflare Pages Function bridge (rendered into the
 * static shell with HTMLRewriter). Builders in this folder must stay free of
 * browser globals, React, RTK and `import.meta.env` so they run in Workers.
 */

/** One <meta> tag: exactly one of `name` / `property` identifies it. */
export interface HeadMeta {
  name?: string
  property?: string
  content: string
}

export interface PageHead {
  /** Full document title as the page sets it (before the titleTemplate). */
  title?: string
  /** Absolute canonical URL. */
  canonical?: string
  meta: HeadMeta[]
  /** JSON-LD objects, one <script type="application/ld+json"> each. */
  jsonLd: object[]
  /**
   * `<link rel="alternate" hreflang>` for each language version (absolute
   * URLs), only where real translations exist (translated guides).
   */
  alternates?: { hreflang: string; href: string }[]
  /** The language of the page's content, for `<html lang>` (default: the UI's). */
  lang?: string
}

/**
 * Idempotent " - SC Market" title suffix. Single source of truth for the
 * Unhead titleTemplate (src/entry.client.tsx) and the bridge.
 */
export function applyTitleTemplate(title: string | null | undefined): string {
  if (!title) return "SC Market"
  return title.includes("SC Market") ? title : `${title} - SC Market`
}

/**
 * The title on an org's white-label subdomain: "<Org> — <page>", without
 * SC Market's suffix (the footer still says it's on SC Market). A title
 * that already starts with the org's name is kept; no title is the org.
 */
export function applyWhiteLabelTitle(
  orgName: string,
  title: string | null | undefined,
): string {
  const page = (title ?? "")
    .replace(/\s*[-|—–]\s*SC Market\s*$/i, "")
    .replace(/^SC Market$/i, "")
    .trim()
  if (!page) return orgName
  if (page.toLowerCase().startsWith(orgName.toLowerCase())) return page
  return `${orgName} — ${page}`
}

/**
 * Server-rendered head tags (the bridge's `<title>` and meta) with the
 * title in the white-label form (applyWhiteLabelTitle), for a page rendered
 * on the org's own host. The title text is HTML-escaped in the tags.
 */
export function whiteLabelHeadTitle(headTags: string, orgName: string): string {
  const unescape = (v: string) =>
    v.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  const escape = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return headTags.replace(
    /<title>([\s\S]*?)<\/title>/,
    (_match, title: string) =>
      `<title>${escape(applyWhiteLabelTitle(orgName, unescape(title)))}</title>`,
  )
}

/**
 * Serialize JSON-LD for inline <script> content. Escapes `<`, `>`, `&` and
 * U+2028/U+2029 as JSON unicode escapes so user content (e.g. a listing title
 * containing "</script>") can never close the script element. The output is
 * still valid JSON that parses to the same value.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

/** The og:/twitter: tags every detail page emits, in the pages' order. */
export function socialMeta(opts: {
  title: string
  description: string
  url?: string
  ogDescription?: string
  twitterDescription?: string
  image?: string
  ogType: string
  twitterCard: "summary" | "summary_large_image"
  /** Pages that set twitter:url explicitly (org, user). */
  twitterUrl?: boolean
}): HeadMeta[] {
  const meta: HeadMeta[] = [
    { property: "og:title", content: opts.title },
    {
      property: "og:description",
      content: opts.ogDescription ?? opts.description,
    },
  ]
  if (opts.url !== undefined)
    meta.push({ property: "og:url", content: opts.url })
  if (opts.image !== undefined) {
    meta.push({ property: "og:image", content: opts.image })
  }
  meta.push(
    { property: "og:type", content: opts.ogType },
    { name: "twitter:card", content: opts.twitterCard },
  )
  if (opts.twitterUrl && opts.url !== undefined) {
    meta.push({ name: "twitter:url", content: opts.url })
  }
  meta.push(
    { name: "twitter:title", content: opts.title },
    {
      name: "twitter:description",
      content: opts.twitterDescription ?? opts.description,
    },
  )
  if (opts.image !== undefined) {
    meta.push({ name: "twitter:image", content: opts.image })
  }
  return meta
}

/** FAQPage structured data for visible question/answer pairs. */
export function faqPageJsonLd(
  faqs: { question: string; answer: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}

/** The head's meta description (pages also pass it to their layout). */
export function headDescription(head: PageHead): string {
  return head.meta.find((m) => m.name === "description")?.content ?? ""
}

/**
 * The meta description StandardPageLayout renders: the page's own, or a
 * generic one built from its title.
 */
export function layoutDescription(
  title: string | null | undefined,
  description: string | undefined,
): string {
  return (
    description ||
    `${title || "SC Market"} - SC Market, the Star Citizen marketplace`
  )
}

/**
 * Unhead key of a page's BreadcrumbList JSON-LD (rendered as `data-hid` by
 * the bridge and the server renders). A page's own head (SeoHead, the
 * bridge's builders) and the layout's breadcrumbs (PageBreadcrumbs) both
 * describe the page's trail; with one key the page head's wins and the
 * page has a single BreadcrumbList, before and after hydrating.
 */
export const BREADCRUMB_JSONLD_KEY = "breadcrumb-ld"

/** Whether a JSON-LD object is a BreadcrumbList. */
export function isBreadcrumbJsonLd(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { "@type"?: unknown })["@type"] === "BreadcrumbList"
  )
}

/** BreadcrumbList structured data; `url` is absolute. */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
