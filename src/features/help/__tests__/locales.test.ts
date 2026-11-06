// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  GUIDE_LOCALES,
  guideBodyKey,
  guideTranslation,
  localizedGuideMeta,
  localizedGuidePath,
} from "../domain/locales"
import type { GuideMeta } from "../domain/types"

const guide: GuideMeta = {
  id: "buying/buy-an-item",
  category: "buying",
  slug: "buy-an-item",
  title: "Buy an item",
  description: "Buy it.",
  order: 10,
  updated: "2026-01-02",
  author: "Khuzdul",
  keywords: ["buy"],
  related: [],
  howto: true,
  translations: [
    {
      locale: "de",
      title: "Einen Artikel kaufen",
      description: "Kaufen.",
      keywords: ["kaufen"],
      updated: "2026-01-05",
    },
    {
      locale: "zh-TW",
      title: "購買物品",
      description: "購買。",
      keywords: [],
      updated: "2026-01-02",
    },
  ],
}

describe("guide locales", () => {
  it("are every shipped locale but English", () => {
    expect(GUIDE_LOCALES).toEqual([
      "de",
      "es",
      "fr",
      "ja",
      "uk",
      "zh-CN",
      "zh-TW",
    ])
  })

  it("picks the published translation for the visitor's language tag", () => {
    expect(guideTranslation(guide, "de")?.locale).toBe("de")
    expect(guideTranslation(guide, "de-AT")?.locale).toBe("de")
    expect(guideTranslation(guide, "zh-HK")?.locale).toBe("zh-TW")
    // No translation (or English): the English guide.
    expect(guideTranslation(guide, "fr")).toBeUndefined()
    expect(guideTranslation(guide, "zh")).toBeUndefined()
    expect(guideTranslation(guide, "en")).toBeUndefined()
    expect(guideTranslation(guide, undefined)).toBeUndefined()
  })

  it("localizes the metadata and keeps the rest of the guide", () => {
    const de = localizedGuideMeta(guide, guideTranslation(guide, "de"))
    expect(de).toMatchObject({
      id: guide.id,
      title: "Einen Artikel kaufen",
      description: "Kaufen.",
      keywords: ["kaufen"],
      updated: "2026-01-05",
      order: 10,
      howto: true,
    })
    expect(localizedGuideMeta(guide, undefined)).toBe(guide)
  })

  it("keys bodies and URLs by locale, English being the bare id and clean path", () => {
    expect(guideBodyKey(guide.id, "en")).toBe("buying/buy-an-item")
    expect(guideBodyKey(guide.id, "zh-CN")).toBe("buying/buy-an-item@zh-CN")
    expect(localizedGuidePath("/guides/buying/buy-an-item", "en")).toBe(
      "/guides/buying/buy-an-item",
    )
    expect(localizedGuidePath("/guides/buying/buy-an-item", "zh-TW")).toBe(
      "/guides/buying/buy-an-item?lng=zh-TW",
    )
  })
})
