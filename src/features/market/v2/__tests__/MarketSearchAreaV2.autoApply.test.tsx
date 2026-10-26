import "./setup"
import React from "react"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, useLocation, useNavigationType } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MarketSearchAreaV2 } from "../ListingSearchV2"
import { FILTER_DEBOUNCE_MS } from "../../hooks/useAutoApplySearchParams"
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

const CATEGORIES = [
  { category: "Armor", subcategory: "Helmet", game_item_categories: "" },
  { category: "Armor", subcategory: "Torso", game_item_categories: "" },
  { category: "Weapons", subcategory: "Ranged Weapon", game_item_categories: "" },
]

function LocationLog({ log }: { log: string[] }) {
  const location = useLocation()
  const action = useNavigationType()
  React.useEffect(() => {
    log.push(`${action} ${location.search}`)
  }, [location, action, log])
  return null
}

function setup(initial = "/market") {
  const log: string[] = []
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initial]}>
        <LocationLog log={log} />
        <MarketSearchAreaV2 />
      </MemoryRouter>
    </ThemeProvider>,
  )
  return { applies: () => log.slice(1) }
}

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

const itemTypeInput = () => screen.getByRole("combobox", { name: "Item Type" })

describe("MarketSearchAreaV2 auto-apply", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    vi.mocked(useSearchListingsQuery).mockReturnValue({ data: undefined } as never)
    vi.mocked(useSearchResourcesQuery).mockReturnValue({ data: undefined } as never)
    vi.mocked(useGetCategoriesQuery).mockReturnValue({ data: CATEGORIES } as never)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("has no Search button", () => {
    setup()
    expect(screen.queryByRole("button", { name: /^search$/i })).toBeNull()
  })

  it("search text applies once after the user pauses typing", () => {
    const { applies } = setup()
    const input = screen.getByRole("combobox", { name: "Search" })
    for (const v of ["r", "ri", "rif", "rifl", "rifle"]) {
      fireEvent.change(input, { target: { value: v } })
      advance(50)
    }
    expect(applies()).toEqual([])
    advance(FILTER_DEBOUNCE_MS)
    expect(applies()).toEqual(["PUSH ?text=rifle&page=1"])
  })

  it("search text: Enter applies immediately", () => {
    const { applies } = setup()
    const input = screen.getByRole("combobox", { name: "Search" })
    fireEvent.change(input, { target: { value: "rifle" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(applies()).toEqual(["PUSH ?text=rifle&page=1"])
    advance(FILTER_DEBOUNCE_MS * 2)
    expect(applies()).toHaveLength(1)
  })

  describe("Item Type (free-solo Autocomplete)", () => {
    it("offers the known item types, grouped by category", () => {
      setup()
      fireEvent.mouseDown(itemTypeInput())
      const listbox = screen.getByRole("listbox")
      expect(
        within(listbox).getAllByRole("option").map((o) => o.textContent),
      ).toEqual(["Helmet", "Torso", "Ranged Weapon"])
      expect(within(listbox).getByText("Armor")).toBeInTheDocument()
      expect(within(listbox).getByText("Weapons")).toBeInTheDocument()
    })

    it("picking an option applies immediately", () => {
      const { applies } = setup()
      fireEvent.mouseDown(itemTypeInput())
      fireEvent.click(screen.getByRole("option", { name: "Torso" }))
      expect(applies()).toEqual(["PUSH ?item_type=Torso&page=1"])
      expect(itemTypeInput()).toHaveValue("Torso")
    })

    it("free text is debounced like the search field", () => {
      const { applies } = setup()
      for (const v of ["w", "we", "wea", "weap"]) {
        fireEvent.change(itemTypeInput(), { target: { value: v } })
        advance(50)
      }
      expect(applies()).toEqual([])
      advance(FILTER_DEBOUNCE_MS)
      expect(applies()).toEqual(["PUSH ?item_type=weap&page=1"])
    })

    it("Enter applies a custom value immediately", () => {
      const { applies } = setup()
      fireEvent.change(itemTypeInput(), { target: { value: "Shield" } })
      fireEvent.keyDown(itemTypeInput(), { key: "Enter" })
      expect(applies()).toEqual(["PUSH ?item_type=Shield&page=1"])
      advance(FILTER_DEBOUNCE_MS * 2)
      expect(applies()).toHaveLength(1)
    })

    it("reads the URL param (including the legacy `type` alias)", () => {
      setup("/market?type=Helmet")
      expect(itemTypeInput()).toHaveValue("Helmet")
    })

    it("does not apply when the typed value equals the applied one", () => {
      const { applies } = setup("/market?item_type=Helmet")
      fireEvent.change(itemTypeInput(), { target: { value: "Helme" } })
      fireEvent.change(itemTypeInput(), { target: { value: "Helmet" } })
      advance(FILTER_DEBOUNCE_MS)
      expect(applies()).toEqual([])
    })

    it("clearing applies immediately and drops the legacy alias", () => {
      const { applies } = setup("/market?type=Helmet")
      const root = itemTypeInput().closest(".MuiAutocomplete-root") as HTMLElement
      fireEvent.click(root.querySelector('button[aria-label="Clear"]') as HTMLElement)
      expect(applies()).toEqual(["PUSH ?page=1"])
    })
  })

  it("sort changes apply immediately and None clears both sort params", () => {
    const { applies } = setup("/market?sort_by=price&sort_order=asc")
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Sort By" }))
    fireEvent.click(screen.getByRole("option", { name: "None" }))
    expect(applies()).toEqual(["PUSH ?page=1"])
  })
})
