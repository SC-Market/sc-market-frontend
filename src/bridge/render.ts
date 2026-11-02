/**
 * Injects a BridgeDocument into the static SPA shell with Cloudflare's
 * HTMLRewriter (streaming; the shell is never buffered or string-parsed).
 *
 * Escaping rules (all user content — listing titles, descriptions,
 * usernames — goes through one of these):
 * - <title> and summary text: HTMLRewriter text content (`html: false`),
 *   escaped by the runtime.
 * - Attribute values of injected <meta>/<link>: escapeAttribute().
 * - JSON-LD: serializeJsonLd() (escapes < > & U+2028 U+2029), so content
 *   can't close the <script>.
 * - Summary links: href must be a site-relative path (isSafeHref) or one of
 *   the footer's fixed developer URLs (isDeveloperHref); a paragraph link
 *   ("external") only SC Orgs (isPartnerHref) or the open-data feed and
 *   its licence (isDataFeedHref). Every href goes through
 *   escapeAttribute(); link text is `html: false` text. At most
 *   MAX_SUMMARY_LINKS per list (and per text list: guide steps/bullets).
 */
import {
  BREADCRUMB_JSONLD_KEY,
  isBreadcrumbJsonLd,
  PageHead,
  serializeJsonLd,
} from "../seo/pageHead"
import type { BridgeDocument, SummaryBlock } from "./pages"
import { BRIDGE_SUMMARY_ATTRIBUTE } from "../document/bridgeSummary"
import {
  DEVELOPER_EXTERNAL_HREFS,
  DEVELOPER_LINKS,
  DEVELOPERS_HEADING,
} from "../components/footer/developerLinks"

/** The slice of Cloudflare's HTMLRewriter API the bridge uses. */
export interface RewriterContentOptions {
  html?: boolean
}
export interface RewriterElement {
  getAttribute(name: string): string | null
  setInnerContent(content: string, options?: RewriterContentOptions): unknown
  append(content: string, options?: RewriterContentOptions): unknown
  remove(): unknown
}
export interface RewriterHandlers {
  element?(element: RewriterElement): void | Promise<void>
}
export interface HtmlRewriterLike {
  on(selector: string, handlers: RewriterHandlers): HtmlRewriterLike
  transform(response: Response): Response
}
export type HtmlRewriterConstructor = new () => HtmlRewriterLike

/** A piece of markup to append: `html: false` content is escaped text. */
export interface HtmlChunk {
  content: string
  html: boolean
}

/** Escape a value for a double-quoted HTML attribute. */
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

const TEXT_TAGS: ReadonlySet<string> = new Set(["h1", "h2", "h3", "p"])

/** Most links one summary list renders (crawl discovery, kept bounded). */
export const MAX_SUMMARY_LINKS = 50

/**
 * Only site-relative paths: "/x", never "//host", "/\\host", a scheme
 * (javascript:, https:) or whitespace/control characters.
 */
export function isSafeHref(href: string): boolean {
  return /^\/(?![/\\])[^\s\u0000-\u001f\u007f]*$/.test(href)
}

/** Off-site links a summary may carry: SC Orgs pages only. */
export function isPartnerHref(href: string): boolean {
  return /^https:\/\/sc-orgs\.space\/[A-Za-z0-9/_%-]*$/.test(href)
}

/**
 * Open-data links a game item page cites: one item's public JSON feed
 * document (items or prices, by short slug) and the CC BY 4.0 licence.
 */
export function isDataFeedHref(href: string): boolean {
  return (
    /^https:\/\/api\.sc-market\.space\/api\/public\/(?:items|prices)\/[a-z0-9-]{1,200}\.json$/.test(href) ||
    href === "https://creativecommons.org/licenses/by/4.0/"
  )
}

/** The footer's off-site developer links (exact URLs, components/footer/developerLinks.ts). */
export function isDeveloperHref(href: string): boolean {
  return DEVELOPER_EXTERNAL_HREFS.has(href)
}

