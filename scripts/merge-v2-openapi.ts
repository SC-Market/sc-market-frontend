/**
 * Merges the V2 OpenAPI spec from backend into the frontend's main OpenAPI spec.
 * This allows the RTK Query codegen to generate the V2 API client.
 * 
 * Usage: npx tsx scripts/merge-v2-openapi.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const BACKEND_V2_SPEC = "../sc-market-backend/src/api/routes/v2/generated/swagger.json"
const FRONTEND_SPEC = "./spec/sc-market.openapi.json"

console.log("Reading V2 OpenAPI spec from backend...")
const v2Spec = JSON.parse(readFileSync(resolve(BACKEND_V2_SPEC), "utf-8"))

console.log("Reading main OpenAPI spec...")
const mainSpec = JSON.parse(readFileSync(resolve(FRONTEND_SPEC), "utf-8"))

console.log("Merging V2 paths into main spec...")
// Merge paths
if (!mainSpec.paths) {
  mainSpec.paths = {}
}
Object.assign(mainSpec.paths, v2Spec.paths)

console.log("Merging V2 components into main spec...")
// Merge components (schemas, responses, etc.)
if (!mainSpec.components) {
  mainSpec.components = {}
}
if (v2Spec.components) {
  for (const [componentType, components] of Object.entries(v2Spec.components)) {
    if (!mainSpec.components[componentType]) {
      mainSpec.components[componentType] = {}
    }
    Object.assign(mainSpec.components[componentType], components)
  }
}

console.log("Writing merged spec...")
writeFileSync(FRONTEND_SPEC, JSON.stringify(mainSpec, null, 2))

console.log("✓ V2 OpenAPI spec merged successfully!")
console.log("Run 'npm run codegen:api' to generate the TypeScript client.")
