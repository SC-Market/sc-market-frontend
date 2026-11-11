import { describe, expect, it } from "vitest"
import { removeStaticJsonLd } from "../foreignHead"

describe("removeStaticJsonLd", () => {
  it("removes the head's JSON-LD and nothing else", () => {
    document.head.innerHTML = [
      '<link rel="canonical" href="https://sc-market.space/">',
      '<meta name="description" content="x">',
      '<script data-cfasync="false">window.__x = 1</script>',
      '<script data-cfasync="false" type="application/ld+json">{"@type":"WebSite"}</script>',
      '<script data-cfasync="false" type="application/ld+json">{"@type":"FAQPage"}</script>',
    ].join("")
    document.body.innerHTML =
      '<script type="application/ld+json">{"@type":"Product"}</script>'

    removeStaticJsonLd()

    expect(
      document.head.querySelectorAll('script[type="application/ld+json"]'),
    ).toHaveLength(0)
    expect(document.head.querySelector('link[rel="canonical"]')).not.toBeNull()
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).not.toBeNull()
    expect(document.head.querySelectorAll("script")).toHaveLength(1)
    // Body JSON-LD belongs to the rendered page.
    expect(
      document.body.querySelectorAll('script[type="application/ld+json"]'),
    ).toHaveLength(1)
  })
})
