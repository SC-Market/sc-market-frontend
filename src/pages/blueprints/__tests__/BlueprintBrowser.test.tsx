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
import { describe, it, expect, vi } from "vitest"
import { BlueprintBrowser } from "../BlueprintBrowser"
import { marketV2Api } from "../../../store/api/v2/market"

// Mock StandardPageLayout to avoid pulling in serviceApi/profileApi dependencies
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: any) => <div>{children}</div>,
}))

// Mock BlueprintDetailModal to avoid its profileApi dependency
vi.mock("../../../components/game-data/BlueprintDetailModal", () => ({
  BlueprintDetailModal: () => null,
}))

// Mock VersionSelector to avoid its additional API hooks
vi.mock("../../../components/game-data/VersionSelector", () => ({
  VersionSelector: () => null,
}))

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
    useSearchBlueprintsQuery: () => ({
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
      error: undefined,
    }),
    useGetBlueprintCategoriesQuery: () => ({
      data: [{ category: "Weapons", count: 10 }],
      isLoading: false,
      error: undefined,
    }),
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
    expect(screen.getByText("Blueprint Browser")).toBeInTheDocument()
  })

  it("should render search input", () => {
    renderWithProviders(<BlueprintBrowser />)
    expect(screen.getByLabelText("Search blueprints")).toBeInTheDocument()
  })

  it("should render filter controls", () => {
    renderWithProviders(<BlueprintBrowser />)
    // Check for filter controls by finding the select elements
    const selects = screen.getAllByRole("combobox")
    expect(selects.length).toBeGreaterThanOrEqual(3) // Category, Subcategory, Rarity, Tier
  })

  it("should render view mode toggle buttons", () => {
    renderWithProviders(<BlueprintBrowser />)
    expect(screen.getByLabelText("grid view")).toBeInTheDocument()
    expect(screen.getByLabelText("list view")).toBeInTheDocument()
  })

  it("should display blueprint data", () => {
    renderWithProviders(<BlueprintBrowser />)
    expect(screen.getByText("Test Blueprint")).toBeInTheDocument()
    expect(screen.getByText("Crafts: Test Item")).toBeInTheDocument()
  })

  it("should display blueprint count", () => {
    renderWithProviders(<BlueprintBrowser />)
    expect(screen.getByText("Found 1 blueprints")).toBeInTheDocument()
  })
})
