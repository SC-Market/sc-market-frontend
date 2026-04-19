import type { ConfigFile } from "@rtk-query/codegen-openapi"

// V2 API uses codegen with generatedApiV2 (baseUrl includes /api/v2).
// V1 API files are statically maintained.
const config: ConfigFile = {
  schemaFile: "./spec/sc-market-v2.openapi.json",
  apiFile: "./src/store/generatedApiV2.ts",
  apiImport: "generatedApiV2",
  hooks: true,
  tag: true,
  outputFiles: {
    "./src/store/api/v2/market.ts": {
      exportName: "marketV2Api",
      tag: true,
    },
  },
}

export default config
