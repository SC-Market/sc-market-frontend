#!/usr/bin/env node
/**
 * Asset carry-over: keep recent builds' hashed /assets files in the new deploy.
 *
 * Cloudflare Pages serves only the current deployment's files, so a tab still
 * running the previous build gets a 404 for any chunk that changed: the
 * stale-chunk retry → reload path. With several deploys an hour that is most
 * open tabs. This step, run after `vite build` (package.json "build"), copies
 * the still-referenced files of the last few builds into dist/assets, so an
 * old tab's chunk loads from the new deployment itself.
 *
 * How:
 * 1. Every build writes dist/assets-manifest.json: each runtime asset with its
 *    sha256, size, first-seen time and the newest build that produced it
 *    natively ("lastBuild"); plus the list of recent builds.
 * 2. On a production Pages build (CF_PAGES=1, branch main) it fetches the live
 *    manifest from https://sc-market.space, keeps files whose lastBuild is one
 *    of the retained builds (see RETENTION), downloads them from prod, checks
 *    each against its recorded sha256 (byte-identical or dropped), and writes
 *    only names that do not already exist (never overwrites this build).
 * 3. Anything going wrong (offline, bad manifest, slow downloads) logs a
 *    warning and the build continues without (or with partial) carry-over.
 *    This step never fails the build.
 *
 * Never carried: *.html (index.html lives outside /assets; assets/404.html is
 * a fixed public file) and *.map (not needed at runtime). Carried files are
 * under /assets/*, so they get the same immutable headers (public/_headers).
 */
import { createHash } from "node:crypto"
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const MANIFEST_NAME = "assets-manifest.json"
export const ORIGIN = "https://sc-market.space"

/**
 * Keep the files of the current build plus the previous 4 (5 builds), and only
 * builds from the last 7 days, whichever is fewer. Hard caps keep the deploy
 * far under Cloudflare Pages' limits (20,000 files, 25 MiB per file).
 */
export const RETENTION = {
  maxPreviousBuilds: 4,
  maxAgeMs: 7 * 24 * 60 * 60 * 1000,
  maxCarriedFiles: 4000,
  maxCarriedBytes: 150 * 1024 * 1024,
  maxFileBytes: 20 * 1024 * 1024,
}

const DOWNLOAD_CONCURRENCY = 12
const FILE_TIMEOUT_MS = 15_000
const TOTAL_BUDGET_MS = 120_000

/** Runtime assets only: not source maps, not HTML. */
export function isCarryable(name) {
  return !/\.(map|html)$/i.test(name)
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex")
}

/** { name: { sha256, size } } for the runtime files vite wrote to dist/assets. */
export function scanBuildAssets(assetsDir) {
  const files = {}
  if (!existsSync(assetsDir)) return files
  for (const name of readdirSync(assetsDir)) {
    const full = path.join(assetsDir, name)
    if (!statSync(full).isFile() || !isCarryable(name)) continue
    const buf = readFileSync(full)
    files[name] = { sha256: sha256(buf), size: buf.length }
  }
  return files
}

function isValidManifest(m) {
  return (
    m &&
    m.version === 1 &&
    Array.isArray(m.builds) &&
    m.builds.every((b) => typeof b?.id === "string" && Number.isFinite(b?.builtAt)) &&
    m.files &&
    typeof m.files === "object"
  )
}

/**
 * Decide which files of the live manifest to carry into this build.
 * Pure: no I/O. Returns the retained previous builds and the files to fetch.
 */
export function planCarryOver(live, current, now, retention = RETENTION) {
  if (!isValidManifest(live)) return { keptBuilds: [], carry: [] }
  const keptBuilds = [...live.builds]
    .sort((a, b) => b.builtAt - a.builtAt)
    .filter((b) => now - b.builtAt <= retention.maxAgeMs)
    .slice(0, retention.maxPreviousBuilds)
  const rank = new Map(keptBuilds.map((b, i) => [b.id, i]))

  const candidates = Object.entries(live.files)
    .filter(([name, f]) => {
      if (!isCarryable(name) || name.includes("/") || name.startsWith(".")) return false
      if (current[name]) return false // this build has it: never overwrite
      if (!rank.has(f?.lastBuild)) return false
      if (typeof f.sha256 !== "string" || !Number.isFinite(f.size)) return false
      return f.size <= retention.maxFileBytes
    })
    // Newest builds first, so caps drop the oldest builds' files.
    .sort((a, b) => rank.get(a[1].lastBuild) - rank.get(b[1].lastBuild))

  const carry = []
  let bytes = 0
  for (const [name, f] of candidates) {
    if (carry.length >= retention.maxCarriedFiles) break
    if (bytes + f.size > retention.maxCarriedBytes) break
    bytes += f.size
    carry.push({ name, ...f })
  }
  return { keptBuilds, carry }
}

