/**
 * Runs RTK Query OpenAPI codegen with the TypeScript config.
 * Usage: npx tsx scripts/codegen-api.ts (from sc-market-frontend)
 */
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { generateEndpoints, parseConfig } from "@rtk-query/codegen-openapi"
import config, { configV2 } from "../openapi-codegen.config.ts"

// Generate v1 API clients (existing API)
console.log("Generating v1 API clients...")
const configs = parseConfig(config as Parameters<typeof parseConfig>[0])
for (const c of configs) {
  console.log(`Generating ${c.outputFile}`)
  await generateEndpoints(c)
  console.log("Done")
}

// Generate v2 API clients if v2 spec exists
const v2SpecPath = "./spec/sc-market-v2.openapi.json"
if (existsSync(v2SpecPath)) {
  console.log("\nGenerating v2 API clients...")
  const configsV2 = parseConfig(configV2 as Parameters<typeof parseConfig>[0])
  for (const c of configsV2) {
    console.log(`Generating ${c.outputFile}`)
    await generateEndpoints(c)
    console.log("Done")
  }
} else {
  console.log(
    "\nSkipping v2 API client generation (spec not found at ./spec/sc-market-v2.openapi.json)",
  )
}

console.log("\nFormatting generated code with Prettier...")
execSync("npx prettier --write src/store/api/", { stdio: "inherit" })
