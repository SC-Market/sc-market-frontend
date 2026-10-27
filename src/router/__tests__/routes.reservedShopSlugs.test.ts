/**
 * A shop slug sits at /shops/:slug (public profile) and /shop/:shopSlug (shop
 * dashboard). A static route at that position (/shops/create) wins over the
 * slug, so a shop with that slug would be unreachable. The backend refuses
 * such slugs: its reserved list is the ReservedShopSlug enum in the OpenAPI
 * spec (spec/sc-market-v2.openapi.json, from the backend's
 * services/shops/reserved-shop-slugs.ts).
 *
 * This fails when a route segment at a slug position is not in that list:
 * add the word to the backend's ReservedShopSlug, deploy, and resync the spec.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { routes } from "../../router/routeObjects"
import { enumerateRoutes } from "./regression/harness"
import type { ReservedShopSlug } from "../../store/api/v2/market"

const spec: unknown = JSON.parse(
  // Vitest runs from the repo root.
  readFileSync(
    resolve(process.cwd(), "spec/sc-market-v2.openapi.json"),
    "utf-8",
  ),
)

function reservedFromSpec(): string[] {
  const schemas =
    spec && typeof spec === "object" && "components" in spec
      ? Object.getOwnPropertyDescriptor(spec, "components")?.value?.schemas
      : undefined
  const values: unknown = schemas?.ReservedShopSlug?.enum
  return Array.isArray(values)
    ? values.filter((v): v is string => typeof v === "string")
    : []
}

/** Path prefixes whose next segment is a shop slug, and that param's name. */
const SHOP_SLUG_POSITIONS: Array<{ prefix: string; param: string }> = [
  { prefix: "shops", param: ":slug" },
  { prefix: "shop", param: ":shopSlug" },
]

const segments = (pattern: string) => pattern.split("/").filter(Boolean)
const leaves = enumerateRoutes(routes).map((leaf) => segments(leaf.pattern))

describe("routes at a shop slug position are reserved shop slugs", () => {
  const reserved = new Set(reservedFromSpec())

  it("reads the reserved list from the spec", () => {
    // Typed against the generated client: these must stay reserved.
    const routeWords: ReservedShopSlug[] = ["create", "mine", "by-owner"]
    for (const word of routeWords) expect(reserved.has(word)).toBe(true)
  })

  it.each(SHOP_SLUG_POSITIONS)(
    "/$prefix/$param still exists",
    ({ prefix, param }) => {
      expect(leaves.some((s) => s[0] === prefix && s[1] === param)).toBe(true)
    },
  )

  it.each(SHOP_SLUG_POSITIONS)(
    "every static segment after /$prefix/ is reserved",
    ({ prefix }) => {
      const literals = leaves
        .filter(
          (s) => s[0] === prefix && s.length >= 2 && !s[1].startsWith(":"),
        )
        .map((s) => s[1].toLowerCase())
      expect([...new Set(literals)].filter((w) => !reserved.has(w))).toEqual([])
    },
  )

  it("has no other route taking a shop slug", () => {
    const known = new Set(
      SHOP_SLUG_POSITIONS.map((p) => `${p.prefix}/${p.param}`),
    )
    const others = leaves
      .map((s) =>
        s.findIndex(
          (seg) =>
            seg === ":shopSlug" ||
            (seg === ":slug" && (s[0] === "shop" || s[0] === "shops")),
        ),
      )
      .map((i, n) =>
        i > 0 ? `${leaves[n].slice(0, i).join("/")}/${leaves[n][i]}` : null,
      )
      .filter((p): p is string => !!p && !known.has(p))
    expect(others).toEqual([])
  })
})
