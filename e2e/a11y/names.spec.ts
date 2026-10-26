/**
 * Accessible-name audit: every route of the app (src/routes.ts), loaded in the
 * e2e build with the fake API, checked with axe-core for controls that have
 * no accessible name (unlabeled buttons, links, inputs, selects, toggles).
 * Accessible names are what the chrome-devtools MCP a11y snapshot and
 * Playwright's getByRole() select on; see docs/testing-with-mcp.md.
 *
 * Each route writes its findings to e2e/.a11y-report/; `npm run e2e:a11y:report`
 * prints the totals (per area, deduplicated) and the CI job puts them in the
 * job summary. A route fails when it has MORE violations than recorded in
 * e2e/a11y-baseline.json, so coverage can only go up. After fixing some,
 * lower the baseline: A11Y_UPDATE_BASELINE=1 npm run e2e:a11y.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { expect, main, test } from "../support/test"
import { appRoutes } from "../support/routes"
import { BASELINE, reportFile, type RouteFindings } from "./baseline"

const HERE = dirname(fileURLToPath(import.meta.url))

const require = createRequire(import.meta.url)
const AXE_PATH = require.resolve("axe-core/axe.min.js")

/** axe rules for "this control has no accessible name". */
export const NAME_RULES = [
  "button-name",
  "link-name",
  "label",
  "select-name",
  "input-button-name",
  "aria-input-field-name",
  "aria-toggle-field-name",
  "aria-command-name",
]

const REPORT_DIR = resolve(HERE, "../.a11y-report")
mkdirSync(REPORT_DIR, { recursive: true })

interface AxeNode {
  target: string[]
  html: string
}
interface AxeViolation {
  id: string
  nodes: AxeNode[]
}

for (const route of appRoutes()) {
  test.describe(route.pattern, () => {
    test.use({ session: route.session })

    test(`names: ${route.pattern}`, async ({ page }) => {
      await page.goto(route.url)
      // Audit the settled page; a page that never becomes ready is audited
      // as-is and flagged in the report.
      const ready = await expect(main(page))
        .toHaveAttribute("data-ready", "true", { timeout: 10_000 })
        .then(() => true)
        .catch(() => false)
      await page.addScriptTag({ path: AXE_PATH })
      const violations: AxeViolation[] = await page.evaluate(async (rules) => {
        const axe = (window as unknown as { axe: { run: Function } }).axe
        const result = await axe.run(document, {
          runOnly: { type: "rule", values: rules },
          resultTypes: ["violations"],
        })
        return result.violations.map((v: AxeViolation) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, html: n.html })),
        }))
      }, NAME_RULES)

      const findings: RouteFindings = {
        pattern: route.pattern,
        url: route.url,
        session: route.session,
        finalUrl: new URL(page.url()).pathname,
        ready,
        violations: violations.flatMap((v) =>
          v.nodes.map((n) => ({
            rule: v.id,
            target: n.target.join(" "),
            html: n.html.replace(/\s+/g, " ").slice(0, 240),
          })),
        ),
      }
      writeFileSync(
        reportFile(REPORT_DIR, route.pattern),
        JSON.stringify(findings, null, 2),
      )

      if (!process.env.A11Y_UPDATE_BASELINE) {
        const allowed = BASELINE[route.pattern] ?? 0
        expect(
          findings.violations.length,
          `unlabeled controls on ${route.pattern} (baseline ${allowed}):\n` +
            findings.violations.map((v) => `  ${v.rule}: ${v.html}`).join("\n"),
        ).toBeLessThanOrEqual(allowed)
      }
    })
  })
}
