// @vitest-environment node
// scm-style/button-icons in eslint.config.js (scripts/button-icons.mjs):
// no icon glyph at either end of a button label, no fontSize on
// startIcon/endIcon icons, icon-only actions are a labelled IconButton.
import path from "node:path"
import { ESLint } from "eslint"
import { beforeAll, describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../..")
const eslint = new ESLint({
  cwd: root,
  overrideConfig: { rules: { "prettier/prettier": "off" } },
})

async function flagged(code: string) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, "src/components/fixture.tsx"),
  })
  return result.messages
    .filter((m) => m.ruleId === "scm-style/button-icons")
    .map((m) => m.line)
}

describe("button-icons lint", { timeout: 30_000 }, () => {
  // The first lint loads the config and the TypeScript parser (slow on a
  // cold cache).
  beforeAll(() => flagged(""), 120_000)

  it("flags glyphs at either end of a label, in text, literals and t()", async () => {
    const code = [
      `const t = (k, d) => d ?? k`,
      `export const A = () => <Button>+ Create</Button>`,
      `export const B = () => <Button>{"Next →"}</Button>`,
      `export const C = () => <LoadingButton>{t("x.back", "← Back")}</LoadingButton>`,
      `export const D = () => <Button>{t("marketUi.aggregateAdmin.createBuyOrder", { defaultValue: "Owned ✓" })}</Button>`,
      `export const E = (p) => <Button>{p.on ? "Owned ✓" : "Mark"}</Button>`,
      `export const F = () => <Button>✕</Button>`,
    ].join("\n")
    expect(await flagged(code)).toEqual([2, 3, 4, 5, 6, 7])
  })

  it("passes labels with the glyph mid-text, and icons in startIcon/endIcon", async () => {
    const code = [
      `const t = (k, d) => d ?? k`,
      `export const A = () => <Button startIcon={<AddRounded />}>{t("x.create", "Create listing")}</Button>`,
      `export const B = () => <Button endIcon={<ChevronRightRounded />}>Stanton → Hurston</Button>`,
      `export const C = () => <Chip label="+3 more" />`,
    ].join("\n")
    expect(await flagged(code)).toEqual([])
  })

  it("flags fontSize on a startIcon/endIcon icon", async () => {
    const code = [
      `export const A = () => <Button startIcon={<AddRounded fontSize="small" />}>Add</Button>`,
      `export const B = (p) => <Button endIcon={p.x ? <ChevronRightRounded fontSize="small" /> : null}>Next</Button>`,
      `export const C = () => <Button startIcon={<AddRounded />}>Add</Button>`,
    ].join("\n")
    expect(await flagged(code)).toEqual([1, 2])
  })

  it("flags icon-only Buttons and IconButtons without a name", async () => {
    const code = [
      `export const A = () => <Button aria-label="Add"><AddRounded /></Button>`,
      `export const B = () => <IconButton><CloseRounded /></IconButton>`,
      `export const C = () => <IconButton aria-label="Close"><CloseRounded /></IconButton>`,
      `export const D = () => <Tooltip title="Close"><IconButton><CloseRounded /></IconButton></Tooltip>`,
      `export const E = () => <Tooltip title="Close"><span><IconButton disabled><CloseRounded /></IconButton></span></Tooltip>`,
      `export const F = () => <ToggleButton value="grid" aria-label="Grid"><GridViewRounded /></ToggleButton>`,
      `export const G = () => <Fab aria-label="Filters"><FilterListRounded /></Fab>`,
    ].join("\n")
    expect(await flagged(code)).toEqual([1, 2])
  })
})
