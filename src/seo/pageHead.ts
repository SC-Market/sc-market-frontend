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
}

/**
 * Idempotent " - SC Market" title suffix. Single source of truth for the
 * Unhead titleTemplate (src/index.tsx) and the bridge.
 */
export function applyTitleTemplate(title: string | null | undefined): string {
  if (!title) return "SC Market"
  return title.includes("SC Market") ? title : `${title} - SC Market`
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
  if (opts.url !== undefined) meta.push({ property: "og:url", content: opts.url })
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
