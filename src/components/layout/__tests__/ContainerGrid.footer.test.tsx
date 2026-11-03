/**
 * The footer sits at the bottom of the screen on a short page and after
 * the content on a long one: <main> is a flex column, the page area grows
 * (and never shrinks, so <main> keeps scrolling), and the footer's wrapper,
 * after the content grid, takes the spare height above it (margin-top auto).
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import { ContainerGrid, OpenLayout } from "../ContainerGrid"

vi.mock("../../footer/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

const theme = createTheme({ layoutSpacing: { component: 2, layout: 3 } } as never)

function Wrapper({ children }: { children: React.ReactNode }) {
  const drawer = React.useState(false)
  return (
    <ThemeProvider theme={theme}>
      <DrawerOpenContext.Provider value={drawer}>
        {children}
      </DrawerOpenContext.Provider>
    </ThemeProvider>
  )
}

describe("footer at the bottom of a short page", () => {
  it("ContainerGrid: main is a column, the page area grows, the footer follows the content grid", () => {
    render(
      <Wrapper>
        <ContainerGrid sidebarOpen>
          <div data-testid="content">Short</div>
        </ContainerGrid>
      </Wrapper>,
    )
    const main = screen.getByRole("main")
    expect(main.style.display).toBe("flex")
    expect(main.style.flexDirection).toBe("column")
    expect(main.style.height).toBe("100%")
    const content = screen.getByTestId("content")
    const footer = screen.getByTestId("footer")
    const contentGrid = content.parentElement!
    // The footer's Grid container, in a wrapper that takes the spare height.
    const footerWrap = footer.parentElement!.parentElement!
    // Not inside the content grid any more: its own wrapper, right after it.
    expect(contentGrid.contains(footer)).toBe(false)
    expect(contentGrid.nextElementSibling).toBe(footerWrap)
    const area = contentGrid.parentElement!
    expect(getComputedStyle(area).display).toBe("flex")
    expect(getComputedStyle(area).flexDirection).toBe("column")
    expect(getComputedStyle(area).flexGrow).toBe("1")
    expect(getComputedStyle(area).flexShrink).toBe("0")
    expect(getComputedStyle(footerWrap).marginTop).toBe("auto")
  })

  it("ContainerGrid noFooter renders no footer", () => {
    render(
      <Wrapper>
        <ContainerGrid sidebarOpen noFooter>
          <div>Short</div>
        </ContainerGrid>
      </Wrapper>,
    )
    expect(screen.queryByTestId("footer")).toBeNull()
  })

  it("OpenLayout: same column, the footer's wrapper takes the spare height", () => {
    render(
      <Wrapper>
        <OpenLayout sidebarOpen>
          <div>Short</div>
        </OpenLayout>
      </Wrapper>,
    )
    const main = screen.getByRole("main")
    expect(main.style.display).toBe("flex")
    expect(main.style.height).toBe("100%")
    const footerWrap = screen.getByTestId("footer").parentElement!
    expect(footerWrap.parentElement).toBe(main)
    expect(getComputedStyle(footerWrap).marginTop).toBe("auto")
  })
})
