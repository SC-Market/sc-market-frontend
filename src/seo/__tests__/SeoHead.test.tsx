import React from "react"
import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { UnheadProvider, createHead, renderSSRHead } from "@unhead/react/server"
import { SeoHead } from "../SeoHead"
import { buildListingHead } from "../entityHeads"
import { serializeJsonLd } from "../pageHead"
import * as f from "../../bridge/__tests__/fixtures"
import { MemoryRouter } from "react-router-dom"
import { PageBreadcrumbs } from "../../components/navigation/PageBreadcrumbs"

describe("SeoHead", () => {
  it("renders the PageHead through Unhead with the bridge's JSON-LD bytes", async () => {
    const pageHead = buildListingHead(
      f.listing(f.EVIL),
      "https://sc-market.space",
    )
    const head = createHead()
    renderToString(
      <UnheadProvider value={head}>
        <SeoHead head={pageHead} />
      </UnheadProvider>,
    )
    const { headTags } = await renderSSRHead(head)

    expect(headTags).toContain(
      '<link rel="canonical" href="https://sc-market.space/market/71012eb4--titlescriptscriptalertxscriptimg-srcx-onerroralert1-q-a">',
    )
    expect(headTags).toContain('property="og:type"')
    // Same serialized content the bridge injects, so the client adopts it.
    expect(headTags).toContain(serializeJsonLd(pageHead.jsonLd[0]))
    // Hostile text stays inside attribute values / title text.
    const dom = new DOMParser().parseFromString(
      `<html><head>${headTags}</head></html>`,
      "text/html",
    )
    expect(dom.querySelectorAll("script")).toHaveLength(2)
    expect(dom.querySelectorAll("img")).toHaveLength(0)
    expect(
      dom.querySelector('meta[property="og:title"]')?.getAttribute("content"),
    ).toBe(`${f.EVIL} — 12,000 aUEC`)
  })

  it("keeps one BreadcrumbList, the page head's, next to the layout's breadcrumbs", async () => {
    const pageHead = buildListingHead(
      f.listing(f.EVIL),
      "https://sc-market.space",
    )
    const crumbs = [
      { label: "Market", href: "/market" },
      { label: "Layout trail" },
    ]
    for (const order of ["layout first", "head first"]) {
      const head = createHead()
      const layout = <PageBreadcrumbs key="b" items={crumbs} />
      const seo = <SeoHead key="s" head={pageHead} />
      renderToString(
        <MemoryRouter>
          <UnheadProvider value={head}>
            {order === "layout first" ? [layout, seo] : [seo, layout]}
          </UnheadProvider>
        </MemoryRouter>,
      )
      const { headTags } = await renderSSRHead(head)
      const dom = new DOMParser().parseFromString(
        `<html><head>${headTags}</head></html>`,
        "text/html",
      )
      const lists = Array.from(
        dom.querySelectorAll('script[type="application/ld+json"]'),
      )
        .map((el) => JSON.parse(el.textContent || "{}"))
        .filter((d) => d["@type"] === "BreadcrumbList")
      expect(lists, order).toHaveLength(1)
      expect(JSON.stringify(lists[0]), order).not.toContain("Layout trail")
    }
  })

  it("keeps the layout's BreadcrumbList on a page whose head has none", async () => {
    const head = createHead()
    renderToString(
      <MemoryRouter>
        <UnheadProvider value={head}>
          <PageBreadcrumbs
            items={[
              { label: "Market", href: "/market" },
              { label: "Layout trail" },
            ]}
          />
        </UnheadProvider>
      </MemoryRouter>,
    )
    const { headTags } = await renderSSRHead(head)
    expect(headTags).toContain("Layout trail")
    expect(headTags).toContain('"@type":"BreadcrumbList"')
  })
})
