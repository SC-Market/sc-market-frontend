// @vitest-environment node
import { describe, it, expect } from "vitest"
import {
  ALL_SSR_VARIANTS,
  localeFromAcceptLanguage,
  requestContextFrom,
  themeFromCookies,
  variantKey,
  type SsrVariant,
  type SsrWhiteLabel,
} from "../protocol"

const req = (
  url: string,
  cookie?: string,
  acceptLanguage?: string,
  userAgent = "Mozilla/5.0 Chrome/130",
) => {
  const headers: Record<string, string> = { "User-Agent": userAgent }
  if (cookie) headers.Cookie = cookie
  if (acceptLanguage) headers["Accept-Language"] = acceptLanguage
  return new Request(url, { headers })
}

const ALL = { enabled: new Set(ALL_SSR_VARIANTS), crawler: false }
const only = (...variants: SsrVariant[]) => ({
  enabled: new Set(variants),
  crawler: false,
})

const whiteLabel = (hostname: string): SsrWhiteLabel => ({
  hostname,
  domain: {
    spectrum_id: "MEDRUNNER",
    contractor_id: "c1",
    name: "Medrunner",
    focus_mode: "public",
    homepage_path: null,
    require_membership: false,
  },
  theme: null,
})

describe("requestContextFrom", () => {
  it("defaults to the main site, English and the default theme", () => {
    const ctx = requestContextFrom(req("https://sc-market.space/shops/a"), ALL)
    expect(ctx).toMatchObject({
      lng: "en",
      theme: "system",
      host: "sc-market.space",
      whiteLabel: null,
    })
    expect(variantKey(ctx)).toBe("")
  })

  it("takes ?lng first, then the i18next cookie, as shipped locales", () => {
    expect(requestContextFrom(req("https://x.dev/a?lng=de-DE"), ALL).lng).toBe(
      "de",
    )
    expect(
      requestContextFrom(req("https://x.dev/a", "i18next=zh-TW"), ALL).lng,
    ).toBe("zh-TW")
    expect(
      requestContextFrom(req("https://x.dev/a?lng=fr", "i18next=de"), ALL).lng,
    ).toBe("fr")
    expect(requestContextFrom(req("https://x.dev/a?lng=xx"), ALL).lng).toBe(
      "en",
    )
  })

  it("uses Accept-Language only without ?lng or a cookie (a first visit)", () => {
    expect(
      requestContextFrom(
        req("https://x.dev/a", undefined, "fr-CA,fr;q=0.9,en;q=0.5"),
        ALL,
      ).lng,
    ).toBe("fr")
    expect(
      requestContextFrom(req("https://x.dev/a", "i18next=en", "de-DE"), ALL)
        .lng,
    ).toBe("en")
    expect(
      requestContextFrom(req("https://x.dev/a?lng=ja", undefined, "de"), ALL)
        .lng,
    ).toBe("ja")
    expect(
      requestContextFrom(req("https://x.dev/a", undefined, "pt-BR"), ALL).lng,
    ).toBe("en")
  })

  it("renders light for the light theme cookie, or an OS-following theme on a light OS", () => {
    const theme = (cookie: string) =>
      requestContextFrom(req("https://x.dev/a", cookie), ALL).theme
    expect(theme("a=1; theme=light")).toBe("light")
    expect(theme("theme=dark")).toBe("system")
    expect(theme("theme=CLEAN_DARK")).toBe("system")
    expect(theme("scm_scheme=light")).toBe("light")
    expect(theme("theme=system; scm_scheme=light")).toBe("light")
    // An explicit dark (or custom) choice beats the OS.
    expect(theme("theme=dark; scm_scheme=light")).toBe("system")
    expect(theme("scm_scheme=dark")).toBe("system")
  })

  it("renders only the enabled variants", () => {
    const request = req("https://x.dev/a", "theme=light; i18next=de", "fr")
    expect(requestContextFrom(request, only())).toMatchObject({
      lng: "en",
      theme: "system",
    })
    expect(requestContextFrom(request, only("theme"))).toMatchObject({
      lng: "en",
      theme: "light",
    })
    expect(requestContextFrom(request, only("locale"))).toMatchObject({
      lng: "de",
      theme: "system",
    })
  })

  it("gives crawlers the default variant whatever they send", () => {
    const ctx = requestContextFrom(
      req("https://x.dev/a?lng=de", "theme=light; i18next=fr", "ja"),
      { enabled: new Set(ALL_SSR_VARIANTS), crawler: true },
    )
    expect(ctx).toMatchObject({ lng: "en", theme: "system" })
    expect(variantKey(ctx)).toBe("")
  })

  it("lowercases the host", () => {
    expect(
      requestContextFrom(req("https://Medrunner.SC-Market.space/a"), ALL).host,
    ).toBe("medrunner.sc-market.space")
  })
})

describe("themeFromCookies", () => {
  it("ignores look-alike cookie names and values", () => {
    expect(themeFromCookies("xtheme=light")).toBe("system")
    expect(themeFromCookies("theme=lightish")).toBe("system")
  })
})

describe("localeFromAcceptLanguage", () => {
  it("picks the most preferred shipped locale", () => {
    expect(localeFromAcceptLanguage("de-AT")).toBe("de")
    expect(localeFromAcceptLanguage("pt-BR,pt;q=0.9,es;q=0.8")).toBe("es")
    expect(localeFromAcceptLanguage("en;q=0.5,ja;q=0.9")).toBe("ja")
    expect(localeFromAcceptLanguage("en-GB,de;q=0.9")).toBe("en")
    expect(localeFromAcceptLanguage("zh-HK,zh;q=0.9")).toBe("zh-TW")
    expect(localeFromAcceptLanguage("zh,en;q=0.5")).toBe("zh-CN")
    expect(localeFromAcceptLanguage("uk-UA")).toBe("uk")
  })
  it("is null when nothing usable is asked for", () => {
    expect(localeFromAcceptLanguage(null)).toBeNull()
    expect(localeFromAcceptLanguage("")).toBeNull()
    expect(localeFromAcceptLanguage("*")).toBeNull()
    expect(localeFromAcceptLanguage("pt-BR,ko;q=0.5")).toBeNull()
    expect(localeFromAcceptLanguage("de;q=0")).toBeNull()
  })
})

describe("variantKey", () => {
  it("keys every rendered variant, the host first", () => {
    const ctx = requestContextFrom(
      req("https://x.dev/a?lng=de", "theme=light"),
      ALL,
    )
    expect(variantKey(ctx)).toBe("~theme=light~lng=de")
    expect(
      variantKey({
        ...ctx,
        whiteLabel: whiteLabel("medrunner.sc-market.space"),
      }),
    ).toBe("~host=medrunner.sc-market.space~theme=light~lng=de")
  })
  it("never gives two variants the same key", () => {
    const keys = new Set<string>()
    for (const host of [null, "a.sc-market.space", "b.sc-market.space"]) {
      for (const theme of ["light", "system"] as const) {
        for (const lng of ["en", "de", "zh-TW"]) {
          keys.add(
            variantKey({
              host: host ?? "sc-market.space",
              lng,
              theme,
              url: "https://x.dev/a",
              whiteLabel: host ? whiteLabel(host) : null,
            }),
          )
        }
      }
    }
    expect(keys.size).toBe(3 * 2 * 3)
  })
})
