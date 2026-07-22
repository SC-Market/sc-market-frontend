/**
 * BlueprintBrowser Component Tests
 * 
 * Basic smoke tests for the BlueprintBrowser component.
 * Task 12.1 - Create BlueprintBrowser component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BlueprintBrowser } from "../BlueprintBrowser"
import { marketV2Api } from "../../../store/api/v2/market"

// Mock StandardPageLayout to avoid pulling in serviceApi/profileApi dependencies.
// Render headerTitle since the page title ("Blueprint Browser") is passed via that prop.
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children, headerTitle }: any) => (
    <div>
      <h1>{headerTitle}</h1>
      {children}
    </div>
  ),
}))

// Force desktop layout so FilterSidebarLayout renders the filter controls inline
// (on mobile they live in a closed BottomSheet and are not in the DOM).
beforeEach(() => {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as any,
  )
})

// Mock BlueprintDetailModal to avoid its profileApi dependency
vi.mock("../../../components/game-data/BlueprintDetailModal", () => ({
  BlueprintDetailModal: () => null,
}))

// Mock VersionSelector to avoid its additional API hooks
vi.mock("../../../components/game-data/VersionSelector", () => ({
  VersionSelector: () => null,
}))

// Stable references for mock return values.
// RTK Query returns a referentially-stable `data` when args are unchanged.
// The component's accumulation effect (`useEffect([data, page])`) setStates
// whenever `data` changes; if the mock returns a fresh object/array on every
// render, that effect fires on every render and creates an infinite render
// loop that hangs the test runner. Hoisting these keeps the references stable.
const MOCK_BLUEPRINT_SEARCH = {
  data: {
    blueprints: [
      {
        blueprint_id: "bp-1",
        blueprint_name: "Test Blueprint",
        output_item_name: "Test Item",
        item_category: "Weapons",
        rarity: "Rare",
        tier: 3,
        ingredient_count: 5,
        mission_count: 2,
      },
    ],
    total: 1,
    page: 1,
    page_size: 20,
  },
  isLoading: false,
  isFetching: false,
  error: undefined,
}

const MOCK_CATEGORIES = {
  data: [{ category: "Weapons", count: 10 }],
  isLoading: false,
  error: undefined,
}

// Mock the API hooks
vi.mock("../../../store/api/v2/market", async () => {
  const actual = await vi.importActual("../../../store/api/v2/market")
  return {
    ...actual,
    marketV2Api: {
      reducerPath: "marketV2Api",
      reducer: () => ({}),
      middleware: { concat: () => [] },
    },
    useSearchBlueprintsQuery: () => MOCK_BLUEPRINT_SEARCH,
    useGetBlueprintCategoriesQuery: () => MOCK_CATEGORIES,
    useGetUserBlueprintInventoryQuery: () => ({
      data: undefined,
      isLoading: false,
      error: undefined,
    }),
    useAddBlueprintToInventoryMutation: () => [vi.fn(), { isLoading: false }],
    useRemoveBlueprintFromInventoryMutation: () => [vi.fn(), { isLoading: false }],
    useGetWishlistsQuery: () => ({
      data: undefined,
      isLoading: false,
      error: undefined,
    }),
    useCreateWishlistMutation: () => [vi.fn(), { isLoading: false }],
    useAddWishlistItemMutation: () => [vi.fn(), { isLoading: false }],
  }
})

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  })
}

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  )
}

describe("BlueprintBrowser", () => {
  it("should render the component with title", () => {
    renderWithProviders(<BlueprintBrowser />)
    expect(screen.getByRole("heading", { name: "Blueprint Browser" })).toBeInTheDocument()
  })

  it("should render the unified search bar", () => {
    renderWithProviders(<BlueprintBrowser />)
    expect(
      screen.getByPlaceholderText("Search blueprints, materials, categories..."),
    ).toBeInTheDocument()
  })

  it("should render filter controls", () => {
    renderWithProviders(<BlueprintBrowser />)
    // Sidebar filters: Search, Category, Tier, Source selects/inputs all expose combobox role
    const selects = screen.getAllByRole("combobox")
    expect(selects.length).toBeGreaterThanOrEqual(3) // Category, Tier, Source, unified search
    // Named filter fields
    expect(screen.getByRole("button", { name: /reset filters/i })).toBeInTheDocument()
  })

  it("should render view mode toggle buttons", () => {
    renderWithProviders(<BlueprintBrowser />)
    // Grid/list view are ToggleButtons carrying value="grid"/"list"
    const toggles = screen.getAllByRole("button", { pressed: true })
    expect(toggles.length).toBeGreaterThanOrEqual(1)
  })

  it("should display blueprint data", () => {
    renderWithProviders(<BlueprintBrowser />)
    // The grid card renders the crafted output item name
    expect(screen.getByText("Test Item")).toBeInTheDocument()
  })

  it("should display the total blueprint count", () => {
    renderWithProviders(<BlueprintBrowser />)
    // The header shows the raw total returned by the query
    expect(screen.getByText("1")).toBeInTheDocument()
  })
})
