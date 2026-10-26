import { describe, it, expect } from "vitest"
import { SiteRole, isSiteAdmin } from "../siteRole"
import {
  SCOPE_CATEGORIES,
  isAdminOnlyScope,
} from "../../features/api-tokens/domain/scopes"

describe("isSiteAdmin", () => {
  it.each([
    [{ role: SiteRole.Admin }, true],
    [{ role: SiteRole.User }, false],
    [{ role: "Admin" }, false],
    [{}, false],
    [null, false],
    [undefined, false],
  ])("isSiteAdmin(%j) === %s", (profile, expected) => {
    expect(isSiteAdmin(profile)).toBe(expected)
  })

  it("is the only place UI code compares the site role", () => {
    const sources = import.meta.glob<string>(
      ["/src/**/*.{ts,tsx}", "!/src/**/__tests__/**", "!/src/**/*.test.*"],
      { query: "?raw", import: "default", eager: true },
    )
    const INLINE = /\.role\s*[!=]==?\s*["'](admin|user)["']/
    const offenders = Object.entries(sources)
      .filter(([path]) => !path.endsWith("/util/siteRole.ts"))
      .flatMap(([path, text]) =>
        text
          .split("\n")
          .map((line, i) =>
            INLINE.test(line) ? `${path}:${i + 1}: ${line.trim()}` : "",
          )
          .filter((hit) => hit !== ""),
      )
    expect(Object.keys(sources).length).toBeGreaterThan(100)
    expect(offenders).toEqual([])
  })
})

describe("API token scopes", () => {
  const all = Object.values(SCOPE_CATEGORIES).flatMap((c) =>
    c.scopes.map((s) => s.value as string),
  )

  it("no longer offers the dead admin:* sub-scopes", () => {
    expect(all.filter((s) => s.startsWith("admin:"))).toEqual([])
    expect(all).toContain("admin")
  })

  it("treats admin and moderation scopes as admin-only", () => {
    expect(all.filter(isAdminOnlyScope).sort()).toEqual([
      "admin",
      "moderation:read",
      "moderation:write",
    ])
  })
})
