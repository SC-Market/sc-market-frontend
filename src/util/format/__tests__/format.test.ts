import { describe, expect, it } from "vitest"
import { SUPPORTED_LOCALES } from "../../locales"
import {
  formatAuec,
  formatCompact,
  formatDate,
  formatDateTime,
  formatDuration,
  formatExactPrice,
  formatInteger,
  formatNumber,
  formatPercent,
  formatPrice,
  formatPriceRange,
  formatQuantity,
  formatRelative,
  formatTime,
  formatTimeUntil,
} from "../format"

// Intl separates some groups and units with no-break spaces; compare with
// plain spaces.
const plain = (s: string | undefined) => s?.replace(/[\u00a0\u202f]/g, " ")

const MOMENT = Date.UTC(2026, 10, 3, 14, 5, 9) // 2026-11-03 14:05:09 UTC
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

describe("every shipped locale", () => {
  it.each(SUPPORTED_LOCALES)("%s formats without throwing and with digits", (locale) => {
    for (const s of [
      formatNumber(1234567.891, locale),
      formatInteger(-42, locale),
      formatCompact(1_677_981_402_101, locale),
      formatPercent(0.456, locale),
      formatPrice(1500, locale),
      formatPrice(150_500, locale),
      formatPrice(15_000_000_000, locale),
      formatExactPrice(50_000_000, locale)!,
      formatAuec(0, locale),
      formatPriceRange(1000, 2_000_000, locale),
      formatQuantity(250, "scu", locale),
      formatDate(MOMENT, locale, { timeZone: "UTC" }),
      formatTime(MOMENT, locale, { timeZone: "UTC" }),
      formatDateTime(MOMENT, locale, { timeZone: "UTC" }),
      formatRelative(MOMENT - 3 * DAY, MOMENT, locale),
      formatDuration(90 * 60 * 1000, locale),
    ]) {
      expect(s).toMatch(/\d/)
    }
  })

  it.each(SUPPORTED_LOCALES)("%s is stable: the same input always gives the same text", (locale) => {
    expect(formatPrice(1_550_000, locale)).toBe(formatPrice(1_550_000, locale))
    expect(formatDate("2026-11-03T14:05:09Z", locale, { timeZone: "UTC" })).toBe(
      formatDate(new Date(MOMENT), locale, { timeZone: "UTC" }),
    )
  })
})

describe("formatNumber", () => {
  it.each([
    ["en", "1,234,567.891"],
    ["de", "1.234.567,891"],
    ["es", "1.234.567,891"],
    ["fr", "1 234 567,891"],
    ["ja", "1,234,567.891"],
    ["uk", "1 234 567,891"],
    ["zh-CN", "1,234,567.891"],
    ["zh-TW", "1,234,567.891"],
  ])("%s groups and separates like the locale", (locale, expected) => {
    expect(plain(formatNumber(1234567.891, locale))).toBe(expected)
  })

  it("formats 0 and negatives", () => {
    expect(formatNumber(0, "en")).toBe("0")
    expect(formatNumber(-1500, "en")).toBe("-1,500")
    expect(formatNumber(-1500, "de")).toBe("-1.500")
  })

  it("formats very large values exactly", () => {
    expect(formatNumber(9_007_199_254_740_991, "en")).toBe("9,007,199,254,740,991")
    expect(formatNumber(1e21, "en")).toBe("1,000,000,000,000,000,000,000")
  })

  it("accepts the API's numeric strings and gives '' for non-numbers", () => {
    expect(formatNumber("50000000", "en")).toBe("50,000,000")
    expect(formatNumber("abc", "en")).toBe("")
    expect(formatNumber(null, "en")).toBe("")
    expect(formatNumber(undefined, "en")).toBe("")
    expect(formatNumber(NaN, "en")).toBe("")
    expect(formatNumber(Infinity, "en")).toBe("")
  })

  it("formatInteger rounds", () => {
    expect(formatInteger(1499.5, "en")).toBe("1,500")
    expect(formatInteger(-0.4, "en")).toBe("-0")
  })
})

describe("formatCompact", () => {
  it("abbreviates in the locale's words and never rounds up", () => {
    expect(formatCompact(1_677_981_402_101, "en", { display: "long" })).toBe("1.6 trillion")
    expect(formatCompact(1_699_000, "en")).toBe("1.6M")
    expect(plain(formatCompact(1_699_000, "de"))).toBe("1,6 Mio.")
    expect(formatCompact(1_699_000, "ja")).toBe("169.9万")
    expect(formatCompact(999, "en")).toBe("999")
  })
})

describe("formatPercent", () => {
  it.each([
    ["en", "46%"],
    ["de", "46 %"],
    ["fr", "46 %"],
    ["ja", "46%"],
    ["zh-CN", "46%"],
  ])("%s", (locale, expected) => {
    expect(plain(formatPercent(0.456, locale))).toBe(expected)
  })

  it("keeps decimals when asked, and handles 0 and negatives", () => {
    expect(formatPercent(0.456, "en", { maximumFractionDigits: 1 })).toBe("45.6%")
    expect(formatPercent(0, "en")).toBe("0%")
    expect(formatPercent(-0.25, "en")).toBe("-25%")
  })
})

