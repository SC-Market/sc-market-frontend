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

const OUTPUT_DIR = "./src/store/api"

const outputFiles: ConfigFile["outputFiles"] = {}

const pathPrefixes = new Set(API_DOMAINS.map((d) => d.pathPrefix))

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

export default config
