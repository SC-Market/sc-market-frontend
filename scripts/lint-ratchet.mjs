#!/usr/bin/env node
// Lint ratchet: ESLint's warning (and error) counts over src/ may only go
// down. The baseline is scripts/lint-baseline.json; CI runs this script.
//
//   node scripts/lint-ratchet.mjs           check against the baseline
//   node scripts/lint-ratchet.mjs --update  write today's counts as the baseline
//
// prettier/prettier counts like any other rule: src stays Prettier-clean.
// react-hooks/rules-of-hooks must stay at zero whatever the baseline says.
//
// Fixed some warnings? Run with --update and commit the lower baseline.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { ESLint } from "eslint"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const baselinePath = join(root, "scripts", "lint-baseline.json")
const update = process.argv.includes("--update")

const eslint = new ESLint({ cwd: root })
const results = await eslint.lintFiles(["src"])

const counts = { warnings: 0, errors: 0, byRule: {} }
const hookErrors = []
for (const file of results) {
  for (const m of file.messages) {
    const rule = m.ruleId ?? "(eslint)"
    if (m.severity === 2) counts.errors++
    else counts.warnings++
    counts.byRule[rule] = (counts.byRule[rule] ?? 0) + 1
    if (rule === "react-hooks/rules-of-hooks") {
      hookErrors.push(`${relative(root, file.filePath)}:${m.line} ${m.message}`)
    }
  }
}
counts.byRule = Object.fromEntries(
  Object.entries(counts.byRule).sort(([a], [b]) => a.localeCompare(b)),
)

if (update) {
  writeFileSync(baselinePath, JSON.stringify(counts, null, 2) + "\n")
  console.log(
    `Baseline written: ${counts.warnings} warnings, ${counts.errors} errors.`,
  )
  process.exit(0)
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"))
let failed = false

if (hookErrors.length > 0) {
  failed = true
  console.error("react-hooks/rules-of-hooks must have no violations:")
  for (const line of hookErrors) console.error(`  ${line}`)
}

for (const kind of ["warnings", "errors"]) {
  if (counts[kind] > baseline[kind]) {
    failed = true
    console.error(
      `ESLint ${kind} went up: ${baseline[kind]} -> ${counts[kind]}.`,
    )
  }
}
if (failed) {
  const rose = Object.entries(counts.byRule)
    .filter(([rule, n]) => n > (baseline.byRule?.[rule] ?? 0))
    .map(([rule, n]) => `  ${rule}: ${baseline.byRule?.[rule] ?? 0} -> ${n}`)
  if (rose.length) console.error(`Rules that rose:\n${rose.join("\n")}`)
  console.error("Run `npx eslint <file>` on the files you changed to see them.")
  process.exit(1)
}

console.log(
  `Lint ratchet OK: ${counts.warnings} warnings (baseline ${baseline.warnings}), ` +
    `${counts.errors} errors (baseline ${baseline.errors}).`,
)
if (counts.warnings < baseline.warnings || counts.errors < baseline.errors) {
  console.log(
    "Counts dropped: run `node scripts/lint-ratchet.mjs --update` and commit the new baseline.",
  )
}
