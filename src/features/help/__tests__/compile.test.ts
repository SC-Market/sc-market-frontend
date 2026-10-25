// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  compileBody,
  compileSite,
  ContentError,
  DEFAULT_AUTHOR,
  parseFrontmatter,
  sitemapManifest,
  type SourceFile,
} from "../build/compile"

const F = "guides/x/y.md"

describe("parseFrontmatter", () => {
  it("parses the supported YAML subset", () => {
    const { data, body } = parseFrontmatter(
      `---\ntitle: "Sell items: a guide"\norder: 20\nhowto: true\nkeywords: [a, "b c"]\n# comment\n---\nBody\n`,
      F,
    )
    expect(data).toEqual({ title: "Sell items: a guide", order: 20, howto: true, keywords: ["a", "b c"] })
    expect(body).toBe("Body\n")
  })

  it.each([
    ["no frontmatter", "Body"],
    ["unterminated", "---\ntitle: x\n"],
    ["not key: value", "---\n- item\n---\nBody"],
    ["repeated key", "---\na: 1\na: 2\n---\nBody"],
    ["unterminated list", "---\na: [x\n---\nBody"],
  ])("rejects %s", (_name, source) => {
    expect(() => parseFrontmatter(source, F)).toThrow(ContentError)
  })
})

describe("compileBody", () => {
  it("compiles paragraphs, headings with anchors, lists and inline marks", () => {
    const { blocks, links } = compileBody(
      "Intro with **bold**, *em*, `code` and a [cart](/market/cart).\n\n## Steps\n\n1. One\n2. Two [x](https://example.com)\n\n## Steps\n\n- a\n",
      F,
    )
    expect(blocks[0]).toEqual({
      t: "p",
      c: [
        { t: "text", v: "Intro with " },
        { t: "strong", c: [{ t: "text", v: "bold" }] },
        { t: "text", v: ", " },
        { t: "em", c: [{ t: "text", v: "em" }] },
        { t: "text", v: ", " },
        { t: "code", v: "code" },
        { t: "text", v: " and a " },
        { t: "link", href: "/market/cart", c: [{ t: "text", v: "cart" }] },
        { t: "text", v: "." },
      ],
    })
    expect(blocks[1]).toMatchObject({ t: "h", depth: 2, id: "steps" })
    expect(blocks[2]).toMatchObject({ t: "ol", start: 1 })
    // Duplicate heading text gets a unique anchor.
    expect(blocks[3]).toMatchObject({ t: "h", id: "steps-1" })
    expect(blocks[4]).toMatchObject({ t: "ul" })
    // Only site-relative links are collected for the route check.
    expect(links).toEqual(["/market/cart"])
  })

  it("extracts HowTo steps from the first numbered list under 'Steps'", () => {
    const { steps } = compileBody("1. Not this\n\n## Steps\n\n1. Open **Cart**.\n2. Click [here](/x).\n", F)
    expect(steps).toEqual(["Open Cart.", "Click here."])
  })

  it("turns GitHub alerts into callouts", () => {
    const { blocks } = compileBody("> [!TIP]\n> Use **Skip**.\n\n> Plain quote\n", F)
    expect(blocks[0]).toEqual({
      t: "callout",
      kind: "tip",
      c: [{ t: "p", c: [{ t: "text", v: "Use " }, { t: "strong", c: [{ t: "text", v: "Skip" }] }, { t: "text", v: "." }] }],
    })
    expect(blocks[1]).toMatchObject({ t: "quote" })
  })

  it("turns a lone titled link into a CTA and a lone image into a screenshot", () => {
    const { blocks, links, images } = compileBody(
      '[Open cart](/market/cart "cta")\n\n![The cart](./img/cart.webp "Items grouped by seller")\n',
      F,
      { resolveImage: (src) => `/assets/${src.slice(6)}` },
    )
    expect(blocks).toEqual([
      { t: "cta", href: "/market/cart", label: "Open cart" },
      { t: "img", src: "/assets/cart.webp", alt: "The cart", caption: "Items grouped by seller" },
    ])
    expect(links).toEqual(["/market/cart"])
    expect(images).toEqual(["./img/cart.webp"])
  })

  it.each([
    ["raw HTML", "<div>x</div>"],
    ["inline HTML", "a <b>x</b>"],
    ["an h1", "# Title"],
    ["a table", "| a |\n|---|\n| b |"],
    ["a javascript: link", "[x](javascript:alert(1))"],
    ["a protocol-relative link", "[x](//evil.example)"],
    ["an http link", "[x](http://example.com)"],
    ["a remote image", "![x](https://example.com/x.png)"],
    ["an image without alt", "![](./img/x.webp)"],
    ["an inline image", "text ![x](./img/x.webp)"],
    ["a reference link", "[x][y]\n\n[y]: /market"],
    ["an empty body", ""],
  ])("rejects %s", (_name, markdown) => {
    expect(() => compileBody(markdown, F)).toThrow(ContentError)
  })
})

