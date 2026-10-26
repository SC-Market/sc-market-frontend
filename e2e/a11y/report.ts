/**
 * Summarize the accessible-name audit (e2e/a11y/names.spec.ts).
 *
 *   npx tsx e2e/a11y/report.ts                     # print the summary
 *   npx tsx e2e/a11y/report.ts --update-baseline   # also rewrite the baseline
 *
 * In CI the summary is appended to $GITHUB_STEP_SUMMARY.
 *
 * Counts: "instances" counts every unlabeled element on every route (the
 * navbar's unlabeled button counts once per route); "unique" counts distinct
 * elements (same rule and same HTML), which is closer to "controls to fix".
 */
import {
  appendFileSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { BASELINE_FILE, type RouteFindings } from "./baseline"

const HERE = dirname(fileURLToPath(import.meta.url))

const REPORT_DIR = resolve(HERE, "../.a11y-report")

export const AREAS: [string, RegExp][] = [
  ["market", /^\/(market|buyorder|buyorders|bulk|sell|services)(\/|$)/],
  [
    "orders",
    /^\/(order|orders|offer|contracts?|delivery|dashboard|customers|send|messages|messaging|notifications|widget)(\/|$)/,
  ],
  [
    "settings",
    /^\/(settings|profile|email|availability|onboarding|accountlink|user)(\/|$)/,
  ],
  [
    "orgs",
    /^\/(org|contractor|contractors|my-orgs|myorg|contractor_invite|recruiting)(\/|$)/,
  ],
  ["shops", /^\/(shop|shops)(\/|$)/],
  [
    "game data",
    /^\/(wiki|missions|blueprints|mining|crafting|resources|shopping-lists|myfleet|inventory)(\/|$)/,
  ],
  ["guides", /^\/(guides|help|about)(\/|$)/],
  ["admin", /^\/admin(\/|$)/],
]

export function areaOf(pattern: string): string {
  return AREAS.find(([, re]) => re.test(pattern))?.[0] ?? "other"
}

function load(): RouteFindings[] {
  return readdirSync(REPORT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(resolve(REPORT_DIR, f), "utf8")))
    .sort((a, b) => (a.pattern < b.pattern ? -1 : 1))
}

const findings = load()
const key = (v: { rule: string; target: string; html: string }) =>
  `${v.rule}|${v.target}|${v.html}`

const areas = new Map<
  string,
  { routes: number; instances: number; unique: Set<string> }
>()
const allUnique = new Map<
  string,
  { rule: string; html: string; routes: string[] }
>()
for (const f of findings) {
  const area = areaOf(f.pattern)
  const a = areas.get(area) ?? { routes: 0, instances: 0, unique: new Set() }
  a.routes++
  a.instances += f.violations.length
  for (const v of f.violations) {
    a.unique.add(key(v))
    const u = allUnique.get(key(v)) ?? {
      rule: v.rule,
      html: v.html,
      routes: [],
    }
    u.routes.push(f.pattern)
    allUnique.set(key(v), u)
  }
  areas.set(area, a)
}

const total = findings.reduce((n, f) => n + f.violations.length, 0)
const neverReady = findings.filter((f) => !f.ready).map((f) => f.pattern)
const lines: string[] = []
lines.push(`## Accessible-name audit`)
lines.push("")
lines.push(
  `${findings.length} routes · **${allUnique.size} unique unlabeled controls** · ${total} instances across routes`,
)
lines.push("")
lines.push(`| Area | Routes | Unique | Instances |`)
lines.push(`| --- | ---: | ---: | ---: |`)
for (const [area] of [...AREAS, ["other"] as [string]]) {
  const a = areas.get(area)
  if (a)
    lines.push(`| ${area} | ${a.routes} | ${a.unique.size} | ${a.instances} |`)
}
lines.push("")
if (allUnique.size) {
  lines.push(
    `<details><summary>Unlabeled controls (most widespread first)</summary>`,
  )
  lines.push("")
  for (const u of [...allUnique.values()].sort(
    (a, b) => b.routes.length - a.routes.length,
  )) {
    const where =
      u.routes.length > 3 ? `${u.routes.length} routes` : u.routes.join(", ")
    lines.push(`- \`${u.rule}\` on ${where}: \`${u.html.replace(/`/g, "'")}\``)
  }
  lines.push("")
  lines.push(`</details>`)
  lines.push("")
}
if (neverReady.length) {
  lines.push(
    `Never reached \`data-ready="true"\` (fake API): ${neverReady.join(", ")}`,
  )
  lines.push("")
}
const summary = lines.join("\n")
console.log(summary)
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n")

if (process.argv.includes("--update-baseline")) {
  const baseline: Record<string, number> = {}
  for (const f of findings)
    if (f.violations.length) baseline[f.pattern] = f.violations.length
  writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2) + "\n")
  console.log(`\nWrote ${BASELINE_FILE}`)
}
