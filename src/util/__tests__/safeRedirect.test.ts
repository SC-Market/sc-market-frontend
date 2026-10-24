import { describe, it, expect } from "vitest"
import { safeRedirectPath } from "../safeRedirect"

describe("safeRedirectPath", () => {
  it.each(["/", "/market", "/market/abc?tab=2#x", "/shops/foo-bar"])("keeps %j", (p) => {
    expect(safeRedirectPath(p, "/dashboard")).toBe(p)
  })

  it.each([
    null,
    undefined,
    "",
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "\\\\evil.com",
    "/\tevil.com",
    "/\n/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
  ])("falls back for %j", (p) => {
    expect(safeRedirectPath(p, "/dashboard")).toBe("/dashboard")
  })
})
