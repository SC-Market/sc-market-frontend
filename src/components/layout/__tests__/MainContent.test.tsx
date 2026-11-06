/**
 * MainContent + the page layouts: the page scrolls in ONE full-height
 * scroller (the layout's <main>), and the room the floating buttons need is
 * reserved at the END of that scroller, not as padding around it.
 *
 * Regression (d0c0aee8): MainContent padded its page area by the floating
 * buttons' height. The page's <main> is height: 100% of that area, so the
 * padding shrank the page's scroller instead: the market grid was cut off
 * ~110px above the bottom of the screen, with a blank band under it.
 */
import "../../../util/i18n"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ThemeProvider } from "@mui/material/styles"
import { Fab } from "@mui/material"
import { MemoryRouter } from "react-router-dom"
import { mainTheme } from "../../../hooks/styles/Theme"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import { MainContent } from "../MainContent"
import { ContainerGrid, OpenGrid, OpenLayout } from "../ContainerGrid"
import { FLOATING_ACTIONS_ROOM_VAR } from "../FloatingActions"
import { PAGE_SCROLL_ATTRIBUTE, scrollPageToTop } from "../pageScroll"

const FLOATING_HEIGHT = 120

afterEach(() => {
  vi.restoreAllMocks()
})

function renderPage(page: React.ReactNode) {
  // happy-dom has no layout: give the floating-buttons stack a height.
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.dataset.testid === "floating-actions" ? FLOATING_HEIGHT : 0
    },
  )
  return render(
    <MemoryRouter>
      <ThemeProvider theme={mainTheme}>
        <DrawerOpenContext.Provider value={[false, () => {}]}>
          <MainContent
            floatingActions={<Fab aria-label="Page settings" />}
            floating={null}
          >
            {page}
          </MainContent>
        </DrawerOpenContext.Provider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

const tallGrid = <div data-testid="grid" style={{ height: 3000 }} />

const layouts: Array<[string, React.ReactNode]> = [
  [
    "OpenLayout (market, services)",
    <OpenLayout sidebarOpen noFooter key="open-layout">
      {tallGrid}
    </OpenLayout>,
  ],
  [
    "ContainerGrid (shops, storefronts, wiki)",
    <ContainerGrid sidebarOpen noFooter key="container-grid">
      {tallGrid}
    </ContainerGrid>,
  ],
  [
    "OpenGrid",
    <OpenGrid sidebarOpen noFooter key="open-grid">
      {tallGrid}
    </OpenGrid>,
  ],
]

describe.each(layouts)("%s in MainContent", (_name, page) => {
  it("the page area isn't padded, so the page's scroller keeps its full height", async () => {
    renderPage(page)
    const area = screen.getByTestId("page-area")
    // The floating buttons were measured and their room is set
    await waitFor(() =>
      expect(
        getComputedStyle(area).getPropertyValue(FLOATING_ACTIONS_ROOM_VAR),
      ).toBe(`calc(${FLOATING_HEIGHT}px + 16px)`),
    )
    const padding = getComputedStyle(area).paddingBottom
    expect(padding === "" || padding === "0" || padding === "0px").toBe(true)
  })

  it("the grid flows in the page's one full-height scroller", () => {
    renderPage(page)
    const area = screen.getByTestId("page-area")
    const scroller = area.querySelector<HTMLElement>(
      `[${PAGE_SCROLL_ATTRIBUTE}]`,
    )!
    expect(scroller.parentElement).toBe(area)
    expect(scroller.style.height).toBe("100%")
    expect(scroller.style.overflow).toBe("auto")
    // Nothing between the scroller and the grid scrolls or clips on its own
    for (
      let el = screen.getByTestId("grid").parentElement;
      el && el !== scroller;
      el = el.parentElement
    ) {
      const style = getComputedStyle(el)
      expect(["auto", "scroll", "hidden"]).not.toContain(style.overflowY)
      expect(["auto", "scroll", "hidden"]).not.toContain(style.overflow)
    }
  })

  it("the floating buttons' room is the scroller's last child", async () => {
    renderPage(page)
    const scroller = screen
      .getByTestId("page-area")
      .querySelector<HTMLElement>(`[${PAGE_SCROLL_ATTRIBUTE}]`)!
    const room = screen.getByTestId("floating-actions-room")
    expect(scroller.lastElementChild).toBe(room)
    // As tall as the floating buttons plus a gap
    await waitFor(() =>
      expect(getComputedStyle(room).height).toBe(
        `calc(${FLOATING_HEIGHT}px + 16px)`,
      ),
    )
  })

  it("scrollPageToTop scrolls the page's scroller", () => {
    renderPage(page)
    const scroller = screen
      .getByTestId("page-area")
      .querySelector<HTMLElement>(`[${PAGE_SCROLL_ATTRIBUTE}]`)!
    const scrollTo = vi.fn()
    scroller.scrollTo = scrollTo
    scrollPageToTop()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
  })
})
