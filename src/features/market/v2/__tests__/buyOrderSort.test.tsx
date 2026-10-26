import "./setup"
import React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MarketSearchAreaV2 } from "../ListingSearchV2"
import { buyOrderSortArgs } from "../buyOrderSort"
import {
  useGetCategoriesQuery,
  useSearchListingsQuery,
  useSearchResourcesQuery,
} from "../../../../store/api/v2/market"

vi.mock("../../../../store/api/v2/market", async () => {
  const actual = await vi.importActual("../../../../store/api/v2/market")
  return {
    ...actual,
    useSearchListingsQuery: vi.fn(),
    useSearchResourcesQuery: vi.fn(),
    useGetCategoriesQuery: vi.fn(),
  }
})

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, def?: string | Record<string, unknown>) =>
        typeof def === "string" ? def : key,
    }),
  }
})

const theme = createTheme({
  palette: { outline: { main: "#e0e0e0" } },
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
})

// Regression: on /buyorders, changing "Sort By" updated the URL but the page
// never passed sort_by / sort_order to the buy-order search, so the order of
// the results never changed.
describe("buyOrderSortArgs", () => {
  const args = (qs: string) => buyOrderSortArgs(new URLSearchParams(qs))

  it("maps the sidebar's sort values to the buy-order search keys", () => {
    expect(args("sort_by=price&sort_order=asc")).toEqual({ sortBy: "price_per_unit", sortOrder: "asc" })
    expect(args("sort_by=price&sort_order=desc")).toEqual({ sortBy: "price_per_unit", sortOrder: "desc" })
    expect(args("sort_by=created_at&sort_order=asc")).toEqual({ sortBy: "created_at", sortOrder: "asc" })
    expect(args("sort_by=quality&sort_order=desc")).toEqual({ sortBy: "quality_tier_min", sortOrder: "desc" })
  })

  it("defaults the order to desc, like the sidebar select", () => {
    expect(args("sort_by=price")).toEqual({ sortBy: "price_per_unit", sortOrder: "desc" })
  })

  it("sends nothing for no sort or a sort buy orders don't support", () => {
    expect(args("")).toEqual({})
    expect(args("sort_by=shop_rating&sort_order=desc")).toEqual({})
  })
})

describe("MarketSearchAreaV2 sort options", () => {
  beforeEach(() => {
    vi.mocked(useSearchListingsQuery).mockReturnValue({ data: undefined } as never)
    vi.mocked(useSearchResourcesQuery).mockReturnValue({ data: undefined } as never)
    vi.mocked(useGetCategoriesQuery).mockReturnValue({ data: [] } as never)
  })

  const sortOptions = (path: string) => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[path]}>
          <MarketSearchAreaV2 />
        </MemoryRouter>
      </ThemeProvider>,
    )
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Sort By" }))
    return within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((o) => o.textContent)
  }

  it("offers only sorts the buy-order search supports on /buyorders", () => {
    expect(sortOptions("/buyorders")).toEqual([
      "None",
      "Price: Low to High",
      "Price: High to Low",
      "Date: Newest First",
      "Date: Oldest First",
      "Quality: High to Low",
      "Quality: Low to High",
    ])
  })

  it("keeps every sort on the market", () => {
    expect(sortOptions("/market")).toHaveLength(12)
  })
})
