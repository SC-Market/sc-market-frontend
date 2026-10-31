// @vitest-environment node
import { describe, it, expect } from "vitest"
import { requestContextFrom, variantKey } from "../protocol"

const req = (url: string, cookie?: string) =>
  new Request(url, cookie ? { headers: { Cookie: cookie } } : undefined)

describe("requestContextFrom", () => {
  it("defaults to English and the default theme", () => {
    const ctx = requestContextFrom(req("https://sc-market.space/shops/a"))
    expect(ctx).toMatchObject({
      lng: "en",
      theme: "system",
      host: "sc-market.space",
    })
    expect(variantKey(ctx)).toBe("")
  })
  it("takes ?lng first, then the i18next cookie, as shipped locales", () => {
    expect(requestContextFrom(req("https://x.dev/a?lng=de-DE")).lng).toBe("de")
    expect(
      requestContextFrom(req("https://x.dev/a", "i18next=zh-TW")).lng,
    ).toBe("zh-TW")
    expect(
      requestContextFrom(req("https://x.dev/a?lng=fr", "i18next=de")).lng,
    ).toBe("fr")
    expect(requestContextFrom(req("https://x.dev/a?lng=xx")).lng).toBe("en")
  })
  it("renders light only for a light theme cookie", () => {
    expect(
      requestContextFrom(req("https://x.dev/a", "a=1; theme=light")).theme,
    ).toBe("light")
    expect(requestContextFrom(req("https://x.dev/a", "theme=dark")).theme).toBe(
      "system",
    )
    expect(
      requestContextFrom(req("https://x.dev/a", "theme=CLEAN_DARK")).theme,
    ).toBe("system")
  })
  it("keys only rendered variants", () => {
    expect(
      variantKey(
        requestContextFrom(req("https://x.dev/a?lng=de", "theme=light")),
      ),
    ).toBe("~theme=light~lng=de")
  })
})
