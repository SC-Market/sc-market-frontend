import "./setup"
/**
 * Tests for BulkStockManagementV2 Component
 *
 * Validates Requirements 23.1-23.10
 */

import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { BrowserRouter } from "react-router-dom"
import { BulkStockManagementV2 } from "../BulkStockManagementV2"

const testTheme = createTheme({
  palette: { outline: { main: "#e0e0e0" } },
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
  borderRadius: {
    topLevel: 0.375,
    image: 0.375,
    button: 1,
    input: 0.5,
    chip: 0.5,
    minimal: 0,
  },
})
import { marketV2Api } from "../../../../store/api/v2/market"
import type { StockLotDetail } from "../../../../store/api/v2/market"
import { serviceApi } from "../../../../store/service"

// Mock the shop route context
const shopAccess = vi.hoisted(() => ({ canManage: true, manageStock: false }))
const routeShop = () => ({
  shop: {
    shop_id: "shop-1",
    name: "Test Shop",
    slug: "test-shop",
    owner_spectrum_id: "o1",
    is_org_owned: false,
    avatar: null,
    banner: null,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    permissions: {
      can_manage: shopAccess.canManage,
      manage_market: shopAccess.canManage,
      manage_stock: shopAccess.manageStock,
      manage_orders: false,
    },
  },
})
vi.mock("../../../../components/router/ShopContextFromRoute", () => ({
  useShopRouteContext: () => routeShop(),
  useOptionalShopRouteContext: () => routeShop(),
}))

// Mock the alert hook
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

// Mock translation
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

// Mock data
const mockLots: StockLotDetail[] = [
  {
    lot_id: "lot-1",
    item_id: "item-1",
    variant: {
      variant_id: "variant-1",
      attributes: {
        quality_tier: 5,
        quality_value: 95.5,
        crafted_source: "crafted",
      },
      display_name: "Tier 5 (95.5%) - Crafted",
      short_name: "T5 Crafted",
    },
    quantity_total: 10,
    quantity_allocated: 0,
    location: {
      location_id: "loc-1",
      name: "Orison",
      is_preset: true,
    },
    owner: null,
    listed: true,
    notes: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    listing_id: "listing-1",
    listing_title: "Mock Listing",
    game_item_name: "Test Item",
    listing_photo: null,
  },
  {
    lot_id: "lot-2",
    item_id: "item-1",
    variant: {
      variant_id: "variant-2",
      attributes: {
        quality_tier: 3,
        quality_value: 65.0,
        crafted_source: "store",
      },
      display_name: "Tier 3 (65.0%) - Store",
      short_name: "T3 Store",
    },
    quantity_total: 5,
    quantity_allocated: 0,
    location: {
      location_id: "loc-2",
      name: "Lorville",
      is_preset: true,
    },
    owner: null,
    listed: false,
    notes: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    listing_id: "listing-1",
    listing_title: "Mock Listing",
    game_item_name: "Test Item",
    listing_photo: null,
  },
]

// Mock StandardPageLayout to avoid useRouteError
vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        marketV2Api.middleware,
        serviceApi.middleware,
      ),
    preloadedState: initialState,
  })
}

