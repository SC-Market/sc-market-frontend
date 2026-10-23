import { describe, it, expect } from "vitest"
import { escapeAttribute, headMarkup, summaryChunks, type HtmlChunk } from "../render"
import { BRIDGE_PAGES } from "../pages"
import * as f from "./fixtures"

const ORIGIN = "https://sc-market.space"

/** What HTMLRewriter does with `html: false` content. */
function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function assemble(chunks: HtmlChunk[]): string {
  return chunks.map((c) => (c.html ? c.content : escapeText(c.content))).join("")
}

function parse(headHtml: string, bodyHtml = ""): Document {
  return new DOMParser().parseFromString(
    `<!doctype html><html><head>${headHtml}</head><body>${bodyHtml}</body></html>`,
    "text/html",
  )
}

const evilDocs = {
  listing: BRIDGE_PAGES.listing.build(f.listing(f.EVIL), undefined, { params: { id: "x" }, origin: ORIGIN, pathname: "/market/x" }),
  shop: BRIDGE_PAGES.shop.build(f.shop(f.EVIL), undefined, { params: { slug: "x" }, origin: ORIGIN, pathname: "/shops/x" }),
  org: BRIDGE_PAGES.org.build(f.contractor(f.EVIL), undefined, { params: { id: "x" }, origin: ORIGIN, pathname: "/contractor/x" }),
  user: BRIDGE_PAGES.user.build(f.user(f.EVIL), undefined, { params: { username: "x" }, origin: ORIGIN, pathname: "/user/x" }),
  post: BRIDGE_PAGES.recruitingPost.build(f.recruitingPost(f.EVIL), undefined, { params: { post_id: "x" }, origin: ORIGIN, pathname: "/recruiting/post/x" }),
}

describe("escapeAttribute", () => {
  it("escapes everything that could end a quoted attribute or open a tag", () => {
    expect(escapeAttribute(`a"b'c<d>e&f`)).toBe("a&quot;b&#39;c&lt;d&gt;e&amp;f")
  })
})

describe.each(Object.entries(evilDocs))("hostile %s content", (_name, doc) => {
  it("stays inert in the injected head", () => {
    const dom = parse(headMarkup(doc.head, doc.canonical, false))
    const head = dom.head

    // Only the tags we emitted: meta, one canonical link, JSON-LD scripts.
    for (const el of Array.from(head.children)) {
      expect(["META", "LINK", "SCRIPT"]).toContain(el.tagName)
    }
    expect(head.querySelectorAll("img")).toHaveLength(0)
    expect(dom.body.children).toHaveLength(0)
    expect(head.querySelectorAll("meta")).toHaveLength(doc.head.meta.length)

    // Attribute values round-trip exactly.
    for (const m of doc.head.meta) {
      const key = m.name !== undefined ? `meta[name="${m.name}"]` : `meta[property="${m.property}"]`
      expect(head.querySelector(key)?.getAttribute("content")).toBe(m.content)
    }

    // Every script is JSON-LD and parses back to the original data.
    const scripts = Array.from(head.querySelectorAll("script"))
    expect(scripts).toHaveLength(doc.head.jsonLd.length)
    scripts.forEach((s, i) => {
      expect(s.getAttribute("type")).toBe("application/ld+json")
      expect(JSON.parse(s.textContent || "")).toEqual(JSON.parse(JSON.stringify(doc.head.jsonLd[i])))
    })
  })

  it("stays inert in the visible summary", () => {
    const chunks = summaryChunks(doc.summary)
    // User text only ever goes in as escaped text.
    const textChunks = chunks.filter((c) => !c.html)
    expect(textChunks.map((c) => c.content)).toEqual(doc.summary.map((b) => b.text))
    for (const c of chunks.filter((c) => c.html)) {
      expect(c.content).toMatch(/^<\/?(main|h1|h2|h3|p)( style="[^"]*")?>$/)
    }

    const dom = parse("", `<div id="root">${assemble(chunks)}</div>`)
    const root = dom.getElementById("root")!
    expect(root.querySelectorAll("script, img")).toHaveLength(0)
    expect(root.querySelector("h1")?.textContent).toBe(doc.summary[0].text)
  })
})

describe("headMarkup", () => {
  it("adds robots noindex for unknown entities", () => {
    expect(headMarkup(null, null, true)).toBe(`<meta name="robots" content="noindex">`)
  })

  it("drops summary blocks with unexpected tags", () => {
    const chunks = summaryChunks([{ tag: "script" as "p", text: "x" }, { tag: "p", text: "ok" }])
    expect(assemble(chunks)).toBe(`<main style="max-width:720px;margin:32px auto;padding:0 16px"><p>ok</p></main>`)
  })
})
