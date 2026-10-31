// @vitest-environment node
import { describe, expect, it } from "vitest"
import { buildChangelogEntryHead, buildChangelogIndexHead } from "../contentHeads"
import type { ChangelogMeta } from "../../features/help/domain/types"

const ORIGIN = "https://sc-market.space"
const ENTRY: ChangelogMeta = {
  slug: "2026-11-02",
  date: "2026-11-02",
  title: "A new homepage",
  summary: "What changed this week.",
  tags: ["homepage", "market"],
}

function jsonLdOfType(head: { jsonLd: object[] }, type: string): Record<string, unknown> | undefined {
  return head.jsonLd.find((node) => (node as { "@type"?: string })["@type"] === type) as
    | Record<string, unknown>
    | undefined
}

describe("changelog heads", () => {
  it("index: an ItemList of the entries, indexable once one is published", () => {
    const head = buildChangelogIndexHead([ENTRY], ORIGIN)
    expect(head.canonical).toBe(`${ORIGIN}/changelog`)
    expect(head.meta.some((m) => m.name === "robots")).toBe(false)
    const page = jsonLdOfType(head, "CollectionPage")
    expect(page?.mainEntity).toEqual({
      "@type": "ItemList",
      numberOfItems: 1,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "A new homepage", url: `${ORIGIN}/changelog/2026-11-02` },
      ],
    })
  })

  it("index: noindex while nothing is published", () => {
    const head = buildChangelogIndexHead([], ORIGIN)
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex" })
    expect(jsonLdOfType(head, "CollectionPage")?.mainEntity).toBeUndefined()
  })

  it("entry: BlogPosting with its date, summary and tags", () => {
    const head = buildChangelogEntryHead(ENTRY, ORIGIN)
    expect(head.title).toBe("A new homepage — SC Market Changelog")
    expect(head.canonical).toBe(`${ORIGIN}/changelog/2026-11-02`)
    expect(head.meta).toContainEqual({ name: "description", content: "What changed this week." })
    expect(jsonLdOfType(head, "BlogPosting")).toMatchObject({
      headline: "A new homepage",
      datePublished: "2026-11-02",
      url: `${ORIGIN}/changelog/2026-11-02`,
      keywords: "homepage, market",
      inLanguage: "en",
    })
    expect(jsonLdOfType(head, "BreadcrumbList")).toBeDefined()
  })
})
