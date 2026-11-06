// @vitest-environment node
// The domain-purity rule in eslint.config.js: features/*/domain/ files may
// not import React, MUI or the store (`import type` of generated API types is
// fine), and they keep the features/ legacy-slice rule. Flat config replaces
// a rule per matching block, so a later block can silently switch this off;
// these fixtures catch that.
import path from "node:path"
import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../..")
const eslint = new ESLint({
  cwd: root,
  overrideConfig: { rules: { "prettier/prettier": "off" } },
})

async function restricted(code: string, file: string) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, file),
  })
  return result.messages
    .filter((m) => /no-restricted-imports$/.test(m.ruleId ?? ""))
    .map((m) => `${m.line} ${m.ruleId}`)
}

const STORE = "../../../store/api/v2/market"

describe("domain purity lint", () => {
  for (const ext of ["ts", "tsx"]) {
    const file = `src/features/market/domain/fixture.${ext}`

    it(`flags React, MUI, store and legacy-slice imports in .${ext}`, async () => {
      const code = [
        `import { useMemo } from "react"`,
        `import { Box } from "@mui/material"`,
        `import { marketApi } from "${STORE}"`,
        `import { x } from "../../../store/orders"`,
        `import type { ReactNode } from "react"`,
        `export const all = [useMemo, Box, marketApi, x]`,
        `export type N = ReactNode`,
      ].join("\n")
      expect(await restricted(code, file)).toEqual([
        "1 no-restricted-imports",
        "2 no-restricted-imports",
        "3 @typescript-eslint/no-restricted-imports",
        "4 no-restricted-imports",
        "4 @typescript-eslint/no-restricted-imports",
        "5 no-restricted-imports",
      ])
    })

    it(`allows type-only imports of generated API types in .${ext}`, async () => {
      const code = [
        `import type { ShopResponse } from "${STORE}"`,
        `export type S = ShopResponse`,
      ].join("\n")
      expect(await restricted(code, file)).toEqual([])
    })
  }

  it("still applies the legacy-slice rule outside domain/", async () => {
    const code = `import { x } from "../../../store/orders"\nexport const y = x\n`
    expect(
      await restricted(code, "src/features/market/hooks/fixture.ts"),
    ).toEqual(["1 no-restricted-imports"])
  })
})
