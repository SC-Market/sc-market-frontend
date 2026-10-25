/**
 * Bridge pages for Help & Guides and About. Unlike the other pages they read
 * no API: the content build emits one JSON file per page into dist/
 * (scripts/vite/contentPlugin.ts), fetched through env.ASSETS by handler.ts.
 * The whole guide is rendered as plain text (headings, paragraphs, step
 * lists, callouts as "Tip: …"), plus a bounded list of the site links it
 * mentions, with the same heads the SPA renders (src/seo/contentHeads.ts).
 */
import type { Block, CategoryMeta, GuideMeta, Inline } from "../features/help/domain/types"
import {
  inlineText,
  type AboutAsset,
  type CategoryAsset,
  type GuideAsset,
  type IndexAsset,
} from "../features/help/domain/types"
import { CONTENT_ASSET_PATHS } from "../features/help/domain/assetPaths"
import { HELP_PATHS } from "../routes/paths"
import {
  aboutTitle,
  buildAboutHead,
  buildGuideCategoryHead,
  buildGuideHead,
  buildGuidesHubHead,
  guideLink,
  guideTitle,
  HELP_HUB_NAME,
  helpHubSeoText,
} from "../seo/contentHeads"
import { applyTitleTemplate } from "../seo/pageHead"
import type { SeoLink } from "../seo/siteHeads"
import type { BridgePage, BridgeDocument, PageContext, SummaryBlock } from "./pages"

/** URL segments the content build accepts (kebab-case); anything else is a 404. */
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const CALLOUT_LABEL = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
} as const

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

function collectLinks(nodes: readonly Inline[], links: SeoLink[]) {
  for (const node of nodes) {
    if (node.t === "link") {
      if (node.href.startsWith("/")) links.push({ href: node.href, text: clean(inlineText(node.c)) })
      collectLinks(node.c, links)
    } else if (node.t === "strong" || node.t === "em" || node.t === "del") {
      collectLinks(node.c, links)
    }
  }
}

function itemText(blocks: readonly Block[], links: SeoLink[]): string {
  return clean(
    blocksToSummary(blocks, links)
      .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join("; ") : ""))
      .join(" "),
  )
}

/** Blocks as escaped-text summary blocks; site links are collected into `links`. */
export function blocksToSummary(blocks: readonly Block[], links: SeoLink[]): SummaryBlock[] {
  const out: SummaryBlock[] = []
  for (const block of blocks) {
    switch (block.t) {
      case "p":
        collectLinks(block.c, links)
        out.push({ tag: "p", text: clean(inlineText(block.c)) })
        break
      case "h":
        out.push({ tag: block.depth === 2 ? "h2" : "h3", text: clean(inlineText(block.c)) })
        break
      case "ul":
        out.push({ tag: "ul-text", items: block.items.map((item) => itemText(item, links)) })
        break
      case "ol":
        out.push({ tag: "ol", items: block.items.map((item) => itemText(item, links)) })
        break
      case "callout":
        out.push({ tag: "p", text: `${CALLOUT_LABEL[block.kind]}: ${itemText(block.c, links)}` })
        break
      case "quote":
        out.push({ tag: "p", text: itemText(block.c, links) })
        break
      case "cta":
        if (block.href.startsWith("/")) links.push({ href: block.href, text: block.label })
        break
      case "code":
        out.push({ tag: "p", text: block.v })
        break
      case "img":
      case "hr":
        break
    }
  }
  return out
}

function dedupe(links: SeoLink[]): SeoLink[] {
  const seen = new Set<string>()
  return links.filter((link) => {
    if (seen.has(link.href)) return false
    seen.add(link.href)
    return true
  })
}

function isVersioned<T>(json: unknown): json is T {
  return typeof json === "object" && json !== null && (json as { version?: unknown }).version === 1
}

function asset<T>(json: unknown, name: string): T {
  if (!isVersioned<T>(json)) throw new Error(`unexpected ${name} asset`)
  return json
}

function updatedLine(updated: string, author: string): SummaryBlock {
  return { tag: "p", text: `Updated ${updated} by ${author}` }
}

function categoryLinks(category: CategoryMeta, guides: readonly GuideMeta[]): SeoLink[] {
  return guides.filter((g) => g.category === category.id).map(guideLink)
}