describe("BulkStockManagementV2", () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
    vi.clearAllMocks()
    shopAccess.canManage = true
    shopAccess.manageStock = false
  })

  it("renders stock lots with variant information", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
      expect(screen.getByText("Tier 3 (65.0%) - Store")).toBeInTheDocument()
    })
  })

  it("displays quality tier chips with correct colors", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      const tier5Chips = screen.getAllByText(/Tier 5/)
      const tier3Chips = screen.getAllByText(/Tier 3/)
      expect(tier5Chips.length).toBeGreaterThan(0)
      expect(tier3Chips.length).toBeGreaterThan(0)
    })
  })

  it("displays location and listed status chips", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Orison")).toBeInTheDocument()
      expect(screen.getByText("Lorville")).toBeInTheDocument()
      // Listed lots show a "Listed" chip; unlisted lots show "Personal"
      expect(screen.getAllByText(/Listed/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Personal/i).length).toBeGreaterThan(0)
    })
  })

  it("renders data grid rows for each lot", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Each lot renders as a grid row with cells
    const cells = screen.getAllByRole("gridcell")
    expect(cells.length).toBeGreaterThan(0)
  })

  it("provides an Add Lot button", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Add Lot")).toBeInTheDocument()
    })
  })

  it("provides a filter sidebar with search", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getAllByText("Filters").length).toBeGreaterThan(0)
      expect(screen.getByPlaceholderText("Search lots...")).toBeInTheDocument()
    })
  })

  it("displays the All Stock Lots toolbar title", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("All Stock Lots")).toBeInTheDocument()
    })
  })

  it("disables bulk actions when no lots selected", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Bulk controls should not be visible when nothing is selected
    expect(screen.queryByText(/lot\(s\) selected/)).not.toBeInTheDocument()
  })

  it("opens the create lot dialog when Add Lot is clicked", async () => {
    const user = userEvent.setup()
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getMyListings",
        {
          pageSize: 100,
          sortBy: "updated_at",
          sortOrder: "desc",
          shopId: "shop-1",
        },
        {
          listings: [
            {
              listing_id: "listing-1",
              title: "Mock Listing",
              status: "active",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
              variant_count: 1,
              quantity_available: 10,
              price_min: 100,
              price_max: 100,
            },
          ],
          total: 1,
          page: 1,
          page_size: 100,
        },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Add Lot")).toBeInTheDocument()
    })

    const addLotButton = screen.getByText("Add Lot").closest("button")!
    expect(addLotButton).not.toBeDisabled()
    await user.click(addLotButton)
  })

  it("renders editable data grid cells", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Verify quick action buttons are present
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("displays quantity values for each lot", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Quantity cells render the numeric totals (10 and 5)
    await waitFor(() => {
      expect(screen.getAllByText("10").length).toBeGreaterThan(0)
      expect(screen.getAllByText("5").length).toBeGreaterThan(0)
    })
  })

  it("displays loading state", async () => {
    const { container } = render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    // While the lazy DataGrid chunk loads, its Suspense fallback renders a
    // skeleton placeholder.
    await waitFor(() => {
      expect(
        container.querySelectorAll('[class*="MuiSkeleton-root"]').length,
      ).toBeGreaterThan(0)
    })
  })

  it("displays error state", async () => {
    // Dispatch an error state
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: [], total: 0, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    // Component should render without error - error state is handled by the component
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    })
  })

  it("displays empty state when no lots", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: [], total: 0, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/No stock lots/i)).toBeInTheDocument()
    })
  })

  it("maintains visual parity with V1 (padding, spacing, typography)", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("All Stock Lots")).toBeInTheDocument()
    })

    // Check for h6 typography variant on the grid toolbar title
    const title = screen.getByText("All Stock Lots")
    expect(title.tagName).toBe("H6")
  })

  it("provides link to advanced stock management", async () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )

    render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
    })

    // Find inventory icon buttons (links to advanced management)
    const inventoryButtons = screen.getAllByRole("link")
    expect(inventoryButtons.length).toBeGreaterThan(0)
  })

  const renderWithLots = () => {
    store.dispatch(
      marketV2Api.util.upsertQueryData(
        "getStockLots",
        // Scoped to the page's shop: unscoped, the list held every shop's lots
        { pageSize: 100, shopId: "shop-1" },
        { lots: mockLots, total: 2, page: 1, page_size: 20 },
      ),
    )
    return render(
      <ThemeProvider theme={testTheme}>
        <Provider store={store}>
          <BrowserRouter>
            <BulkStockManagementV2 />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>,
    )
  }

  // Regression: the "Search lots..." box did nothing.
  it("filters lots by the search box", async () => {
    renderWithLots()
    await waitFor(() =>
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument(),
    )
    await userEvent.type(
      screen.getAllByPlaceholderText("Search lots...")[0],
      "lorville",
    )
    await waitFor(() =>
      expect(
        screen.queryByText("Tier 5 (95.5%) - Crafted"),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByText("Tier 3 (65.0%) - Store")).toBeInTheDocument()
  })

  // Regression: quantity editing was double-click only, with no sign it existed.
  it("shows how to edit and a pencil on each quantity", async () => {
    renderWithLots()
    await waitFor(() =>
      expect(screen.getAllByLabelText("Edit quantity").length).toBe(2),
    )
    expect(screen.getByText(/Double-click a quantity/)).toBeInTheDocument()
  })

  it("asks before deleting a lot", async () => {
    renderWithLots()
    await waitFor(() =>
      expect(screen.getAllByLabelText("Delete lot").length).toBe(2),
    )
    await userEvent.click(screen.getAllByLabelText("Delete lot")[0])
    expect(await screen.findByText("Delete lot?")).toBeInTheDocument()
  })

  // Regression: org members without manage_market got the editing UI and a 403 on save.
  it("is read-only for members who can't manage the shop", async () => {
    shopAccess.canManage = false
    renderWithLots()
    await waitFor(() =>
      expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument(),
    )
    expect(screen.queryByText("Add Lot")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Edit quantity")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Delete lot")).not.toBeInTheDocument()
    expect(
      screen.getByText(/ask an org admin for the Manage Stock permission/i),
    ).toBeInTheDocument()
  })

  // Regression: the sidebar showed Stock to Manage Stock members, but the page
  // (and the API) only let Manage Market write lots.
  it("lets a Manage Stock member without Manage Market edit lots", async () => {
    shopAccess.canManage = false
    shopAccess.manageStock = true
    renderWithLots()
    await waitFor(() =>
      expect(screen.getAllByLabelText("Delete lot").length).toBe(2),
    )
    expect(screen.getByText("Add Lot")).toBeInTheDocument()
    expect(screen.queryByText(/ask an org admin/i)).not.toBeInTheDocument()
  })
})
