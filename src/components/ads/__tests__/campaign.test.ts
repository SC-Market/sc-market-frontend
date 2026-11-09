import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { beforeEach, describe, expect, it, vi } from "vitest"
import en from "../../../locales/en/english.json"
import de from "../../../locales/de/de.json"
import es from "../../../locales/es/es.json"
import fr from "../../../locales/fr/fr.json"
import ja from "../../../locales/ja/ja.json"
import uk from "../../../locales/uk/ukrainian.json"
import zhHans from "../../../locales/zh/zh_Hans.json"
import zhHant from "../../../locales/zh/zh_Hant.json"
import {
  anonymousCreative,
  isCampaignActive,
  nextCampaignBoundary,
  resetUnpersistedCampaignPicks,
  signedInCreative,
} from "../campaign"
import { IAE_2956, IAE_2956_URL } from "../iae2956"

/** Each source file's left half, then its right half, then Tumbril. */
const MANUFACTURERS = [
  "Consolidated Outland",
  "Kruger Intergalactic",
  "Drake Interplanetary",
  "Crusader Industries",
  "Esperia",
  "Banu",
  "Greycat Industrial",
  "Argo Astronautics",
  "Gatac",
  "Aopoa",
  "MISC",
  "Mirai",
  "Origin Jumpworks",
  "Anvil Aerospace",
  "Roberts Space Industries",
  "Aegis Dynamics",
  "Tumbril",
]

const START = Date.parse("2026-11-08T00:00:00Z")
const END = Date.parse("2026-11-28T08:00:00Z")

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    map,
    getItem: vi.fn((key: string) => map.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void map.set(key, value)),
  }
}

describe("IAE 2956 campaign", () => {
  it("has one creative per manufacturer, all linking to RSI's IAE page", () => {
    expect(IAE_2956.creatives.map((c) => c.title)).toEqual(MANUFACTURERS)
    expect(new Set(IAE_2956.creatives.map((c) => c.id)).size).toBe(17)
    for (const c of IAE_2956.creatives) {
      expect(c.kind).toBe("image")
      expect(c.linkUrl).toBe(IAE_2956_URL)
      expect(c.sisterSite).toBeFalsy()
      expect(c.alt).toEqual({
        key: "ads.iae2956.alt",
        values: { manufacturer: c.title },
      })
      expect(c.imageUrl).toMatch(/iae2956-[a-z-]+\.webp$/)
      expect(c.imageUrl2x).toMatch(/iae2956-[a-z-]+@2x\.webp$/)
      expect(c.avif?.x1).toMatch(/iae2956-[a-z-]+\.avif$/)
      expect(c.avif?.x2).toMatch(/iae2956-[a-z-]+@2x\.avif$/)
    }
    expect(IAE_2956_URL).toBe(
      "https://robertsspaceindustries.com/en/comm-link/transmission/21389-Countdown-To-IAE-2956",
    )
  })

  it("ships only small WebP/AVIF images, never the PNG sources", () => {
    const dir = join(__dirname, "../../../assets/iae2956")
    const files = readdirSync(dir).filter((f) => !f.startsWith("."))
    expect(files).toHaveLength(17 * 4)
    for (const file of files) {
      expect(file).toMatch(/^iae2956-[a-z-]+(@2x)?\.(webp|avif)$/)
      expect(statSync(join(dir, file)).size).toBeLessThan(30_000)
    }
  })

  it("has its alt text in every locale", () => {
    for (const locale of [en, de, es, fr, ja, uk, zhHans, zhHant]) {
      const alt = (locale as { ads: { iae2956: { alt: string } } }).ads.iae2956
        .alt
      expect(alt).toContain("IAE 2956")
      expect(alt).toContain("{{manufacturer}}")
    }
    expect(en.ads.iae2956.alt).toBe(
      "IAE 2956 – {{manufacturer}}: Choose your adventure",
    )
  })
})

describe("campaign schedule", () => {
  it("runs from its start (inclusive) to its end (exclusive)", () => {
    expect(IAE_2956.end).toBe("2026-11-28T08:00:00Z")
    expect(isCampaignActive(IAE_2956, START - 1)).toBe(false)
    expect(isCampaignActive(IAE_2956, START)).toBe(true)
    expect(isCampaignActive(IAE_2956, END - 1)).toBe(true)
    expect(isCampaignActive(IAE_2956, END)).toBe(false)
    expect(isCampaignActive(IAE_2956, END + 86_400_000)).toBe(false)
  })

  it("covers Nov 27 everywhere, down to UTC-8", () => {
    // 23:59 on the 27th in Los Angeles (PST, UTC-8) and in Tokyo.
    expect(
      isCampaignActive(IAE_2956, Date.parse("2026-11-27T23:59:00-08:00")),
    ).toBe(true)
    expect(
      isCampaignActive(IAE_2956, Date.parse("2026-11-27T23:59:00+09:00")),
    ).toBe(true)
  })

  it("knows when to look at the clock next", () => {
    expect(nextCampaignBoundary(IAE_2956, START - 5)).toBe(START)
    expect(nextCampaignBoundary(IAE_2956, START)).toBe(END)
    expect(nextCampaignBoundary(IAE_2956, END)).toBeNull()
  })
})

describe("creative choice", () => {
  beforeEach(() => resetUnpersistedCampaignPicks())

  it("gives a signed-in user the same creative every time", () => {
    for (const name of ["alice", "bob", "Henry232323", "x"]) {
      const first = signedInCreative(IAE_2956, name)
      for (let i = 0; i < 5; i++)
        expect(signedInCreative(IAE_2956, name)).toBe(first)
    }
  })

  it("spreads signed-in users over all 17 creatives", () => {
    const seen = new Set<string>()
    for (let i = 0; i < 2000; i++)
      seen.add(signedInCreative(IAE_2956, `user${i}`).id)
    expect(seen.size).toBe(17)
  })

  it("keeps an anonymous visitor's random pick in localStorage", () => {
    const storage = memoryStorage()
    const random = vi.fn(() => 0.5)
    const first = anonymousCreative(IAE_2956, storage, random)
    expect(storage.map.get(IAE_2956.storageKey)).toBe(first.id)
    for (let i = 0; i < 5; i++) {
      expect(anonymousCreative(IAE_2956, storage, () => 0.99)).toBe(first)
    }
    expect(random).toHaveBeenCalledTimes(1)
  })

  it("re-picks when the stored id is not a creative", () => {
    const storage = memoryStorage()
    storage.map.set(IAE_2956.storageKey, "iae2956-retired")
    const picked = anonymousCreative(IAE_2956, storage, () => 0)
    expect(picked).toBe(IAE_2956.creatives[0])
    expect(storage.map.get(IAE_2956.storageKey)).toBe(picked.id)
  })

  it("stays sticky for the page's lifetime when storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked")
      },
      setItem: () => {
        throw new Error("blocked")
      },
    }
    const first = anonymousCreative(IAE_2956, blocked, () => 0.3)
    expect(anonymousCreative(IAE_2956, blocked, () => 0.9)).toBe(first)
    expect(anonymousCreative(IAE_2956, null, () => 0.9)).toBe(first)
  })

  it("covers every creative from the random pick, never out of range", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 17; i++) {
      resetUnpersistedCampaignPicks()
      ids.add(anonymousCreative(IAE_2956, memoryStorage(), () => i / 17).id)
    }
    expect(ids.size).toBe(17)
    expect(anonymousCreative(IAE_2956, memoryStorage(), () => 1)).toBe(
      IAE_2956.creatives[16],
    )
  })
})
