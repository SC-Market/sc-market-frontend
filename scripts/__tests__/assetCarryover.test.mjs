import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs"
import { createHash } from "node:crypto"
import os from "node:os"
import path from "node:path"
import { describe, it, expect, vi } from "vitest"
import {
  RETENTION,
  buildManifest,
  planCarryOver,
  runCarryOver,
  scanBuildAssets,
} from "../asset-carryover.mjs"

const DAY = 24 * 60 * 60 * 1000
const NOW = 1_800_000_000_000
const sha = (s) => createHash("sha256").update(s).digest("hex")
const entry = (content, lastBuild, firstSeen = NOW - DAY) => ({
  sha256: sha(content),
  size: Buffer.byteLength(content),
  firstSeen,
  lastBuild,
})

/** Live manifest with builds b0 (newest) … bN, one unique file per build. */
function liveManifest(builds) {
  const files = {}
  for (const b of builds) files[`${b.id}-chunk.js`] = entry(`code of ${b.id}`, b.id)
  return { version: 1, builds, files }
}

function distWith(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "carry-"))
  mkdirSync(path.join(dir, "assets"))
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(dir, "assets", name), content)
  }
  return dir
}

function prodFetch(live, bodies) {
  return vi.fn(async (url) => {
    if (url.includes("assets-manifest.json")) {
      return new Response(JSON.stringify(live), { status: 200 })
    }
    const name = url.split("/assets/")[1]
    if (name in bodies) return new Response(bodies[name], { status: 200 })
    return new Response("<!doctype html>404", { status: 404 })
  })
}

const prodEnv = { CF_PAGES: "1", CF_PAGES_BRANCH: "main", CF_PAGES_COMMIT_SHA: "current" }

describe("planCarryOver retention", () => {
  it("keeps at most the previous 4 builds (5 with the current one)", () => {
    const builds = Array.from({ length: 8 }, (_, i) => ({ id: `b${i}`, builtAt: NOW - (i + 1) * 60_000 }))
    const plan = planCarryOver(liveManifest(builds), {}, NOW)
    expect(plan.keptBuilds.map((b) => b.id)).toEqual(["b0", "b1", "b2", "b3"])
    expect(plan.carry.map((f) => f.name)).toEqual(["b0-chunk.js", "b1-chunk.js", "b2-chunk.js", "b3-chunk.js"])
  })

  it("drops builds older than 7 days even when under the count", () => {
    const builds = [
      { id: "fresh", builtAt: NOW - DAY },
      { id: "old", builtAt: NOW - 8 * DAY },
    ]
    const plan = planCarryOver(liveManifest(builds), {}, NOW)
    expect(plan.keptBuilds.map((b) => b.id)).toEqual(["fresh"])
    expect(plan.carry.map((f) => f.name)).toEqual(["fresh-chunk.js"])
  })

  it("never plans a file this build already has, a source map or HTML", () => {
    const live = {
      version: 1,
      builds: [{ id: "b0", builtAt: NOW - 1000 }],
      files: {
        "same-abc.js": entry("x", "b0"),
        "old-def.js.map": entry("m", "b0"),
        "404.html": entry("h", "b0"),
        "../escape.js": entry("e", "b0"),
      },
    }
    const plan = planCarryOver(live, { "same-abc.js": { sha256: sha("x"), size: 1 } }, NOW)
    expect(plan.carry).toEqual([])
  })

  it("applies the file and byte caps, dropping the oldest builds' files first", () => {
    const builds = [
      { id: "new", builtAt: NOW - 1000 },
      { id: "older", builtAt: NOW - 2000 },
    ]
    const plan = planCarryOver(liveManifest(builds), {}, NOW, { ...RETENTION, maxCarriedFiles: 1 })
    expect(plan.carry.map((f) => f.name)).toEqual(["new-chunk.js"])
  })

  it("rejects a malformed manifest", () => {
    expect(planCarryOver({ version: 2 }, {}, NOW)).toEqual({ keptBuilds: [], carry: [] })
    expect(planCarryOver(null, {}, NOW)).toEqual({ keptBuilds: [], carry: [] })
  })
})

