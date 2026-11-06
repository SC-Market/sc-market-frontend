// @vitest-environment node
// scm-style/mui-rounded-icons in eslint.config.js: MUI icons are the Rounded
// variant (brand marks and the SvgIconComponent type excepted), and other icon
// packs or raw .svg?react imports are only allowed in src/components/icons/.
import path from "node:path"
import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../..")
const eslint = new ESLint({
  cwd: root,
  overrideConfig: { rules: { "prettier/prettier": "off" } },
})

async function flagged(code: string, file: string) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, file),
  })
  return result.messages
    .filter((m) => m.ruleId === "scm-style/mui-rounded-icons")
    .map((m) => m.line)
}

describe("mui-rounded-icons lint", () => {
  const file = "src/components/fixture.tsx"

  it("flags Filled, Outlined, Sharp and TwoTone imports in every form", async () => {
    const code = [
      `import Delete from "@mui/icons-material/Delete"`,
      `import { Close, EditOutlined as E } from "@mui/icons-material"`,
      `import Sharp from "@mui/icons-material/AddSharp"`,
      `export { StarTwoTone } from "@mui/icons-material"`,
      `export const L = () => import("@mui/icons-material/ExpandMore")`,
      `export const all = [Delete, Close, E, Sharp]`,
    ].join("\n")
    expect(await flagged(code, file)).toEqual([1, 2, 2, 3, 4, 5])
  })

  it("allows Rounded icons, state pairs, brand marks and the icon type", async () => {
    const code = [
      `import DeleteRounded from "@mui/icons-material/DeleteRounded"`,
      `import { StarRounded, StarBorderRounded, Google } from "@mui/icons-material"`,
      `import { SvgIconComponent } from "@mui/icons-material"`,
      `import { DiscordIcon } from "./icons/DiscordIcon"`,
      `export const L = () => import("@mui/icons-material/ExpandMoreRounded")`,
      `export type T = SvgIconComponent`,
      `export const all = [DeleteRounded, StarRounded, StarBorderRounded, Google, DiscordIcon]`,
    ].join("\n")
    expect(await flagged(code, file)).toEqual([])
  })

  it("keeps other icon packs and svg components in src/components/icons/", async () => {
    const code = [
      `import { Trash } from "lucide-react"`,
      `import Logo from "../assets/logo.svg?react"`,
      `export const all = [Trash, Logo]`,
    ].join("\n")
    expect(await flagged(code, file)).toEqual([1, 2])
    expect(
      await flagged(code, "src/components/icons/BorrowedIcon.tsx"),
    ).toEqual([])
  })
})