/**
 * The footer's "Developers" group, appended to every bridged page's summary
 * so crawlers see the same API links as the SPA footer.
 */
export const DEVELOPER_SUMMARY_BLOCKS: SummaryBlock[] = [
  { tag: "h2", text: DEVELOPERS_HEADING.label },
  { tag: "ul", links: DEVELOPER_LINKS.map((l) => ({ href: l.href, text: l.label })) },
]

/**
 * Markup appended to <head>: the page's meta/canonical/JSON-LD, plus
 * robots noindex for unknown entities.
 */
export function headMarkup(head: PageHead | null, canonical: string | null, noindex: boolean): string {
  const parts: string[] = []
  if (noindex) parts.push(`<meta name="robots" content="noindex">`)
  if (canonical) {
    parts.push(`<link rel="canonical" href="${escapeAttribute(canonical)}">`)
  }
  for (const meta of head?.meta ?? []) {
    const key = meta.name !== undefined ? "name" : "property"
    const value = meta.name ?? meta.property ?? ""
    parts.push(
      `<meta ${key}="${escapeAttribute(value)}" content="${escapeAttribute(meta.content)}">`,
    )
  }
  for (const data of head?.jsonLd ?? []) {
    // The BreadcrumbList carries its Unhead key, so the browser adopts it
    // instead of adding the layout's own (pageHead.ts BREADCRUMB_JSONLD_KEY).
    const hid = isBreadcrumbJsonLd(data) ? ` data-hid="${BREADCRUMB_JSONLD_KEY}"` : ""
    parts.push(`<script type="application/ld+json"${hid}>${serializeJsonLd(data)}</script>`)
  }
  return parts.join("")
}

/**
 * Visible summary for #root. It shows only until the SPA starts: the client
 * entry removes it (by its data-bridge-summary attribute) before hydrating
 * #root. Tags come from a fixed set; every text node is a `html: false` chunk.
 */
export function summaryChunks(blocks: SummaryBlock[]): HtmlChunk[] {
  const chunks: HtmlChunk[] = [
    {
      // Top spacing is padding, not margin: a margin collapses through
      // <body>, so the page sat 32px low and shifted up when the app mounted.
      content: `<main ${BRIDGE_SUMMARY_ATTRIBUTE} style="max-width:720px;margin:0 auto;padding:32px 16px">`,
      html: true,
    },
  ]
  for (const block of blocks) {
    if (block.tag === "ul") {
      const links = block.links
        .filter((l) => isSafeHref(l.href) || isDeveloperHref(l.href))
        .slice(0, MAX_SUMMARY_LINKS)
      if (links.length === 0) continue
      chunks.push({ content: "<ul>", html: true })
      for (const link of links) {
        const rel =
          link.rel === "prev" || link.rel === "next"
            ? ` rel="${link.rel}"`
            : isDeveloperHref(link.href)
              ? ` rel="noopener"`
              : ""
        chunks.push(
          { content: `<li><a href="${escapeAttribute(link.href)}"${rel}>`, html: true },
          { content: link.text, html: false },
          { content: "</a></li>", html: true },
        )
      }
      chunks.push({ content: "</ul>", html: true })
      continue
    }
    if (block.tag === "external") {
      if (!isPartnerHref(block.href) && !isDataFeedHref(block.href)) continue
      const rel = block.href.startsWith("https://creativecommons.org/") ? "license noopener" : "noopener"
      chunks.push(
        { content: `<p><a href="${escapeAttribute(block.href)}" rel="${rel}">`, html: true },
        { content: block.text, html: false },
        { content: "</a></p>", html: true },
      )
      continue
    }
    if ("items" in block) {
      const items = block.items.filter((item) => item.trim() !== "").slice(0, MAX_SUMMARY_LINKS)
      if (items.length === 0) continue
      const tag = block.tag === "ol" ? "ol" : "ul"
      chunks.push({ content: `<${tag}>`, html: true })
      for (const item of items) {
        chunks.push(
          { content: "<li>", html: true },
          { content: item, html: false },
          { content: "</li>", html: true },
        )
      }
      chunks.push({ content: `</${tag}>`, html: true })
      continue
    }
    if (!TEXT_TAGS.has(block.tag)) continue
    chunks.push(
      { content: `<${block.tag}>`, html: true },
      { content: block.text, html: false },
      { content: `</${block.tag}>`, html: true },
    )
  }
  chunks.push({ content: "</main>", html: true })
  return chunks
}

