// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  changelogFeed,
  changelogStatus,
  compileBody,
  compileSite,
  contentIndex,
  ContentError,
  DEFAULT_AUTHOR,
  parseFrontmatter,
  guideAsset,
  sitemapManifest,
  sourceHash,
  type SourceFile,
} from "../build/compile"

const F = "guides/x/y.md"

describe("parseFrontmatter", () => {
  it("parses the supported YAML subset", () => {
    const { data, body } = parseFrontmatter(
      `---\ntitle: "Sell items: a guide"\norder: 20\nhowto: true\nkeywords: [a, "b c"]\n# comment\n---\nBody\n`,
      F,
    )
    expect(data).toEqual({
      title: "Sell items: a guide",
      order: 20,
      howto: true,
      keywords: ["a", "b c"],
    })
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
    const { steps } = compileBody(
      "1. Not this\n\n## Steps\n\n1. Open **Cart**.\n2. Click [here](/x).\n",
      F,
    )
    expect(steps).toEqual(["Open Cart.", "Click here."])
  })

  it("turns GitHub alerts into callouts", () => {
    const { blocks } = compileBody(
      "> [!TIP]\n> Use **Skip**.\n\n> Plain quote\n",
      F,
    )
    expect(blocks[0]).toEqual({
      t: "callout",
      kind: "tip",
      c: [
        {
          t: "p",
          c: [
            { t: "text", v: "Use " },
            { t: "strong", c: [{ t: "text", v: "Skip" }] },
            { t: "text", v: "." },
          ],
        },
      ],
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
      {
        t: "img",
        src: "/assets/cart.webp",
        alt: "The cart",
        caption: "Items grouped by seller",
      },
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
    "about.md":
      "---\ntitle: About\ndescription: About us.\nupdated: 2026-01-01\n---\nHello.\n",
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
        translations: [],
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
      "guides/buying/later.md":
        "---\ntitle: Later\ndescription: Soon.\nupdated: 2026-01-01\ndraft: true\n---\nWIP\n",
    })
    expect(compileSite(files, { today }).guides).toHaveLength(1)
    expect(
      compileSite(files, { today, includeDrafts: true }).guides,
    ).toHaveLength(2)
  })

  it.each([
    [
      "an unknown category",
      {
        "guides/selling/x.md":
          "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\n---\nX\n",
      },
    ],
    [
      "a future update date",
      {
        "guides/buying/buy-an-item.md":
          "---\ntitle: X\ndescription: X.\nupdated: 2027-01-01\n---\nX\n",
      },
    ],
    [
      "a missing description",
      {
        "guides/buying/buy-an-item.md":
          "---\ntitle: X\nupdated: 2026-01-01\n---\nX\n",
      },
    ],
    [
      "a long description",
      {
        "guides/buying/buy-an-item.md": `---\ntitle: X\ndescription: ${"x".repeat(161)}\nupdated: 2026-01-01\n---\nX\n`,
      },
    ],
    [
      "an unknown key",
      {
        "guides/buying/buy-an-item.md":
          "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\ncolor: red\n---\nX\n",
      },
    ],
    [
      "a missing related guide",
      {
        "guides/buying/buy-an-item.md":
          "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\nrelated: [buying/nope]\n---\nX\n",
      },
    ],
    [
      "howto without steps",
      {
        "guides/buying/buy-an-item.md":
          "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\nhowto: true\n---\nX\n",
      },
    ],
    [
      "a bad file name",
      {
        "guides/buying/Bad_Name.md":
          "---\ntitle: X\ndescription: X.\nupdated: 2026-01-01\n---\nX\n",
      },
    ],
    [
      "an empty category",
      {
        "guides/categories.json": JSON.stringify([
          { id: "buying", title: "Buying", description: "B.", order: 1 },
          { id: "empty", title: "Empty", description: "E.", order: 2 },
        ]),
      },
    ],
  ])("fails the build on %s, naming the file", (_name, overrides) => {
    expect(() => compileSite(site(overrides), { today })).toThrow(ContentError)
  })
})

