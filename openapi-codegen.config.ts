import type { ConfigFile } from "@rtk-query/codegen-openapi"

/**
 * v2 API path prefixes → output file names.
 * These are generated from the v2 OpenAPI spec and placed in the v2/ subdirectory.
 */
const API_DOMAINS_V2: { pathPrefix: string; fileName: string }[] = [
  { pathPrefix: "/starmap", fileName: "v2/starmap" },
  { pathPrefix: "/profile", fileName: "v2/profile" },
  { pathPrefix: "/notification", fileName: "v2/notifications" },
  { pathPrefix: "/push", fileName: "v2/push" },
  { pathPrefix: "/email", fileName: "v2/email" },
  { pathPrefix: "/market", fileName: "v2/market" },
  { pathPrefix: "/recruiting", fileName: "v2/recruiting" },
  { pathPrefix: "/comments", fileName: "v2/comments" },
  { pathPrefix: "/chats", fileName: "v2/chats" },
  { pathPrefix: "/contractors", fileName: "v2/contractors" },
  { pathPrefix: "/contracts", fileName: "v2/contracts" },
  { pathPrefix: "/orders", fileName: "v2/orders" },
  { pathPrefix: "/offer", fileName: "v2/offers" },
  { pathPrefix: "/services", fileName: "v2/services" },
  { pathPrefix: "/tokens", fileName: "v2/tokens" },
  { pathPrefix: "/admin", fileName: "v2/admin" },
  { pathPrefix: "/commodities", fileName: "v2/commodities" },
  { pathPrefix: "/wiki", fileName: "v2/wiki" },
  { pathPrefix: "/transactions", fileName: "v2/transactions" },
  { pathPrefix: "/ships", fileName: "v2/ships" },
  { pathPrefix: "/moderation", fileName: "v2/moderation" },
  { pathPrefix: "/deliveries", fileName: "v2/deliveries" },
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
