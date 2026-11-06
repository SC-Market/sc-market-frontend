// @vitest-environment node
// scm-style/no-secondary-accent in eslint.config.js: palette.secondary is the
// buy side and premium. It may colour text, chips, badges, chart series and
// plain sx colours, but not controls, fields, navigation, buttons or focus
// styles. These fixtures pin what it flags and what it allows.
import path from "node:path"
import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../..")
const eslint = new ESLint({
  cwd: root,
  overrideConfig: { rules: { "prettier/prettier": "off" } },
})

async function flagged(code: string, file = "src/components/fixture.tsx") {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, file),
  })
  return result.messages
    .filter((m) => m.ruleId === "scm-style/no-secondary-accent")
    .map((m) => m.line)
}

const IMPORTS = [
  `import { Badge, Box, Button as MuiButton, Chip, Link, Tab, Tabs, TextField, Typography } from "@mui/material"`,
  `import { styled, useTheme } from "@mui/material/styles"`,
].join("\n")

describe("no-secondary-accent lint", () => {
  it("allows the buy side and premium on text, chips, badges, charts and sx colour", async () => {
    const code = [
      IMPORTS,
      `export function Ok() {`,
      `  const theme = useTheme()`,
      `  const series = [theme.palette.primary.main, theme.palette.secondary.main]`,
      `  return (`,
      `    <Box sx={{ borderColor: "secondary.main" }} data-series={series}>`,
      `      <Typography color="secondary.main">1 aUEC</Typography>`,
      `      <Chip color="secondary" label="Top bid" />`,
      `      <Badge color="secondary" badgeContent={1} />`,
      `      <Box sx={{ color: theme.palette.secondary.main }} />`,
      `      <MuiButton startIcon={<Chip color="secondary" label="x" />}>Go</MuiButton>`,
      `    </Box>`,
      `  )`,
      `}`,
    ].join("\n")
    expect(await flagged(code)).toEqual([])
  })

  it("flags secondary on controls, fields, navigation and focus styles", async () => {
    const code = [
      IMPORTS, // 1-2
      `export function Bad() {`, // 3
      `  const theme = useTheme()`, // 4
      `  return (`, // 5
      `    <>`, // 6
      `      <MuiButton color="secondary">Go</MuiButton>`, // 7
      `      <TextField color="secondary" />`, // 8
      `      <Tabs textColor="secondary" indicatorColor="secondary"><Tab label="a" /></Tabs>`, // 9
      `      <Link sx={{ color: "secondary.main" }} href="#a">a</Link>`, // 10
      `      <Box sx={{ "&:focus-visible": { outlineColor: theme.palette.secondary.main } }} />`, // 11
      `    </>`,
      `  )`,
      `}`,
      `export const Styled = styled(MuiButton)(({ theme }) => ({ color: theme.palette.secondary.main }))`, // 15
    ].join("\n")
    expect(await flagged(code)).toEqual([7, 8, 9, 9, 10, 11, 15])
  })

  it("leaves the theme files and the theme editor alone", async () => {
    const code = `${IMPORTS}\nexport const B = () => <MuiButton color="secondary">Go</MuiButton>\n`
    expect(
      await flagged(code, "src/components/theme-editor/fixture.tsx"),
    ).toEqual([])
    expect(await flagged(code, "src/hooks/styles/theme/fixture.tsx")).toEqual(
      [],
    )
  })
})