describe("runCarryOver", () => {
  it("carries verified files from prod, never overwrites, and records them", async () => {
    const live = {
      version: 1,
      builds: [{ id: "prev", builtAt: NOW - 60_000 }],
      files: {
        "Settings-OLD.js": entry("old settings", "prev"),
        "Tampered-OLD.js": entry("expected bytes", "prev"),
        "shared-SAME.js": entry("shared", "prev"),
      },
    }
    const dist = distWith({ "Settings-NEW.js": "new settings", "shared-SAME.js": "shared", "404.html": "x" })
    const fetchImpl = prodFetch(live, {
      "Settings-OLD.js": "old settings",
      "Tampered-OLD.js": "different bytes",
    })

    const { manifest } = await runCarryOver({ distDir: dist, env: prodEnv, fetchImpl, now: NOW, log: () => {} })

    const assets = path.join(dist, "assets")
    expect(readFileSync(path.join(assets, "Settings-OLD.js"), "utf8")).toBe("old settings")
    expect(existsSync(path.join(assets, "Tampered-OLD.js"))).toBe(false)
    expect(readFileSync(path.join(assets, "Settings-NEW.js"), "utf8")).toBe("new settings")
    expect(manifest.builds.map((b) => b.id)).toEqual(["current", "prev"])
    expect(manifest.files["Settings-OLD.js"].lastBuild).toBe("prev")
    expect(manifest.files["Settings-NEW.js"].lastBuild).toBe("current")
    expect(manifest.files["shared-SAME.js"]).toMatchObject({ lastBuild: "current", firstSeen: NOW - DAY })
    expect(manifest.files["404.html"]).toBeUndefined()
    expect(JSON.parse(readFileSync(path.join(dist, "assets-manifest.json"), "utf8"))).toEqual(manifest)
  })

  it("an unreachable prod never breaks the build: own files only, warning logged", async () => {
    const dist = distWith({ "Settings-NEW.js": "new settings" })
    const log = vi.fn()
    const fetchImpl = vi.fn(async () => {
      throw new Error("ENOTFOUND sc-market.space")
    })

    const { manifest, carried } = await runCarryOver({ distDir: dist, env: prodEnv, fetchImpl, now: NOW, log })

    expect(carried).toEqual([])
    expect(Object.keys(manifest.files)).toEqual(["Settings-NEW.js"])
    expect(manifest.builds).toEqual([{ id: "current", builtAt: NOW }])
    expect(log).toHaveBeenCalledWith(expect.stringContaining("WARNING"))
    expect(readdirSync(path.join(dist, "assets"))).toEqual(["Settings-NEW.js"])
  })

  it("a missing live manifest (first deploy) or a 404 file is not an error for the build", async () => {
    const dist = distWith({ "A-NEW.js": "a" })
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 404 }))
    const { manifest } = await runCarryOver({ distDir: dist, env: prodEnv, fetchImpl, now: NOW, log: () => {} })
    expect(Object.keys(manifest.files)).toEqual(["A-NEW.js"])
  })

  it("does nothing over the network outside production Pages builds (CI, previews, local)", async () => {
    const dist = distWith({ "A-NEW.js": "a" })
    const fetchImpl = vi.fn()
    for (const env of [{}, { CF_PAGES: "1", CF_PAGES_BRANCH: "feature" }]) {
      await runCarryOver({ distDir: dist, env, fetchImpl, now: NOW, log: () => {} })
    }
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(scanBuildAssets(path.join(dist, "assets"))["A-NEW.js"].sha256).toBe(sha("a"))
  })

  it("buildManifest keeps firstSeen for unchanged files and stamps new ones", () => {
    const m = buildManifest({
      buildId: "c",
      now: NOW,
      current: { "x.js": { sha256: sha("x"), size: 1 }, "y.js": { sha256: sha("y"), size: 1 } },
      live: { version: 1, builds: [], files: { "x.js": entry("x", "p", 123) } },
      keptBuilds: [],
      carried: [],
    })
    expect(m.files["x.js"].firstSeen).toBe(123)
    expect(m.files["y.js"].firstSeen).toBe(NOW)
  })
})