const ENGLISH_BODY = "## Steps\n\n1. Do it.\n"

function translation(hash: string, extra = "", body = ""): string {
  return `---\ntitle: Einen Artikel kaufen\ndescription: Kaufen.\nsource_hash: ${hash}\n${extra}---\n${body || "## Schritte\n\n1. Mach es.\n"}`
}

describe("guide translations", () => {
  const hash = sourceHash(ENGLISH_BODY)

  it("hashes the English body, ignoring line endings and outer whitespace", () => {
    expect(hash).toMatch(/^[0-9a-f]{12}$/)
    expect(sourceHash("\n## Steps\r\n\r\n1. Do it.\r\n\n")).toBe(hash)
    expect(sourceHash("## Steps\n\n1. Do it now.\n")).not.toBe(hash)
  })

  it("accepts a quoted all-digit source_hash", () => {
    const compiled = compileSite(
      site({
        "guides/buying/buy-an-item.de.md": translation('"123456789012"'),
      }),
      { today },
    )
    expect(compiled.guides[0].translations[0]).toMatchObject({
      sourceHash: "123456789012",
      status: "stale",
    })
  })

  it("publishes a translation whose source_hash matches the English body", () => {
    const compiled = compileSite(
      site({ "guides/buying/buy-an-item.de.md": translation(hash) }),
      { today },
    )
    const [guide] = compiled.guides
    expect(guide.sourceHash).toBe(hash)
    expect(guide.translations).toHaveLength(1)
    expect(guide.translations[0]).toMatchObject({
      locale: "de",
      status: "published",
      file: "guides/buying/buy-an-item.de.md",
    })
    expect(guide.meta.translations).toEqual([
      {
        locale: "de",
        title: "Einen Artikel kaufen",
        description: "Kaufen.",
        keywords: [],
        updated: "2026-01-02",
      },
    ])
    // Same anchors as English, steps from the list under the same heading.
    const body = guide.translations[0].body
    expect(body.blocks[0]).toMatchObject({ t: "h", id: "steps" })
    expect(body.steps).toEqual(["Mach es."])
    // Its own bridge file, in German.
    const asset = guideAsset(compiled, guide, guide.translations[0])
    expect(asset.locale).toBe("de")
    expect(asset.guide.title).toBe("Einen Artikel kaufen")
    expect(guideAsset(compiled, guide).locale).toBe("en")
  })

  it("keeps a stale translation out of the published metadata", () => {
    const compiled = compileSite(
      site({
        "guides/buying/buy-an-item.fr.md": translation("0123456789ab"),
      }),
      { today },
    )
    const [guide] = compiled.guides
    expect(guide.translations.map((t) => [t.locale, t.status])).toEqual([
      ["fr", "stale"],
    ])
    expect(guide.meta.translations).toEqual([])
    expect(sitemapManifest(compiled).pages).toContainEqual({
      path: "/guides/buying/buy-an-item",
      updated: "2026-01-02",
    })
  })

  it("lists each published translation in the sitemap with hreflang alternates", () => {
    const compiled = compileSite(
      site({
        "guides/buying/buy-an-item.de.md": translation(
          hash,
          "updated: 2026-01-05\n",
        ),
        "guides/buying/buy-an-item.zh-CN.md": translation(hash),
        "guides/buying/buy-an-item.ja.md": translation("0123456789ab"),
      }),
      { today },
    )
    const alternates = [
      { hreflang: "en", path: "/guides/buying/buy-an-item" },
      { hreflang: "de", path: "/guides/buying/buy-an-item?lng=de" },
      { hreflang: "zh-CN", path: "/guides/buying/buy-an-item?lng=zh-CN" },
      { hreflang: "x-default", path: "/guides/buying/buy-an-item" },
    ]
    const guidePages = sitemapManifest(compiled).pages.filter((p) =>
      p.path.startsWith("/guides/buying/"),
    )
    expect(guidePages).toEqual([
      { path: "/guides/buying/buy-an-item", updated: "2026-01-02", alternates },
      {
        path: "/guides/buying/buy-an-item?lng=de",
        updated: "2026-01-05",
        lang: "de",
        alternates,
      },
      {
        path: "/guides/buying/buy-an-item?lng=zh-CN",
        updated: "2026-01-02",
        lang: "zh-CN",
        alternates,
      },
    ])
  })

  it("drops the translations of a draft guide with it", () => {
    const files = site({
      "guides/buying/later.md":
        "---\ntitle: Later\ndescription: Soon.\nupdated: 2026-01-01\ndraft: true\n---\nWIP\n",
      "guides/buying/later.de.md": translation("0123456789ab"),
    })
    expect(compileSite(files, { today }).guides).toHaveLength(1)
  })

  it.each([
    ["an unknown locale", "guides/buying/buy-an-item.pt.md", translation(hash)],
    [
      "English as a translation",
      "guides/buying/buy-an-item.en.md",
      translation(hash),
    ],
    ["no English guide", "guides/buying/nope.de.md", translation(hash)],
    [
      "a missing source_hash",
      "guides/buying/buy-an-item.de.md",
      "---\ntitle: T\ndescription: D.\n---\nX\n",
    ],
    [
      "a malformed source_hash",
      "guides/buying/buy-an-item.de.md",
      translation("abc"),
    ],
    [
      "an unquoted all-digit source_hash",
      "guides/buying/buy-an-item.de.md",
      translation("123456789012"),
    ],
    [
      "a key only English guides have",
      "guides/buying/buy-an-item.de.md",
      translation(hash, "related: [buying/buy-an-item]\n"),
    ],
    [
      "invalid Markdown",
      "guides/buying/buy-an-item.de.md",
      translation(hash, "", "<div>x</div>\n"),
    ],
  ])("fails the build on %s", (_name, file, source) => {
    expect(() => compileSite(site({ [file]: source }), { today })).toThrow(
      ContentError,
    )
  })
})

