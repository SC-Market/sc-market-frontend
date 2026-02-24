import type { ConfigFile } from "@rtk-query/codegen-openapi"

/**
 * v2 API path prefixes → output file names.
 * These are generated from the v2 OpenAPI spec and placed in the v2/ subdirectory.
 */
const API_DOMAINS_V2: { pathPrefix: string; fileName: string }[] = [
  { pathPrefix: "/api/v2/starmap", fileName: "v2/starmap" },
  { pathPrefix: "/api/v2/profile", fileName: "v2/profile" },
  { pathPrefix: "/api/v2/notification", fileName: "v2/notifications" },
  { pathPrefix: "/api/v2/push", fileName: "v2/push" },
  { pathPrefix: "/api/v2/email", fileName: "v2/email" },
  { pathPrefix: "/api/v2/market", fileName: "v2/market" },
  { pathPrefix: "/api/v2/recruiting", fileName: "v2/recruiting" },
  { pathPrefix: "/api/v2/comments", fileName: "v2/comments" },
  { pathPrefix: "/api/v2/chats", fileName: "v2/chats" },
  { pathPrefix: "/api/v2/contractors", fileName: "v2/contractors" },
  { pathPrefix: "/api/v2/contracts", fileName: "v2/contracts" },
  { pathPrefix: "/api/v2/orders", fileName: "v2/orders" },
  { pathPrefix: "/api/v2/offer", fileName: "v2/offers" },
  { pathPrefix: "/api/v2/services", fileName: "v2/services" },
  { pathPrefix: "/api/v2/tokens", fileName: "v2/tokens" },
  { pathPrefix: "/api/v2/admin", fileName: "v2/admin" },
  { pathPrefix: "/api/v2/commodities", fileName: "v2/commodities" },
  { pathPrefix: "/api/v2/wiki", fileName: "v2/wiki" },
  { pathPrefix: "/api/v2/transactions", fileName: "v2/transactions" },
  { pathPrefix: "/api/v2/ships", fileName: "v2/ships" },
  { pathPrefix: "/api/v2/moderation", fileName: "v2/moderation" },
  { pathPrefix: "/api/v2/deliveries", fileName: "v2/deliveries" },
]

const OUTPUT_DIR = "./src/store/api"

// v2 API configuration
const outputFilesV2: ConfigFile["outputFiles"] = {}

// Generate output files for v2 API domains
for (const { pathPrefix, fileName } of API_DOMAINS_V2) {
  const outputPath = `${OUTPUT_DIR}/${fileName}.ts`
  outputFilesV2[outputPath] = {
    filterEndpoints: (_name, def) => def.path.startsWith(pathPrefix),
    exportName: `${fileName.replace(/\//g, "_")}Api`,
    tag: true,
  }
}

const config: ConfigFile = {
  schemaFile: "./spec/sc-market-v2.openapi.json",
  apiFile: "./src/store/generatedApi.ts",
  apiImport: "generatedApi",
  hooks: true,
  tag: true,
  outputFiles: outputFilesV2,
}

export default config
