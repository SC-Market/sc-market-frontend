/**
 * Runs RTK Query OpenAPI codegen with the TypeScript config.
 * Usage: npx tsx scripts/codegen-api.ts (from sc-market-frontend)
 */
import { execSync } from "node:child_process"
import { generateEndpoints, parseConfig } from "@rtk-query/codegen-openapi"
import config from "../openapi-codegen.config.ts"

const configs = parseConfig(config as Parameters<typeof parseConfig>[0])
for (const c of configs) {
  console.log(`Generating ${c.outputFile}`)
  await generateEndpoints(c)
  console.log("Done")
}

console.log("Formatting generated code with Prettier...")
execSync("npx prettier --write src/store/api/", { stdio: "inherit" })
