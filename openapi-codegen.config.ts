import type { ConfigFile } from "@rtk-query/codegen-openapi"

/**
 * API path prefixes → output file names.
 * Each operation is assigned to the first prefix its path starts with.
 * Order matters: more specific prefixes (e.g. /api/market/listing) should
 * come before broader ones (e.g. /api/market) if both exist.
 */
const API_DOMAINS: { pathPrefix: string; fileName: string }[] = [
  { pathPrefix: "/api/starmap", fileName: "starmap" },
  { pathPrefix: "/api/profile", fileName: "profile" },
  { pathPrefix: "/api/notification", fileName: "notifications" },
  { pathPrefix: "/api/push", fileName: "push" },
  { pathPrefix: "/api/email", fileName: "email" },
  { pathPrefix: "/api/market", fileName: "market" },
  { pathPrefix: "/api/recruiting", fileName: "recruiting" },
  { pathPrefix: "/api/comments", fileName: "comments" },
  { pathPrefix: "/api/chats", fileName: "chats" },
  { pathPrefix: "/api/contractors", fileName: "contractors" },
  { pathPrefix: "/api/contracts", fileName: "contracts" },
  { pathPrefix: "/api/orders", fileName: "orders" },
  { pathPrefix: "/api/offer", fileName: "offers" }, // matches /api/offer and /api/offers
  { pathPrefix: "/api/services", fileName: "services" },
  { pathPrefix: "/api/tokens", fileName: "tokens" },
  { pathPrefix: "/api/admin", fileName: "admin" },
  { pathPrefix: "/api/commodities", fileName: "commodities" },
  { pathPrefix: "/api/wiki", fileName: "wiki" },
  { pathPrefix: "/api/transactions", fileName: "transactions" },
  { pathPrefix: "/api/ships", fileName: "ships" },
  { pathPrefix: "/api/moderation", fileName: "moderation" },
  { pathPrefix: "/api/deliveries", fileName: "deliveries" },
]

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

const outputFiles: ConfigFile["outputFiles"] = {}

const pathPrefixes = new Set(API_DOMAINS.map((d) => d.pathPrefix))

// Generate output files for v1 API domains (existing API)
for (const { pathPrefix, fileName } of API_DOMAINS) {
  const outputPath = `${OUTPUT_DIR}/${fileName}.ts`
  outputFiles[outputPath] = {
    filterEndpoints: (_name, def) => def.path.startsWith(pathPrefix),
    exportName: `${fileName}Api`,
    tag: true,
  }
}

// Catch-all for any /api path not covered by a domain (avoids dropping endpoints)
outputFiles[`${OUTPUT_DIR}/core.ts`] = {
  filterEndpoints: (_name, def) =>
    def.path.startsWith("/api/") &&
    ![...pathPrefixes].some((prefix) => def.path.startsWith(prefix)),
  exportName: "coreApi",
  tag: true,
}

const config: ConfigFile = {
  schemaFile: "./spec/sc-market.openapi.json",
  apiFile: "./src/store/generatedApi.ts",
  apiImport: "generatedApi",
  hooks: true,
  tag: true,
  outputFiles,
}

// v2 API configuration (will be used when v2 spec is available)
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

const configV2: ConfigFile = {
  schemaFile: "./spec/sc-market-v2.openapi.json",
  apiFile: "./src/store/generatedApi.ts",
  apiImport: "generatedApi",
  hooks: true,
  tag: true,
  outputFiles: outputFilesV2,
}

export default config
export { configV2 }
