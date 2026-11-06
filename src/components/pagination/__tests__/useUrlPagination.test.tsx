/**
 * useUrlPagination: ?page= and ?page_size= of a URL-driven list, keeping the
 * list's other query params.
 */
import React from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import { NumberedPagination } from "../NumberedPagination"
import { useUrlPagination } from "../useUrlPagination"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

function Hub() {
  const { page, pageSize, pagination } = useUrlPagination({
    path: "/wiki/items",
    defaultPageSize: 24,
  })
  const location = useLocation()
  return (
    <>
      <div data-testid="state">{`${page}/${pageSize}`}</div>
      <div data-testid="location">{location.pathname + location.search}</div>
      <NumberedPagination count={500} {...pagination} />
    </>
  )
}

function renderHub(url: string) {
  window.scrollTo = vi.fn()
  render(
    <MemoryRouter initialEntries={[url]}>
      <ThemeProvider theme={mainTheme}>
        <Hub />
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe("useUrlPagination", () => {
  it("reads page and page size from the URL", () => {
    renderHub("/wiki/items?type=Helmet&page=3&page_size=48")
    expect(screen.getByTestId("state").textContent).toBe("3/48")
    expect(
      screen.getByRole("link", { name: "Page 3, current page" }),
    ).toHaveAttribute("aria-current", "page")
  })

  it("an unknown page size falls back to the default", () => {
    renderHub("/wiki/items?page_size=7")
    expect(screen.getByTestId("state").textContent).toBe("1/24")
  })

  it("a page change keeps the filters", () => {
    renderHub("/wiki/items?type=Helmet")
    fireEvent.click(screen.getByRole("link", { name: "Go to page 2" }))
    expect(screen.getByTestId("location").textContent).toBe(
      "/wiki/items?type=Helmet&page=2",
    )
    fireEvent.click(screen.getByRole("link", { name: "Go to page 1" }))
    expect(screen.getByTestId("location").textContent).toBe(
      "/wiki/items?type=Helmet",
    )
  })

  it("a new page size starts on page 1", () => {
    renderHub("/wiki/items?type=Helmet&page=4")
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Per page" }))
    fireEvent.click(screen.getByRole("option", { name: "96", hidden: true }))
    expect(screen.getByTestId("location").textContent).toBe(
      "/wiki/items?type=Helmet&page_size=96",
    )
    expect(screen.getByTestId("state").textContent).toBe("1/96")
  })
})
