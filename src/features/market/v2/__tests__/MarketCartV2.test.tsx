import "./setup";
import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MarketCartV2 } from "../MarketCartV2"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { marketV2Api as api, GetCartResponse } from "../../../../store/api/v2/market"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { CurrentOrgContext } from "../../../../hooks/login/CurrentOrg"
import { DrawerOpenContext } from "../../../../hooks/layout/Drawer"
import { Contractor } from "../../../../features/contractor/domain/types"

// Mock navigation
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock alert hook
const mockIssueAlert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => mockIssueAlert,
}))

// Mock translation
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, params?: any) => {
        if (params) {
          return `${key}_${JSON.stringify(params)}`
        }
        return key
      },
    }),
  }
})

// Mock StandardPageLayout to avoid serviceApi dependency
vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children, title }: any) => (
    <div data-testid="standard-page-layout">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  ),
}))

// Mock Page component to avoid contractor API dependency
vi.mock("../../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock BackArrow component
vi.mock("../../../../components/button/BackArrow", () => ({
  BackArrow: () => <div data-testid="back-arrow">Back</div>,
}))

// Mock EmptyCart component
vi.mock("../../../../components/empty-states", () => ({
  EmptyCart: () => <div data-testid="empty-cart">Empty Cart</div>,
}))

// Helper to create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: initialState,
  })
}

// Helper to render with providers
const renderWithProviders = (
  ui: React.ReactElement,
  { store = createTestStore(), ...renderOptions } = {}
) => {
  const theme = createTheme({
    layoutSpacing: {
      layout: 2,
      text: 1,
      compact: 0.5,
    },
    borderRadius: {
      image: 1,
      input: 0.5,
    },
  } as any)

  const mockOrgState: [Contractor | null, React.Dispatch<React.SetStateAction<Contractor | null>>] = [
    null,
    vi.fn(),
  ]

  const mockDrawerState: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = [false, vi.fn()]

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CurrentOrgContext.Provider value={mockOrgState}>
              <DrawerOpenContext.Provider value={mockDrawerState}>
                {children}
              </DrawerOpenContext.Provider>
            </CurrentOrgContext.Provider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Mock cart data
const mockCartData: GetCartResponse = {
  items: [
    {
      cart_item_id: "cart-1",
      listing: {
        listing_id: "listing-1",
        shop_id: "seller-1",
        title: "Test Item 1",
        shop_name: "TestSeller",
        shop_rating: 4.5, shop_slug: "testuser",
        status: "active",
      },
      variant: {
        variant_id: "variant-1",
        attributes: {
          quality_tier: 5,
          quality_value: 95.5,
          crafted_source: "crafted" as const,
        },
        display_name: "Tier 5 (95.5%) - Crafted",
        short_name: "T5 Crafted",
      },
      quantity: 2,
      quantity_available: 10,
      price_per_unit: 1000,
      subtotal: 2000,
      available: true,
      price_changed: false,
    },
    {
      cart_item_id: "cart-2",
      listing: {
        listing_id: "listing-2",
        shop_id: "seller-2",
        title: "Test Item 2",
        shop_name: "TestSeller2",
        shop_rating: 4.0, shop_slug: "testuser2",
        status: "active",
      },
      variant: {
        variant_id: "variant-2",
        attributes: {
          quality_tier: 3,
          quality_value: 60.0,
          crafted_source: "store" as const,
        },
        display_name: "Tier 3 (60.0%) - Store",
        short_name: "T3 Store",
      },
      quantity: 1,
      quantity_available: 5,
      price_per_unit: 500,
      subtotal: 500,
      available: true,
      price_changed: false,
    },
  ],
  total_price: 2500,
  item_count: 2,
}

const mockEmptyCart: GetCartResponse = {
  items: [],
  total_price: 0,
  item_count: 0,
}

describe("MarketCartV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      const store = createTestStore()

      store.dispatch(
        api.util.upsertQueryData("getCart", undefined, mockEmptyCart)
      )

      const { container } = renderWithProviders(<MarketCartV2 />, { store })
      expect(container).toBeTruthy()
    })

    it("should display cart items when cart has items", async () => {
      const store = createTestStore()

      store.dispatch(
        api.util.upsertQueryData("getCart", undefined, mockCartData)
      )

      renderWithProviders(<MarketCartV2 />, { store })

      await waitFor(() => {
        expect(screen.getByText("Test Item 1")).toBeInTheDocument()
      })
    })

    it("should display variant information", async () => {
      const store = createTestStore()

      store.dispatch(
        api.util.upsertQueryData("getCart", undefined, mockCartData)
      )

      renderWithProviders(<MarketCartV2 />, { store })

      await waitFor(() => {
        expect(screen.getByText("Tier 5 (95.5%) - Crafted")).toBeInTheDocument()
      })
    })

    it("should display cart total", async () => {
      const store = createTestStore()

      store.dispatch(
        api.util.upsertQueryData("getCart", undefined, mockCartData)
      )

      renderWithProviders(<MarketCartV2 />, { store })

      await waitFor(() => {
        expect(screen.getByText(/2,500 aUEC/)).toBeInTheDocument()
      })
    })
  })

  describe("Price Changes", () => {
    it("should display price change alert", async () => {
      const store = createTestStore()

      const cartWithPriceChange: GetCartResponse = {
        ...mockCartData,
        items: [
          {
            ...mockCartData.items[0],
            price_changed: true,
            current_price: 1200,
          },
        ],
        total_price: 2400,
      }

      store.dispatch(
        api.util.upsertQueryData("getCart", undefined, cartWithPriceChange)
      )

      renderWithProviders(<MarketCartV2 />, { store })

      await waitFor(() => {
        const alerts = screen.getAllByText(/cart.pricesChanged/)
        expect(alerts.length).toBeGreaterThan(0)
      })
    })
  })

  describe("Availability", () => {
    it("should display unavailable warning", async () => {
      const store = createTestStore()

      const cartWithUnavailable: GetCartResponse = {
        ...mockCartData,
        items: [
          {
            ...mockCartData.items[0],
            available: false,
          },
        ],
      }

      store.dispatch(
        api.util.upsertQueryData("getCart", undefined, cartWithUnavailable)
      )

      renderWithProviders(<MarketCartV2 />, { store })

      await waitFor(() => {
        const warnings = screen.getAllByText(/cart.unavailable/)
        expect(warnings.length).toBeGreaterThan(0)
      })
    })

    it("should disable checkout when items unavailable", async () => {
      const store = createTestStore()

      const cartWithUnavailable: GetCartResponse = {
        ...mockCartData,
        items: [
          {
            ...mockCartData.items[0],
            available: false,
          },
        ],
      }

      store.dispatch(
        api.util.upsertQueryData("getCart", undefined, cartWithUnavailable)
      )

      renderWithProviders(<MarketCartV2 />, { store })

      await waitFor(() => {
        const checkoutButton = screen.getByRole("button", {
          name: /cart.checkout/i,
        })
        expect(checkoutButton).toBeDisabled()
      })
    })
  })
})