/**
 * The summary's link lists (each with the heading right before it) and
 * partner links: what a server-rendered page adds to its own body so its
 * HTML links to everything the bridge's summary links to (seller, related
 * and similar pages). Text-only blocks are dropped (the page says them).
 */
export function relatedLinkBlocks(blocks: SummaryBlock[]): SummaryBlock[] {
  const kept: SummaryBlock[] = []
  blocks.forEach((block, i) => {
    if (block.tag !== "ul" && block.tag !== "external") return
    const before = blocks[i - 1]
    if (block.tag === "ul" && before && (before.tag === "h2" || before.tag === "h3")) kept.push(before)
    kept.push(block)
  })
  return kept
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * relatedLinkBlocks as one HTML string (same tags, link checks and escaping
 * as the bridge's summary) for the end of a server-rendered #root. Marked
 * like the summary, so the browser removes it before hydrating; "" when
 * there are no links.
 */
export function relatedLinksHtml(blocks: SummaryBlock[]): string {
  const related = relatedLinkBlocks(blocks)
  // summaryChunks wraps the blocks in <main …>…</main>; keep only the inside.
  const inner = summaryChunks(related).slice(1, -1)
  if (!inner.some((chunk) => chunk.html && chunk.content.includes("<a "))) return ""
  const body = inner.map((chunk) => (chunk.html ? chunk.content : escapeText(chunk.content))).join("")
  return `<nav ${BRIDGE_SUMMARY_ATTRIBUTE} aria-label="Related pages" style="max-width:720px;margin:0 auto;padding:16px">${body}</nav>`
}

/** Keys (name= or property=) of the shell's <meta> tags the page replaces. */
function managedMetaKeys(head: PageHead | null, noindex: boolean): Set<string> {
  const keys = new Set<string>()
  for (const meta of head?.meta ?? []) {
    const key = meta.name ?? meta.property
    if (key) keys.add(key)
  }
  if (noindex) keys.add("robots")
  return keys
}

export type RenderInput =
  | { kind: "page"; doc: BridgeDocument }
  | { kind: "notFound" }

/**
 * Rewrite the shell. For a page: replace <title>, swap the shell's generic
 * description/og:/twitter: tags for the page's, add canonical + JSON-LD,
 * and put the summary in #root. For an unknown entity: only add
 * robots noindex (the response status is set to 404 by the caller).
 */
export function rewriteShell(
  shell: Response,
  input: RenderInput,
  HTMLRewriter: HtmlRewriterConstructor,
): Response {
  const doc = input.kind === "page" ? input.doc : null
  const noindex = input.kind === "notFound"
  const metaKeys = managedMetaKeys(doc?.head ?? null, noindex)

  let rewriter = new HTMLRewriter()
    .on("meta", {
      element(el) {
        const name = el.getAttribute("name")
        const property = el.getAttribute("property")
        if ((name && metaKeys.has(name)) || (property && metaKeys.has(property))) {
          el.remove()
        }
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        if (doc) el.remove()
      },
    })
    .on("head", {
      element(el) {
        el.append(headMarkup(doc?.head ?? null, doc?.canonical ?? null, noindex), {
          html: true,
        })
      },
    })

  if (doc) {
    rewriter = rewriter
      .on("title", {
        element(el) {
          el.setInnerContent(doc.title, { html: false })
        },
      })
      .on("div#root", {
        element(el) {
          for (const chunk of summaryChunks([...doc.summary, ...DEVELOPER_SUMMARY_BLOCKS])) {
            el.append(chunk.content, { html: chunk.html })
          }
        },
      })
  }

  return rewriter.transform(shell)
}
