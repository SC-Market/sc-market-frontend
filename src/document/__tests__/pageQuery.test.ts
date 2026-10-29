import { describe, expect, it } from "vitest"
import { hasPageQuery } from "../pageQuery"

describe("hasPageQuery", () => {
  it("is false without a query or with only tracking params and ?lng", () => {
    expect(hasPageQuery("")).toBe(false)
    expect(hasPageQuery("?")).toBe(false)
    expect(hasPageQuery("?utm_source=discord&utm_medium=chat")).toBe(false)
    expect(hasPageQuery("?fbclid=x&gclid=y&msclkid=z&ref=home&lng=en")).toBe(false)
  })

  it("is true with a filter", () => {
    expect(hasPageQuery("?category=missiontype.delivery")).toBe(true)
    expect(hasPageQuery("?utm_source=x&q=aurora")).toBe(true)
    expect(hasPageQuery("?refx=1")).toBe(true)
  })
})
