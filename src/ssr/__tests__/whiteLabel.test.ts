import { describe, it, expect, beforeEach } from "vitest"
import {
  customDomainFromRequest,
  seedRenderedWhiteLabel,
  whiteLabelOrgTheme,
} from "../whiteLabel"
import type { SsrWhiteLabel } from "../protocol"
import {
  getWhiteLabelConfig,
  resolveBrowserCustomDomain,
} from "../../hooks/contractor/CustomDomain"
import {
  cacheOrgTheme,
  getCachedOrgTheme,
  getCachedUpdatedAt,
} from "../../hooks/styles/themeCache"

const HOST = window.location.hostname

const rendered = (
  theme: SsrWhiteLabel["theme"],
  hostname = HOST,
): SsrWhiteLabel => ({
  hostname,
  domain: {
    spectrum_id: "MEDRUNNER",
    contractor_id: "c1",
    name: "Medrunner",
    focus_mode: "public",
    homepage_path: null,
    require_membership: false,
  },
  theme,
})

const THEME: SsrWhiteLabel["theme"] = {
  theme_data: {
    light: { palette: { primary: { main: "#263d55" } } },
    dark: { palette: { primary: { main: "#2c5278" } } },
  },
  favicon_url: null,
  updated_at: "2026-11-01T00:00:00Z",
}

beforeEach(() => localStorage.clear())

describe("seedRenderedWhiteLabel", () => {
  it("seeds the domain and theme caches the first render reads", () => {
    expect(seedRenderedWhiteLabel(rendered(THEME))).toBe(true)
    expect(getWhiteLabelConfig()).toMatchObject({
      spectrum_id: "MEDRUNNER",
      name: "Medrunner",
      hostname: HOST,
    })
    expect(getCachedUpdatedAt("MEDRUNNER")).toBe(THEME!.updated_at)
    expect(getCachedOrgTheme("MEDRUNNER", "dark")?.palette.primary.main).toBe(
      "#2c5278",
    )
  })

  it("drops an older cached theme when the page was rendered without one", () => {
    cacheOrgTheme(
      "MEDRUNNER",
      THEME!.theme_data as never,
      null,
      "2026-01-01T00:00:00Z",
    )
    seedRenderedWhiteLabel(rendered(null))
    expect(getCachedOrgTheme("MEDRUNNER", "dark")).toBeNull()
  })

  it("ignores HTML rendered for another host", () => {
    expect(seedRenderedWhiteLabel(rendered(THEME, "other.example.com"))).toBe(
      false,
    )
    expect(seedRenderedWhiteLabel(undefined)).toBe(false)
    expect(getWhiteLabelConfig()).toBeNull()
  })
})

describe("server-side white-label context", () => {
  it("is the main site without a resolved host, the org with one", () => {
    expect(customDomainFromRequest(null)).toEqual({
      isCustomDomain: false,
      customOrg: undefined,
    })
    expect(customDomainFromRequest(rendered(THEME))).toEqual({
      isCustomDomain: true,
      customOrg: "MEDRUNNER",
    })
  })

  it("builds the same theme the browser builds from its seeded cache", () => {
    seedRenderedWhiteLabel(rendered(THEME))
    for (const mode of ["light", "dark"] as const) {
      const server = whiteLabelOrgTheme(rendered(THEME), mode)
      const browser = getCachedOrgTheme("MEDRUNNER", mode)
      expect(server?.palette.primary.main).toBe(browser?.palette.primary.main)
      expect(server?.palette.mode).toBe(browser?.palette.mode)
    }
    expect(whiteLabelOrgTheme(rendered(null), "dark")).toBeNull()
    expect(whiteLabelOrgTheme(null, "dark")).toBeNull()
  })

  it("leaves the browser's own resolution to the cache on the main site", () => {
    // jsdom's host is localhost: the main site, whatever is cached.
    seedRenderedWhiteLabel(rendered(THEME))
    expect(resolveBrowserCustomDomain()).toEqual({
      isCustomDomain: false,
      customOrg: undefined,
    })
  })
})
