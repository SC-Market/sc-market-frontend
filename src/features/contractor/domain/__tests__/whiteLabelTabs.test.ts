import { describe, expect, it } from "vitest"
import { hiddenStandardTabs, toggleableTabChoices } from "../whiteLabelTabs"

describe("hiddenStandardTabs", () => {
  it("hides Organizations and Recruiting by default, nothing else", () => {
    expect([...hiddenStandardTabs([])].sort()).toEqual([
      "contractors",
      "recruiting",
    ])
  })

  it("follows the org's stored choices", () => {
    const hidden = hiddenStandardTabs([
      { standard_tab_key: "contractors", enabled: true },
      { standard_tab_key: "contracts", enabled: false },
      { standard_tab_key: "sc_market_home", enabled: true },
      { standard_tab_key: null, enabled: true },
    ])
    expect([...hidden].sort()).toEqual(["contracts", "recruiting"])
  })
})

describe("toggleableTabChoices", () => {
  it("stores nothing for the defaults", () => {
    expect(
      toggleableTabChoices(new Set(["contractors", "recruiting"])),
    ).toEqual([])
  })

  it("stores only the tabs set away from their default", () => {
    expect(toggleableTabChoices(new Set(["market", "recruiting"]))).toEqual([
      { key: "market", enabled: false },
      { key: "contractors", enabled: true },
    ])
  })

  it("round-trips through hiddenStandardTabs", () => {
    const hidden = new Set(["services", "contractors"])
    const rows = toggleableTabChoices(hidden).map((c) => ({
      standard_tab_key: c.key,
      enabled: c.enabled,
    }))
    expect([...hiddenStandardTabs(rows)].sort()).toEqual([...hidden].sort())
  })
})
