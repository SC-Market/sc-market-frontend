// @vitest-environment node
/**
 * BottomSheet server render: no `window` in this environment, so any read of
 * it during render (e.g. `window.innerHeight` for snap heights) throws.
 */
import React from "react"
import { renderToString } from "react-dom/server"
import { ThemeProvider } from "@mui/material/styles"
import { describe, it, expect, vi } from "vitest"
import { mainTheme } from "../../../hooks/styles/Theme"
import { BottomSheet } from "../BottomSheet"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => true,
}))

const ssr = (ui: React.ReactElement) =>
  renderToString(<ThemeProvider theme={mainTheme}>{ui}</ThemeProvider>)

describe("BottomSheet SSR", () => {
  it("has no window to read", () => {
    expect(typeof window).toBe("undefined")
  })

  it.each([
    ["full", ["full"]],
    ["75", ["half", "75", "full"]],
    ["half", ["half", "75"]],
  ] as const)(
    "renders open at the %s snap without touching window",
    (defaultSnap, snapPoints) => {
      expect(() =>
        ssr(
          <div>
            <p>Page</p>
            <BottomSheet
              open
              onClose={() => {}}
              title="Filters"
              maxHeight="85vh"
              snapPoints={[...snapPoints]}
              defaultSnap={defaultSnap}
            >
              <p>Sheet body</p>
            </BottomSheet>
          </div>,
        ),
      ).not.toThrow()
    },
  )

  it("renders closed (and keepMounted) without touching window", () => {
    const html = ssr(
      <div>
        <p>Page</p>
        <BottomSheet open={false} onClose={() => {}} title="Messages">
          <p>Sheet body</p>
        </BottomSheet>
        <BottomSheet
          open={false}
          keepMounted
          onClose={() => {}}
          ariaLabel="Cart"
          fullHeight
        >
          <p>Cart body</p>
        </BottomSheet>
      </div>,
    )
    expect(html).toContain("Page")
    // Modal content is portalled; nothing of a closed sheet is in the HTML
    expect(html).not.toContain("Sheet body")
  })
})
