import { afterEach, describe, expect, it } from "vitest"
import i18n, {
  changeLocale,
  initialLocaleReady,
  loadLocale,
  toSupportedLocale,
} from "../i18n"

describe("changeLocale", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en")
  })

  it("has the locale's strings loaded by the time the language changes", async () => {
    let bundleLoadedAtChange: boolean | undefined
    const onChange = (lng: string) => {
      if (lng === "de")
        bundleLoadedAtChange = i18n.hasResourceBundle("de", "translation")
    }
    i18n.on("languageChanged", onChange)
    try {
      await changeLocale("de")
    } finally {
      i18n.off("languageChanged", onChange)
    }
    expect(i18n.language).toBe("de")
    expect(bundleLoadedAtChange).toBe(true)
  })
})

describe("toSupportedLocale", () => {
  it("maps regional and bare tags to a shipped locale", () => {
    expect(toSupportedLocale("de-DE")).toBe("de")
    expect(toSupportedLocale("zh")).toBe("zh-CN")
    expect(toSupportedLocale("zh-TW")).toBe("zh-TW")
    expect(toSupportedLocale("en-GB")).toBe("en")
    expect(toSupportedLocale("pt-BR")).toBe("en")
  })

  it("loads a regional tag's bundle under the shipped code", async () => {
    await loadLocale("fr-CA")
    expect(i18n.hasResourceBundle("fr", "translation")).toBe(true)
  })
})

describe("initialLocaleReady", () => {
  it("resolves (English test environment: immediately)", async () => {
    await expect(initialLocaleReady).resolves.toBeUndefined()
  })
})
