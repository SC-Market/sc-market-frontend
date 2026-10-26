import { afterEach, describe, expect, it } from "vitest"
import i18n, { changeLocale } from "../i18n"

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