/** The manifest this build publishes. */
export function buildManifest({ buildId, now, current, live, keptBuilds, carried }) {
  const liveFiles = isValidManifest(live) ? live.files : {}
  const files = {}
  for (const [name, f] of Object.entries(current)) {
    files[name] = {
      sha256: f.sha256,
      size: f.size,
      firstSeen: liveFiles[name]?.sha256 === f.sha256 ? liveFiles[name].firstSeen : now,
      lastBuild: buildId,
    }
  }
  for (const f of carried) {
    files[f.name] = {
      sha256: f.sha256,
      size: f.size,
      firstSeen: f.firstSeen,
      lastBuild: f.lastBuild,
    }
  }
  return {
    version: 1,
    builds: [{ id: buildId, builtAt: now }, ...keptBuilds],
    files,
  }
}

async function fetchWithTimeout(fetchImpl, url, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetchImpl(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Download and verify `carry` into assetsDir; returns the files written. */
async function downloadAll({ carry, assetsDir, origin, fetchImpl, log, deadline }) {
  const written = []
  let skipped = 0
  let next = 0
  async function worker() {
    while (next < carry.length) {
      const f = carry[next++]
      if (Date.now() > deadline) {
        skipped++
        continue
      }
      try {
        const res = await fetchWithTimeout(fetchImpl, `${origin}/assets/${f.name}`, FILE_TIMEOUT_MS)
        if (!res.ok) {
          skipped++
          continue
        }
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length !== f.size || sha256(buf) !== f.sha256) {
          skipped++
          continue
        }
        const dest = path.join(assetsDir, f.name)
        if (existsSync(dest)) continue // never overwrite a file of this build
        writeFileSync(dest, buf, { flag: "wx" })
        written.push(f)
      } catch {
        skipped++
      }
    }
  }
  await Promise.all(Array.from({ length: DOWNLOAD_CONCURRENCY }, worker))
  if (skipped) log(`[asset-carryover] skipped ${skipped} file(s) (missing, changed or slow)`)
  return written
}

/**
 * The build step. Never throws: on any failure it publishes a manifest of
 * this build's own files (plus whatever was carried before the failure).
 */
export async function runCarryOver({
  distDir,
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = Date.now(),
  origin = ORIGIN,
  log = (msg) => console.warn(msg),
}) {
  const assetsDir = path.join(distDir, "assets")
  const buildId = (env.CF_PAGES_COMMIT_SHA || `local-${now}`).slice(0, 40)
  let current = {}
  let live = null
  let keptBuilds = []
  let carried = []
  try {
    current = scanBuildAssets(assetsDir)
    const enabled =
      env.ASSET_CARRYOVER === "1" ||
      (env.CF_PAGES === "1" && env.CF_PAGES_BRANCH === "main" && env.ASSET_CARRYOVER !== "0")
    if (enabled) {
      const res = await fetchWithTimeout(fetchImpl, `${origin}/${MANIFEST_NAME}?t=${now}`, FILE_TIMEOUT_MS)
      if (!res.ok) throw new Error(`live manifest: HTTP ${res.status}`)
      live = await res.json()
      if (!isValidManifest(live)) throw new Error("live manifest: unexpected format")
      const plan = planCarryOver(live, current, now)
      keptBuilds = plan.keptBuilds
      carried = await downloadAll({
        carry: plan.carry,
        assetsDir,
        origin,
        fetchImpl,
        log,
        deadline: now + TOTAL_BUDGET_MS,
      })
      log(
        `[asset-carryover] carried ${carried.length}/${plan.carry.length} file(s) from ${keptBuilds.length} previous build(s)`,
      )
    }
  } catch (error) {
    log(`[asset-carryover] WARNING: continuing without carry-over: ${error?.message ?? error}`)
    // Keep a successfully parsed live manifest's history only if files were carried.
    if (carried.length === 0) keptBuilds = []
  }
  const manifest = buildManifest({ buildId, now, current, live, keptBuilds, carried })
  try {
    writeFileSync(path.join(distDir, MANIFEST_NAME), JSON.stringify(manifest))
  } catch (error) {
    log(`[asset-carryover] WARNING: could not write ${MANIFEST_NAME}: ${error?.message ?? error}`)
  }
  return { manifest, carried }
}

// CLI: node scripts/asset-carryover.mjs [distDir]
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const distDir = path.resolve(process.argv[2] || "dist")
  runCarryOver({ distDir }).then(
    () => process.exit(0),
    (error) => {
      console.warn(`[asset-carryover] WARNING: ${error?.message ?? error}`)
      process.exit(0)
    },
  )
}
