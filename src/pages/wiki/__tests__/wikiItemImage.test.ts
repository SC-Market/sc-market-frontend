import { describe, it, expect } from "vitest"
import { wikiItemImage } from "../wikiItemImage"
import { MISSING_IMAGE_URL } from "../../../util/constants"

describe("wikiItemImage", () => {
  it("uses the manufacturer logo looked up by code, not by display name", () => {
    expect(wikiItemImage({ manufacturer_code: "behr" })).toBe(
      "/game-icons/factions/icon_brand_behring.svg",
    )
    expect(wikiItemImage({ manufacturer_code: "AEGS" })).toBe(
      "/game-icons/factions/icon_brand_aegis.svg",
    )
  })

  it("prefers the item's own image, then its thumbnail", () => {
    expect(
      wikiItemImage({
        image_url: "https://x/a.png",
        thumbnail_path: "/t.png",
        manufacturer_code: "behr",
      }),
    ).toBe("https://x/a.png")
    expect(
      wikiItemImage({ thumbnail_path: "/t.png", manufacturer_code: "behr" }),
    ).toBe("/t.png")
  })

  it("falls back when there is no image and no known manufacturer code", () => {
    expect(wikiItemImage({ manufacturer_code: null })).toBe(MISSING_IMAGE_URL)
    expect(wikiItemImage({ manufacturer_code: "volt" })).toBe(MISSING_IMAGE_URL)
  })
})
