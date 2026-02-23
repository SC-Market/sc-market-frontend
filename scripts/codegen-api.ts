/**
 * Runs RTK Query OpenAPI codegen for v2 API.
 * Usage: npx tsx scripts/codegen-api.ts (from sc-market-frontend)
 */
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { generateEndpoints, parseConfig } from "@rtk-query/codegen-openapi"
import config from "../openapi-codegen.config.ts"

// Generate v2 API clients if v2 spec exists
const v2SpecPath = "./spec/sc-market-v2.openapi.json"
if (existsSync(v2SpecPath)) {
  console.log("Generating v2 API clients...")
  const configs = parseConfig(config as Parameters<typeof parseConfig>[0])
  for (const c of configs) {
    console.log(`Generating ${c.outputFile}`)
    await generateEndpoints(c)
    console.log("Done")
  }

  console.log("\nFormatting generated v2 code with Prettier...")
  execSync("npx prettier --write src/store/api/v2/", { stdio: "inherit" })
} else {
  console.log("No v2 OpenAPI spec found at ./spec/sc-market-v2.openapi.json")
  console.log("Skipping v2 API client generation")
}
