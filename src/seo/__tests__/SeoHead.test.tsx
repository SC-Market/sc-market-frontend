import React from "react"
import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { UnheadProvider, createHead, renderSSRHead } from "@unhead/react/server"
import { SeoHead } from "../SeoHead"
import { buildListingHead } from "../entityHeads"
import { serializeJsonLd } from "../pageHead"
import * as f from "../../bridge/__tests__/fixtures"

describe("SeoHead", () => {
  it("renders the PageHead through Unhead with the bridge's JSON-LD bytes", async () => {
    const pageHead = buildListingHead(f.listing(f.EVIL), "https://sc-market.space")
    const head = createHead()
    renderToString(
      <UnheadProvider value={head}>
        <SeoHead head={pageHead} />
      </UnheadProvider>,
    )
    const { headTags } = await renderSSRHead(head)

    expect(headTags).toContain('<link rel="canonical" href="https://sc-market.space/market/71012eb4--titlescriptscriptalertxscriptimg-srcx-onerroralert1-q-a">')
    expect(headTags).toContain('property="og:type"')
    // Same serialized content the bridge injects, so the client adopts it.
    expect(headTags).toContain(serializeJsonLd(pageHead.jsonLd[0]))
    // Hostile text stays inside attribute values / title text.
    const dom = new DOMParser().parseFromString(`<html><head>${headTags}</head></html>`, "text/html")
    expect(dom.querySelectorAll("script")).toHaveLength(1)
    expect(dom.querySelectorAll("img")).toHaveLength(0)
    expect(dom.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(f.EVIL)
  })
})