export const CONTENT_PAGES: Record<"guidesHub" | "guideCategory" | "guide" | "about", BridgePage> = {
  guidesHub: {
    asset: () => CONTENT_ASSET_PATHS.index,
    build: (json, _s, ctx: PageContext): BridgeDocument => {
      const index = asset<IndexAsset>(json, "index")
      const head = buildGuidesHubHead(index, ctx.origin)
      return {
        title: applyTitleTemplate(head.title),
        canonical: head.canonical ?? `${ctx.origin}${HELP_PATHS.hub}`,
        head,
        summary: [
          { tag: "h1", text: HELP_HUB_NAME },
          { tag: "p", text: helpHubSeoText.description },
          ...index.categories.flatMap((category): SummaryBlock[] => [
            { tag: "h2", text: category.title },
            { tag: "p", text: category.description },
            {
              tag: "ul",
              links: [
                { href: HELP_PATHS.category(category.id), text: `All ${category.title} guides` },
                ...categoryLinks(category, index.guides),
              ],
            },
          ]),
          { tag: "ul", links: [{ href: HELP_PATHS.about, text: index.about.title }] },
        ],
      }
    },
  },

  guideCategory: {
    asset: (params) => (SEGMENT.test(params.category) ? CONTENT_ASSET_PATHS.category(params.category) : null),
    build: (json, _s, ctx): BridgeDocument => {
      const { category, guides } = asset<CategoryAsset>(json, "category")
      const head = buildGuideCategoryHead(category, guides, ctx.origin)
      return {
        title: applyTitleTemplate(head.title),
        canonical: head.canonical ?? `${ctx.origin}${HELP_PATHS.category(category.id)}`,
        head,
        summary: [
          { tag: "h1", text: category.title },
          { tag: "p", text: category.description },
          ...guides.flatMap((guide): SummaryBlock[] => [
            { tag: "h2", text: guide.title },
            { tag: "p", text: guide.description },
          ]),
          { tag: "ul", links: [...guides.map(guideLink), { href: HELP_PATHS.hub, text: HELP_HUB_NAME }] },
        ],
      }
    },
  },

  guide: {
    asset: (params) =>
      SEGMENT.test(params.category) && SEGMENT.test(params.slug)
        ? CONTENT_ASSET_PATHS.guide(params.category, params.slug)
        : null,
    build: (json, _s, ctx): BridgeDocument => {
      const page = asset<GuideAsset>(json, "guide")
      const head = buildGuideHead(page.guide, page.category, page.body.steps, ctx.origin)
      const links: SeoLink[] = []
      const body = blocksToSummary(page.body.blocks, links)
      return {
        title: applyTitleTemplate(guideTitle(page.guide)),
        canonical: head.canonical ?? `${ctx.origin}${ctx.pathname}`,
        head,
        summary: [
          { tag: "h1", text: page.guide.title },
          updatedLine(page.guide.updated, page.guide.author),
          ...body,
          { tag: "h2", text: "Related" },
          {
            tag: "ul",
            links: dedupe([
              ...page.related,
              ...links,
              { href: HELP_PATHS.category(page.category.id), text: `More ${page.category.title} guides` },
              { href: HELP_PATHS.hub, text: HELP_HUB_NAME },
            ]),
          },
        ],
      }
    },
  },

  about: {
    asset: () => CONTENT_ASSET_PATHS.about,
    build: (json, _s, ctx): BridgeDocument => {
      const page = asset<AboutAsset>(json, "about")
      const head = buildAboutHead(page.about, ctx.origin)
      const links: SeoLink[] = []
      const body = blocksToSummary(page.body.blocks, links)
      return {
        title: applyTitleTemplate(aboutTitle(page.about)),
        canonical: head.canonical ?? `${ctx.origin}${HELP_PATHS.about}`,
        head,
        summary: [
          { tag: "h1", text: page.about.title },
          updatedLine(page.about.updated, page.about.author),
          ...body,
          { tag: "ul", links: dedupe([...links, { href: HELP_PATHS.hub, text: HELP_HUB_NAME }]) },
        ],
      }
    },
  },
}
