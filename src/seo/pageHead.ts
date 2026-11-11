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

/** Separators a title may put between its parts ("-", "|", "—", "·", ":"). */
const TITLE_SEPARATOR = "[-|—–·:]"
const BRAND_SUFFIX = new RegExp(`\\s*${TITLE_SEPARATOR}\\s*SC Market\\s*$`, "i")
const BRAND_PREFIX = new RegExp(`^SC Market\\s*${TITLE_SEPARATOR}\\s*`, "i")
const LEADING_SEPARATOR = new RegExp(`^\\s*${TITLE_SEPARATOR}\\s*`)

/**
 * The title on an org's white-label domain: "<Org> — <page> · SC Market",
 * or "<Org> · SC Market" for the org's own page name alone. The page's own
 * SC Market branding and a leading org name are folded into that form, so
 * it is idempotent: "MEDRUNNER SERVICES - Org" and "MEDRUNNER SERVICES —
 * Org · SC Market" both give "MEDRUNNER SERVICES — Org · SC Market".
 */
export function applyWhiteLabelTitle(
  orgName: string,
  title: string | null | undefined,
): string {
  let page = (title ?? "")
    .trim()
    .replace(BRAND_SUFFIX, "")
    .replace(BRAND_PREFIX, "")
    .replace(/^SC Market$/i, "")
    .trim()
  if (page.toLowerCase().startsWith(orgName.toLowerCase())) {
    const rest = page.slice(orgName.length)
    // Only a whole leading name ("MEDRUNNER SERVICES - Org", not "MEDRUNNERS").
    if (rest === "" || /^\s/.test(rest) || LEADING_SEPARATOR.test(rest)) {
      page = rest.replace(LEADING_SEPARATOR, "").trim()
    }
  }
  return page ? `${orgName} — ${page} · SC Market` : `${orgName} · SC Market`
}

/** The org's host and name, for the white-label head rules. */
export interface WhiteLabelHeadOptions {
  orgName: string
  /** The white-label host's origin, e.g. https://medrunner.sc-market.space */
  origin: string
}

/**
 * A head tag as the white-label rules read it: Unhead's resolved HeadTag
 * shape (the browser's head), also parsed from a server render's head HTML
 * (whiteLabelPageHead). Values are raw (unescaped); `innerHTML` is a
 * script's JSON as serializeJsonLd wrote it.
 */
export interface HeadTagModel {
  tag: string
  props: Record<string, string>
  textContent?: string
  innerHTML?: string
}

const TITLE_META = new Set(["og:title", "twitter:title"])

function metaKey(tag: HeadTagModel): string | undefined {
  return tag.tag === "meta" ? (tag.props.property ?? tag.props.name) : undefined
}

/**
 * The white-label head rules, for a page shown on an org's own host. One
 * function for the server render (whiteLabelPageHead, the SSR `host`
 * variant) and the browser's head (whiteLabelHeadPlugin, Unhead), so the
 * two never disagree:
 *
 * - `<title>`, og:title and twitter:title in the white-label form
 *   (applyWhiteLabelTitle): the org and SC Market;
 * - og:site_name is the org's and twitter:domain its host, replacing the
 *   shell's (added when the page has none).
 *
 * URLs are left as the pages make them: canonical, og:url, twitter:url and
 * the JSON-LD's are the page's URL on sc-market.space (owner decision,
 * 2026-11-10: search engines see one site, the org's domain never competes
 * with it). Rewrites `tags` in place and returns the tags to add.
 */
