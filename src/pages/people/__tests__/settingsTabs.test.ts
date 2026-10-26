import { describe, expect, it } from "vitest"
import { SETTINGS_TABS, settingsTabFromQuery, settingsTabKey } from "../settingsTabs"

describe("settingsTabFromQuery", () => {
  it("opens the Email tab for the link used in notification emails", () => {
    expect(settingsTabFromQuery(new URLSearchParams("tab=email"))).toBe(8)
  })

  it("opens Push and Price Alerts by name", () => {
    expect(settingsTabFromQuery(new URLSearchParams("tab=push"))).toBe(7)
    expect(settingsTabFromQuery(new URLSearchParams("tab=price-alerts"))).toBe(12)
  })

  it("keeps the old ?mfa=1 link working", () => {
    expect(settingsTabFromQuery(new URLSearchParams("mfa=1"))).toBe(SETTINGS_TABS.mfa)
  })

  it("ignores unknown or missing tabs", () => {
    expect(settingsTabFromQuery(new URLSearchParams("tab=nope"))).toBeNull()
    expect(settingsTabFromQuery(new URLSearchParams(""))).toBeNull()
    expect(settingsTabFromQuery(new URLSearchParams("tab=constructor"))).toBeNull()
  })

  it("round-trips every tab key", () => {
    for (const [key, index] of Object.entries(SETTINGS_TABS)) {
      expect(settingsTabKey(index)).toBe(key)
      expect(settingsTabFromQuery(new URLSearchParams({ tab: key }))).toBe(index)
    }
  })
})