describe("formatPrice (aUEC)", () => {
  it("is exact under 100,000 and abbreviated above, like the old K/M/B form in English", () => {
    expect(formatPrice(1500, "en")).toBe("1,500 aUEC")
    expect(formatPrice(99_999, "en")).toBe("99,999 aUEC")
    expect(formatPrice(150_000, "en")).toBe("150K aUEC")
    expect(formatPrice(150_500, "en")).toBe("151K aUEC")
    expect(formatPrice(1_500_000, "en")).toBe("1.5M aUEC")
    expect(formatPrice(12_345_678, "en")).toBe("12.3M aUEC")
    expect(formatPrice(15_000_000_000, "en")).toBe("15B aUEC")
  })

  it("follows the locale", () => {
    expect(formatPrice(1500, "de")).toBe("1.500 aUEC")
    expect(plain(formatPrice(1500, "fr"))).toBe("1 500 aUEC")
    expect(plain(formatPrice(1_500_000, "de"))).toBe("1,5 Mio. aUEC")
    expect(formatPrice(150_000, "ja")).toBe("15万 aUEC")
    expect(formatPrice(15_000_000_000, "zh-CN")).toBe("150亿 aUEC")
    expect(formatPrice(15_000_000_000, "zh-TW")).toBe("150億 aUEC")
  })

  it("shows a dash for missing or zero, and keeps the sign", () => {
    expect(formatPrice(0, "en")).toBe("— aUEC")
    expect(formatPrice(null, "en")).toBe("— aUEC")
    expect(formatPrice(undefined, "en")).toBe("— aUEC")
    expect(formatPrice("not a number", "en")).toBe("— aUEC")
    expect(formatPrice(-1500, "en")).toBe("-1,500 aUEC")
    expect(formatPrice(-2_500_000, "en")).toBe("-2.5M aUEC")
  })

  it("rounds aUEC: at most 2 decimals exact, whole aUEC for the exact title", () => {
    expect(formatPrice(2.345, "en")).toBe("2.35 aUEC")
    expect(formatPrice(1499.999, "en")).toBe("1,500 aUEC")
    expect(formatExactPrice(1499.5, "en")).toBe("1,500 aUEC")
    expect(formatExactPrice("50000000", "en")).toBe("50,000,000 aUEC")
    expect(formatExactPrice("50000000", "de")).toBe("50.000.000 aUEC")
    expect(formatExactPrice(0, "en")).toBeUndefined()
    expect(formatExactPrice(null, "en")).toBeUndefined()
    expect(formatAuec(0, "en")).toBe("0 aUEC")
    expect(formatAuec(25_000, "ja")).toBe("25,000 aUEC")
  })

  it("handles very large prices", () => {
    expect(formatPrice(1.5e12, "en")).toBe("1.5T aUEC")
    expect(formatExactPrice(2_147_483_647, "en")).toBe("2,147,483,647 aUEC")
  })

  it("formats ranges with one currency label", () => {
    expect(formatPriceRange(1000, 1500, "en")).toBe("1,000 – 1,500 aUEC")
    expect(formatPriceRange(150_000, 2_000_000, "en")).toBe("150K – 2M aUEC")
    expect(formatPriceRange(1000, 1000, "en")).toBe("1,000 aUEC")
    expect(formatPriceRange(1000, 0, "en")).toBe("1,000 aUEC")
    expect(formatPriceRange(1000, 1500, "de")).toBe("1.000 – 1.500 aUEC")
  })
})

describe("formatQuantity", () => {
  it("shows cSCU as SCU from 100 up", () => {
    expect(formatQuantity(250, "scu", "en")).toBe("2.50 SCU")
    expect(formatQuantity(300, "scu", "en")).toBe("3 SCU")
    expect(formatQuantity(50, "scu", "en")).toBe("50 cSCU")
    expect(formatQuantity(0, "scu", "en")).toBe("0 cSCU")
    expect(formatQuantity(250, "scu", "de")).toBe("2,50 SCU")
    expect(formatQuantity(123_456_700, "scu", "de")).toBe("1.234.567 SCU")
  })

  it("shows discrete units as the number", () => {
    expect(formatQuantity(1500, "unit", "en")).toBe("1,500")
    expect(formatQuantity(1500, "unit", "de")).toBe("1.500")
    expect(formatQuantity(-3, "unit", "en")).toBe("-3")
    expect(formatQuantity("12", "unit", "ja")).toBe("12")
    expect(formatQuantity(null, "unit", "en")).toBe("")
  })
})