export function applyWhiteLabelHeadRules(
  tags: HeadTagModel[],
  { orgName, origin }: WhiteLabelHeadOptions,
): HeadTagModel[] {
  const siteMeta: Record<string, string> = {
    "og:site_name": orgName,
    "twitter:domain": new URL(origin).host,
  }
  const seen = new Set<string>()

  for (const tag of tags) {
    if (tag.tag === "title" && tag.textContent !== undefined) {
      tag.textContent = applyWhiteLabelTitle(orgName, tag.textContent)
      continue
    }
    const key = metaKey(tag)
    if (!key) continue
    seen.add(key)
    if (TITLE_META.has(key) && tag.props.content !== undefined) {
      tag.props.content = applyWhiteLabelTitle(orgName, tag.props.content)
    } else if (key in siteMeta) {
      tag.props.content = siteMeta[key]
    }
  }

  const added: HeadTagModel[] = []
  for (const [key, content] of Object.entries(siteMeta)) {
    if (!seen.has(key)) {
      added.push({ tag: "meta", props: { property: key, content } })
    }
  }
  return added
}

const ATTR_UNESCAPE = (v: string) =>
  v
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
const ATTR_ESCAPE = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
const TEXT_ESCAPE = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** One tag of a head's HTML: `<title>`/`<script>` with content, or void. */
const HEAD_TAG_RE =
  /<(title|script)\b([^>]*)>([\s\S]*?)<\/\1>|<(meta|link)\b([^>]*)>/g
const ATTR_RE = /([^\s"'=/>]+)(?:="([^"]*)")?/g

function parseAttrs(attrs: string): Record<string, string> {
  const props: Record<string, string> = {}
  for (const [, name, value] of attrs.matchAll(ATTR_RE)) {
    props[name] = value === undefined ? "" : ATTR_UNESCAPE(value)
  }
  return props
}

/** The attributes' text with `props`' values written in (others as they were). */
function writeAttrs(attrs: string, props: Record<string, string>): string {
  return attrs.replace(ATTR_RE, (whole, name: string, value?: string) =>
    value === undefined || props[name] === undefined
      ? whole
      : `${name}="${ATTR_ESCAPE(props[name])}"`,
  )
}

function serializeAddedTag(tag: HeadTagModel): string {
  const attrs = Object.entries(tag.props)
    .map(([name, value]) => ` ${name}="${ATTR_ESCAPE(value)}"`)
    .join("")
  return `<${tag.tag}${attrs}>`
}

/**
 * A page's server-rendered head tags for the org's own white-label host
 * (the SSR `host` variant; the pages it renders there are the org's own,
 * the rest answer 302 to sc-market.space): applyWhiteLabelHeadRules on the
 * tags of the HTML. Changed tags keep their markup with the new values
 * (escaped); the added ones follow the page's.
 */
export function whiteLabelPageHead(
  headTags: string,
  options: WhiteLabelHeadOptions,
): string {
  const parsed: { match: RegExpExecArray; model: HeadTagModel }[] = []
  for (const match of headTags.matchAll(HEAD_TAG_RE)) {
    const [, contentTag, contentAttrs, content, voidTag, voidAttrs] = match
    const model: HeadTagModel = contentTag
      ? {
          tag: contentTag,
          props: parseAttrs(contentAttrs),
          ...(contentTag === "title"
            ? { textContent: ATTR_UNESCAPE(content) }
            : { innerHTML: content }),
        }
      : { tag: voidTag, props: parseAttrs(voidAttrs) }
    parsed.push({ match, model })
  }
  const before = parsed.map(({ model }) => JSON.stringify(model))
  const added = applyWhiteLabelHeadRules(
    parsed.map(({ model }) => model),
    options,
  )

  let out = ""
  let last = 0
  parsed.forEach(({ match, model }, i) => {
    out += headTags.slice(last, match.index)
    last = match.index + match[0].length
    if (JSON.stringify(model) === before[i]) {
      out += match[0]
      return
    }
    const [, contentTag, contentAttrs, , voidTag, voidAttrs] = match
    out += contentTag
      ? `<${contentTag}${writeAttrs(contentAttrs, model.props)}>${
          contentTag === "title"
            ? TEXT_ESCAPE(model.textContent ?? "")
            : (model.innerHTML ?? "")
        }</${contentTag}>`
      : `<${voidTag}${writeAttrs(voidAttrs, model.props)}>`
  })
  out += headTags.slice(last)
  return added.length > 0
    ? `${out}\n${added.map(serializeAddedTag).join("\n")}`
    : out
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