function site(overrides: Record<string, string> = {}): SourceFile[] {
  const files: Record<string, string> = {
    "guides/categories.json": JSON.stringify([
      { id: "buying", title: "Buying", description: "Buy things.", order: 1 },
    ]),
    "guides/buying/buy-an-item.md":
      "---\ntitle: Buy an item\ndescription: Buy it.\nupdated: 2026-01-02\nhowto: true\n---\n## Steps\n\n1. Do it.\n",
    "about.md": "---\ntitle: About\ndescription: About us.\nupdated: 2026-01-01\n---\nHello.\n",
    "STYLE.md": "# not a page",
    ...overrides,
  }
  return Object.entries(files).map(([path, source]) => ({ path, source }))
}

const today = "2026-06-01"

describe("compileSite", () => {
  it("compiles guides with defaults and builds the sitemap manifest", () => {
    const compiled = compileSite(site(), { today })
    expect(compiled.guides.map((g) => g.meta)).toEqual([
      {
        id: "buying/buy-an-item",
        category: "buying",
        slug: "buy-an-item",
        title: "Buy an item",
        description: "Buy it.",
        order: 100,
        updated: "2026-01-02",
        author: DEFAULT_AUTHOR,
        keywords: [],
        related: [],
        howto: true,
      },
    ])
    expect(DEFAULT_AUTHOR).toBe("Khuzdul")
    expect(sitemapManifest(compiled)).toEqual({
      version: 1,
      pages: [
        { path: "/guides", updated: "2026-01-02" },
        { path: "/guides/buying", updated: "2026-01-02" },
        { path: "/guides/buying/buy-an-item", updated: "2026-01-02" },
        { path: "/about", updated: "2026-01-01" },
      ],
    })
  })

  it("drops drafts unless asked to keep them", () => {
    const files = site({
      "guides/buying/later.md": "---\ntitle: Later\ndescription: Soon.\nupdated: 2026-01-01\ndraft: true\n---\nWIP\n",
    })
    expect(compileSite(files, { today }).guides).toHaveLength(1)
    expect(compileSite(files, { today, includeDrafts: true }).guides).toHaveLength(2)
  })

  it.each([
    ["an unknown category", { "guides/selling/x.md": "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\n---\nX\n" }],
    ["a future update date", { "guides/buying/buy-an-item.md": "---\ntitle: X\ndescription: X.\nupdated: 2027-01-01\n---\nX\n" }],
    ["a missing description", { "guides/buying/buy-an-item.md": "---\ntitle: X\nupdated: 2026-01-01\n---\nX\n" }],
    ["a long description", { "guides/buying/buy-an-item.md": `---\ntitle: X\ndescription: ${"x".repeat(161)}\nupdated: 2026-01-01\n---\nX\n` }],
    ["an unknown key", { "guides/buying/buy-an-item.md": "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\ncolor: red\n---\nX\n" }],
    ["a missing related guide", { "guides/buying/buy-an-item.md": "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\nrelated: [buying/nope]\n---\nX\n" }],
    ["howto without steps", { "guides/buying/buy-an-item.md": "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\nhowto: true\n---\nX\n" }],
    ["a bad file name", { "guides/buying/Bad_Name.md": "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\n---\nX\n" }],
    ["an empty category", { "guides/categories.json": JSON.stringify([
      { id: "buying", title: "Buying", description: "B.", order: 1 },
      { id: "empty", title: "Empty", description: "E.", order: 2 },
    ]) }],
  ])("fails the build on %s, naming the file", (_name, overrides) => {
    expect(() => compileSite(site(overrides), { today })).toThrow(ContentError)
  })
})