describe("dates and times", () => {
  it.each([
    ["en", "11/3/2026"],
    ["de", "3.11.2026"],
    ["fr", "03/11/2026"],
    ["ja", "2026/11/3"],
    ["zh-CN", "2026/11/3"],
    ["uk", "03.11.2026"],
  ])("%s date, with toLocaleDateString's default fields", (locale, expected) => {
    expect(formatDate(MOMENT, locale, { timeZone: "UTC" })).toBe(expected)
  })

  it("accepts ISO strings, Dates and epoch ms; invalid or missing gives ''", () => {
    expect(formatDate("2026-11-03T14:05:09Z", "en", { timeZone: "UTC" })).toBe("11/3/2026")
    expect(formatDate(new Date(MOMENT), "en", { timeZone: "UTC" })).toBe("11/3/2026")
    expect(formatDate("not a date", "en")).toBe("")
    expect(formatDate(null, "en")).toBe("")
    expect(formatDate("", "en")).toBe("")
  })

  it("keeps the caller's own fields", () => {
    expect(
      formatDate(MOMENT, "en", { month: "short", day: "numeric", timeZone: "UTC" }),
    ).toBe("Nov 3")
    expect(formatDate(MOMENT, "de", { dateStyle: "long", timeZone: "UTC" })).toBe("3. November 2026")
  })

  it("labels times rendered in UTC", () => {
    expect(plain(formatTime(MOMENT, "en", { timeZone: "UTC" }))).toBe("2:05:09 PM UTC")
    expect(formatTime(MOMENT, "de", { timeZone: "UTC" })).toBe("14:05:09 UTC")
    expect(plain(formatDateTime(MOMENT, "en", { timeZone: "UTC" }))).toBe("11/3/2026, 2:05:09 PM UTC")
    // A date alone has no time to label.
    expect(formatDate(MOMENT, "en", { timeZone: "UTC" })).not.toContain("UTC")
  })

  it("formats in the zone it's given (the visitor's after hydration)", () => {
    expect(formatTime(MOMENT, "en", { timeZone: "Asia/Tokyo", hour: "numeric", minute: "2-digit", hourCycle: "h23" })).toBe("23:05")
    expect(formatDate(Date.UTC(2026, 10, 3, 20), "en", { timeZone: "Asia/Tokyo" })).toBe("11/4/2026")
  })

  it("formats CJK dates", () => {
    expect(formatDate(MOMENT, "ja", { dateStyle: "long", timeZone: "UTC" })).toBe("2026年11月3日")
    expect(formatDate(MOMENT, "zh-CN", { dateStyle: "long", timeZone: "UTC" })).toBe("2026年11月3日")
    expect(formatDate(MOMENT, "zh-TW", { dateStyle: "long", timeZone: "UTC" })).toBe("2026年11月3日")
  })
})

describe("formatRelative", () => {
  it("uses the largest whole unit, relative to the given now", () => {
    expect(formatRelative(MOMENT - 3 * DAY, MOMENT, "en")).toBe("3 days ago")
    expect(formatRelative(MOMENT + 2 * HOUR + 1, MOMENT, "en")).toBe("in 2 hours")
    expect(formatRelative(MOMENT - 1.2 * DAY, MOMENT, "en")).toBe("yesterday")
    expect(formatRelative(MOMENT, MOMENT, "en")).toBe("now")
    expect(formatRelative(MOMENT - 400 * DAY, MOMENT, "en")).toBe("last year")
  })

  it("follows the locale, CJK included", () => {
    expect(formatRelative(MOMENT - 3 * DAY, MOMENT, "de")).toBe("vor 3 Tagen")
    expect(formatRelative(MOMENT - 3 * DAY, MOMENT, "ja")).toBe("3 日前")
    expect(formatRelative(MOMENT - 3 * DAY, MOMENT, "zh-CN")).toBe("3天前")
    expect(formatRelative(MOMENT - 1.2 * DAY, MOMENT, "fr")).toBe("hier")
  })

  it("gives '' for an invalid date", () => {
    expect(formatRelative("nope", MOMENT, "en")).toBe("")
  })
})

describe("formatDuration and formatTimeUntil", () => {
  it("shows the two largest units by default", () => {
    expect(formatDuration(90 * 60 * 1000, "en")).toBe("1h 30m")
    expect(formatDuration(3 * DAY + 4 * HOUR + 5 * 60 * 1000, "en")).toBe("3d 4h")
    expect(formatDuration(45 * 1000, "en")).toBe("45s")
    expect(plain(formatDuration(90 * 60 * 1000, "de"))).toBe("1h 30 Min.")
    expect(formatDuration(90 * 60 * 1000, "zh-CN")).toBe("1小时30分钟")
    expect(formatDuration(90 * 60 * 1000, "ja")).toBe("1h30m")
  })

  it("shows zero and negative durations as 0 seconds", () => {
    expect(formatDuration(0, "en")).toBe("0s")
    expect(formatDuration(-5000, "en")).toBe("0s")
    expect(formatDuration(NaN, "en")).toBe("0s")
  })

  it("handles very long durations", () => {
    expect(formatDuration(1000 * DAY, "en", { units: 1 })).toBe("1,000d")
  })

  it("formatTimeUntil gives the most significant unit, 0s once passed", () => {
    expect(formatTimeUntil(MOMENT + 3 * DAY + HOUR, MOMENT, "en")).toBe("3d")
    expect(formatTimeUntil(MOMENT + 5 * HOUR, MOMENT, "en")).toBe("5h")
    expect(formatTimeUntil(MOMENT - HOUR, MOMENT, "en")).toBe("0s")
    expect(formatTimeUntil("bad", MOMENT, "en")).toBe("0s")
  })
})
