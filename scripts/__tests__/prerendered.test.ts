// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { rootDataFile, trailingSlashCanonicals } from "../build/prerendered"

describe("trailingSlashCanonicals", () => {
  it("finds a canonical that ends in a slash", () => {
    expect(
      trailingSlashCanonicals(
        '<link rel="canonical" href="https://sc-market.space/blueprints/">',
      ),
    ).toEqual(["https://sc-market.space/blueprints/"])
    expect(
      trailingSlashCanonicals(
        '<link href="https://sc-market.space/wiki/ships/" rel="canonical" />',
      ),
    ).toEqual(["https://sc-market.space/wiki/ships/"])
  })

  it("accepts clean paths, the homepage and other links", () => {
    expect(
      trailingSlashCanonicals(
        [
          '<link rel="canonical" href="https://sc-market.space/blueprints">',
          '<link rel="canonical" href="https://sc-market.space/">',
          '<link rel="alternate" href="https://sc-market.space/fr/">',
        ].join(""),
      ),
    ).toEqual([])
  })
})

describe("rootDataFile", () => {
  let dir: string | undefined
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
    dir = undefined
  })

  it("is React Router 7's /_root.data or 8's /_.data, whichever was written", () => {
    dir = mkdtempSync(path.join(tmpdir(), "prerendered-"))
    expect(rootDataFile(dir)).toBe("/_root.data")
    writeFileSync(path.join(dir, "_.data"), "")
    expect(rootDataFile(dir)).toBe("/_.data")
    writeFileSync(path.join(dir, "_root.data"), "")
    expect(rootDataFile(dir)).toBe("/_root.data")
  })
})
