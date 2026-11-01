import { describe, expect, it } from "vitest"
import en from "../../../locales/en/english.json"
import { DEVELOPER_LINKS, DEVELOPERS_HEADING } from "../developerLinks"
import { DEVELOPER_SUMMARY_BLOCKS, isDeveloperHref, summaryChunks } from "../../../bridge/render"

const enText = (key: string) =>
  key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], en)

describe("footer developer links", () => {
  it("English labels match the en locale (what the bridge shows crawlers)", () => {
    for (const { key, label } of [DEVELOPERS_HEADING, ...DEVELOPER_LINKS]) {
      expect(enText(key)).toBe(label)
    }
  })

  it("link the developers page, API guide, spec, price feed and SDK", () => {
    expect(DEVELOPER_LINKS.map((l) => l.href)).toEqual([
      "/developers",
      "/guides/discord/api-tokens",
      "https://api.sc-market.space/api/public/v1/openapi.json",
      "https://api.sc-market.space/api/public/prices/index.json",
      "https://github.com/SC-Market/sc-market-sdk",
    ])
  })

  it("render in the bridge summary; only these exact off-site URLs pass", () => {
    const html = summaryChunks(DEVELOPER_SUMMARY_BLOCKS)
      .map((c) => c.content)
      .join("")
    for (const link of DEVELOPER_LINKS) expect(html).toContain(`href="${link.href}"`)
    expect(html).toContain(`<a href="https://github.com/SC-Market/sc-market-sdk" rel="noopener">`)
    expect(isDeveloperHref("https://github.com/SC-Market/sc-market-sdk")).toBe(true)
    expect(isDeveloperHref("https://github.com/SC-Market/sc-market-sdk/../evil")).toBe(false)
    expect(isDeveloperHref("https://evil.example/")).toBe(false)
    const filtered = summaryChunks([{ tag: "ul", links: [{ href: "https://evil.example/", text: "x" }] }])
    expect(filtered.map((c) => c.content).join("")).not.toContain("evil")
  })
})