function entry(date: string, status: string, extra = ""): string {
  return `---\ntitle: "Week of ${date}"\ndate: ${date}\nsummary: "What changed."\ntags: [market, orders]\nstatus: ${status}\n${extra}---\n## Market\n\nSee the [market](/market).\n`
}

describe("changelog", () => {
  const files = site({
    "changelog/2026-05-04.md": entry("2026-05-04", "published"),
    "changelog/2026-05-11.md": entry("2026-05-11", "published"),
    "changelog/2026-05-18.md": entry("2026-05-18", "draft"),
  })

  it("compiles published entries newest first and drops drafts entirely", () => {
    const compiled = compileSite(files, { today })
    expect(compiled.changelog.map((e) => e.meta)).toEqual([
      {
        slug: "2026-05-11",
        date: "2026-05-11",
        title: "Week of 2026-05-11",
        summary: "What changed.",
        tags: ["market", "orders"],
      },
      {
        slug: "2026-05-04",
        date: "2026-05-04",
        title: "Week of 2026-05-04",
        summary: "What changed.",
        tags: ["market", "orders"],
      },
    ])
    expect(compiled.changelog[0].body.links).toEqual(["/market"])
    const everything = JSON.stringify([
      contentIndex(compiled),
      sitemapManifest(compiled),
      changelogFeed(compiled, {
        origin: "https://x.test",
        siteName: "X",
        today,
      }),
    ])
    expect(everything).not.toContain("2026-05-18")
  })

  it("keeps drafts for the dev server only", () => {
    expect(
      compileSite(files, { today, includeDrafts: true }).changelog,
    ).toHaveLength(3)
  })

  it("lists /changelog and its entries in the sitemap manifest once one is published", () => {
    expect(
      sitemapManifest(compileSite(files, { today })).pages.slice(-3),
    ).toEqual([
      { path: "/changelog", updated: "2026-05-11" },
      { path: "/changelog/2026-05-11", updated: "2026-05-11" },
      { path: "/changelog/2026-05-04", updated: "2026-05-04" },
    ])
    const draftsOnly = site({
      "changelog/2026-05-18.md": entry("2026-05-18", "draft"),
    })
    expect(
      sitemapManifest(compileSite(draftsOnly, { today })).pages.map(
        (p) => p.path,
      ),
    ).not.toContain("/changelog")
  })

  it("writes an Atom feed of the published entries, escaped, valid when empty", () => {
    const feed = changelogFeed(
      compileSite(
        site({
          "changelog/2026-05-04.md": entry("2026-05-04", "published").replace(
            "Week of 2026-05-04",
            "Fish & <chips>",
          ),
        }),
        { today },
      ),
      { origin: "https://x.test", siteName: "X", today },
    )
    expect(feed).toContain('<feed xmlns="http://www.w3.org/2005/Atom"')
    expect(feed).toContain("<title>Fish &amp; &lt;chips&gt;</title>")
    expect(feed).toContain(
      '<link rel="alternate" type="text/html" href="https://x.test/changelog/2026-05-04"/>',
    )
    expect(feed).toContain("<updated>2026-05-04T00:00:00Z</updated>")
    expect(feed).toContain('<category term="market"/>')

    const empty = changelogFeed(compileSite(site(), { today }), {
      origin: "https://x.test",
      siteName: "X",
      today,
    })
    expect(empty).not.toContain("<entry>")
    expect(empty).toContain(`<updated>${today}T00:00:00Z</updated>`)
  })

  it("reads the status from the frontmatter alone", () => {
    expect(
      changelogStatus(entry("2026-05-04", "draft"), "changelog/2026-05-04.md"),
    ).toBe("draft")
    expect(
      changelogStatus(
        entry("2026-05-04", "published"),
        "changelog/2026-05-04.md",
      ),
    ).toBe("published")
    expect(() =>
      changelogStatus(entry("2026-05-04", "live"), "changelog/2026-05-04.md"),
    ).toThrow(ContentError)
  })

  it("lets a draft be dated ahead, but not a published entry", () => {
    const ahead = { "changelog/2026-07-06.md": entry("2026-07-06", "draft") }
    expect(
      compileSite(site(ahead), { today, includeDrafts: true }).changelog,
    ).toHaveLength(1)
    expect(() =>
      compileSite(
        site({ "changelog/2026-07-06.md": entry("2026-07-06", "published") }),
        { today },
      ),
    ).toThrow(ContentError)
  })

  it.each([
    [
      "a missing status",
      {
        "changelog/2026-05-04.md": entry("2026-05-04", "published").replace(
          "status: published\n",
          "",
        ),
      },
    ],
    [
      "an unknown status",
      { "changelog/2026-05-04.md": entry("2026-05-04", "hidden") },
    ],
    [
      "a date that isn't the file name",
      { "changelog/2026-05-04.md": entry("2026-05-05", "published") },
    ],
    [
      "a bad file name",
      { "changelog/week-1.md": entry("2026-05-04", "published") },
    ],
    [
      "a missing summary",
      {
        "changelog/2026-05-04.md": entry("2026-05-04", "published").replace(
          'summary: "What changed."\n',
          "",
        ),
      },
    ],
    [
      "a long summary",
      {
        "changelog/2026-05-04.md": entry("2026-05-04", "published").replace(
          "What changed.",
          "x".repeat(161),
        ),
      },
    ],
    [
      "an unknown key",
      {
        "changelog/2026-05-04.md": entry(
          "2026-05-04",
          "published",
          "author: Me\n",
        ),
      },
    ],
    [
      "a bad body",
      {
        "changelog/2026-05-04.md":
          entry("2026-05-04", "published") + "\n# Heading\n",
      },
    ],
  ])("fails the build on %s", (_name, overrides) => {
    expect(() => compileSite(site(overrides), { today })).toThrow(ContentError)
  })
})
