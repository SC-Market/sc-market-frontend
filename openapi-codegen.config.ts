import type { ConfigFile } from "@rtk-query/codegen-openapi"

// Only V2 API uses codegen. V1 API files are statically maintained.
const config: ConfigFile = {
  schemaFile: "./spec/sc-market-v2.openapi.json",
  apiFile: "./src/store/generatedApi.ts",
  apiImport: "generatedApi",
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
