/**
 * NumberedPagination: MUI's numbered Pagination plus a "Per page" select,
 * the "x–y of N" range and, for URL-driven lists, real page links.
 */
import React, { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import {
  CompactPagination,
  NumberedPagination,
  type NumberedPaginationProps,
} from "../NumberedPagination"
import { linkedPageHref } from "../linkedPaginationItem"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

function renderPagination(props: Partial<NumberedPaginationProps> = {}) {
  const onPageChange = vi.fn()
  render(
    <MemoryRouter>
      <ThemeProvider theme={mainTheme}>
        <NumberedPagination
          count={500}
          page={0}
          rowsPerPage={48}
          onPageChange={onPageChange}
          {...props}
        />
      </ThemeProvider>
    </MemoryRouter>,
  )
  return { onPageChange }
}

describe("NumberedPagination", () => {
  it("renders numbered pages with first/last and an ellipsis", () => {
    renderPagination({ page: 0 })
    const nav = screen.getByRole("navigation", { name: "Pagination" })
    // 500 / 48 = 11 pages: 1 2 3 4 5 … 11
    for (const n of [1, 2, 3, 4, 5, 11]) {
      expect(within(nav).getByText(String(n))).toBeInTheDocument()
    }
    expect(within(nav).queryByText("6")).not.toBeInTheDocument()
    expect(within(nav).getByText("…")).toBeInTheDocument()
    expect(
      within(nav).getByRole("button", { name: "Go to previous page" }),
    ).toBeDisabled()
    expect(
      within(nav).getByRole("button", { name: "Go to next page" }),
    ).toBeEnabled()
    expect(screen.getByText("1-48 of 500")).toBeInTheDocument()
  })

  it("marks the current page with aria-current", () => {
    renderPagination({ page: 5 })
    const current = screen.getByRole("button", {
      name: "Page 6, current page",
    })
    expect(current).toHaveAttribute("aria-current", "page")
    expect(
      screen.getByRole("button", { name: "Go to page 7" }),
    ).not.toHaveAttribute("aria-current")
    expect(screen.getByText("241-288 of 500")).toBeInTheDocument()
  })

  it("calls back with the 0-based page", () => {
    const { onPageChange } = renderPagination({ page: 0 })
    fireEvent.click(screen.getByRole("button", { name: "Go to page 3" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it("renders nothing for a single page with nothing to choose", () => {
    renderPagination({ count: 10, rowsPerPage: 12 })
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
    expect(screen.queryByText("1-10 of 10")).not.toBeInTheDocument()
  })

  it("keeps the select on a single page a smaller size would split", () => {
    renderPagination({
      count: 50,
      rowsPerPage: 96,
      rowsPerPageOptions: [12, 24, 48, 96],
      onRowsPerPageChange: vi.fn(),
    })
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
    expect(
      screen.getByRole("combobox", { name: "Per page" }),
    ).toBeInTheDocument()
    expect(screen.getByText("1-50 of 50")).toBeInTheDocument()
  })

  it("has no per-page select without options", () => {
    renderPagination()
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  })

  it("changing per-page calls back and resets to page 1", () => {
    const onRowsPerPageChange = vi.fn()
    function Harness() {
      const [page, setPage] = useState(3)
      const [size, setSize] = useState(48)
      return (
        <NumberedPagination
          count={500}
          page={page}
          rowsPerPage={size}
          onPageChange={setPage}
          rowsPerPageOptions={[12, 24, 48, 96]}
          onRowsPerPageChange={(n) => {
            onRowsPerPageChange(n)
            setSize(n)
            setPage(0)
          }}
        />
      )
    }
    render(
      <ThemeProvider theme={mainTheme}>
        <Harness />
      </ThemeProvider>,
    )
    const select = screen.getByRole("combobox", { name: "Per page" })
    expect(select).toHaveTextContent("48")
    fireEvent.mouseDown(select)
    fireEvent.click(screen.getByRole("option", { name: "96", hidden: true }))
    expect(onRowsPerPageChange).toHaveBeenCalledWith(96)
    expect(
      screen.getByRole("button", { name: "Page 1, current page" }),
    ).toHaveAttribute("aria-current", "page")
    expect(screen.getByText("1-96 of 500")).toBeInTheDocument()
  })

  it("linked mode renders page hrefs that keep the other query params", () => {
    const searchParams = new URLSearchParams(
      "query=laser&sort=price&page=2&page_size=24",
    )
    const { onPageChange } = renderPagination({
      count: 240,
      page: 1,
      rowsPerPage: 24,
      link: { path: "/market", searchParams },
    })
    const page3 = screen.getByRole("link", { name: "Go to page 3" })
    expect(page3).toHaveAttribute(
      "href",
      "/market?query=laser&sort=price&page_size=24&page=3",
    )
    // Filtered variants are noindex: crawlers are told not to follow.
    expect(page3).toHaveAttribute("rel", "nofollow")
    // Page 1 drops ?page but keeps the filters.
    expect(screen.getByRole("link", { name: "Go to page 1" })).toHaveAttribute(
      "href",
      "/market?query=laser&sort=price&page_size=24",
    )
    // A plain click is an in-app page change through the callback.
    fireEvent.click(page3)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("linked mode on a bare hub links ?page=N, followable", () => {
    renderPagination({
      count: 100,
      page: 0,
      rowsPerPage: 10,
      link: { path: "/wiki/items", searchParams: new URLSearchParams() },
    })
    const page2 = screen.getByRole("link", { name: "Go to page 2" })
    expect(page2).toHaveAttribute("href", "/wiki/items?page=2")
    expect(page2).not.toHaveAttribute("rel")
  })

  it("a modified click is left to the browser (new tab)", () => {
    const { onPageChange } = renderPagination({
      count: 100,
      page: 0,
      rowsPerPage: 10,
      link: { path: "/wiki/items", searchParams: new URLSearchParams() },
    })
    fireEvent.click(screen.getByRole("link", { name: "Go to page 2" }), {
      ctrlKey: true,
    })
    expect(onPageChange).not.toHaveBeenCalled()
  })
})

describe("CompactPagination", () => {
  it("renders the compact prev/next toolbar for tight spots", () => {
    const onPageChange = vi.fn()
    render(
      <ThemeProvider theme={mainTheme}>
        <CompactPagination>
          <NumberedPagination
            count={40}
            page={0}
            rowsPerPage={5}
            onPageChange={onPageChange}
          />
        </CompactPagination>
      </ThemeProvider>,
    )
    expect(screen.queryByText("2")).not.toBeInTheDocument()
    expect(screen.getByText("1-5 of 40")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})

describe("linkedPageHref", () => {
  it("matches pagedPath on a bare hub", () => {
    const none = new URLSearchParams("page=4")
    expect(linkedPageHref("/shops", none, 1)).toBe("/shops")
    expect(linkedPageHref("/shops", none, 5)).toBe("/shops?page=5")
  })
})
