import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { CreateBuyOrderV2 } from "../CreateBuyOrderV2"
import { MarketAggregate } from "../../../domain/types"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BrowserRouter } from "react-router-dom"
import { serviceApi } from "../../../../../store/service"
import { ThemeProvider, createTheme } from "@mui/material/styles"

// Mock translation
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string | { tz?: string }) => {
        if (typeof defaultValue === "object") {
          return key
        }
        return defaultValue || key
      },
      i18n: {
        language: "en",
        changeLanguage: vi.fn(),
      },
    }),
    initReactI18next: {
      type: "3rdParty",
      init: vi.fn(),
    },
  }
})

// Mock dependencies
vi.mock("../../../api/marketApi", () => ({
  useCreateBuyOrderMutation: vi.fn(() => [
    vi.fn().mockResolvedValue({ unwrap: () => Promise.resolve({}) }),
    { isLoading: false },
  ]),
}))

vi.mock("../../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: vi.fn(() => vi.fn()),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  }
})

const mockAggregate: MarketAggregate = {
  details: {
    game_item_id: "test-item-id",
    title: "Test Item",
    description: "Test description",
    item_type: "weapon",
    item_name: "Test Weapon",
    wiki_id: 123,
  },
  photos: ["https://example.com/photo.jpg"],
  listings: [],
  buy_orders: [],
  stats: {
    total_quantity: 10,
    min_price: 1000,
    max_price: 5000,
    avg_price: 3000,
    seller_count: 5,
  },
}

const createTestStore = () =>
  configureStore({
    reducer: {
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(serviceApi.middleware),
  })

// Create extended theme with layoutSpacing
const createExtendedTheme = () => {
  const baseTheme = createTheme()
  return createTheme(baseTheme, {
    layoutSpacing: {
      layout: 2,
      component: 1,
    },
    borderRadius: {
      image: 2,
    },
  })
}

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore()
  const theme = createExtendedTheme()
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>{component}</BrowserRouter>
      </ThemeProvider>
    </Provider>,
  )
}

describe("CreateBuyOrderV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders with game item information", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    expect(screen.getByText("Test Item")).toBeInTheDocument()
    expect(screen.getByAltText("Test Item")).toBeInTheDocument()
  })

  it("displays quality tier range selectors", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    expect(screen.getByLabelText(/minimum quality tier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximum quality tier/i)).toBeInTheDocument()
  })

  it("displays price range inputs", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    expect(screen.getByLabelText(/minimum price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximum price/i)).toBeInTheDocument()
  })

  it("displays quantity input", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    expect(screen.getByLabelText(/enter quantity/i)).toBeInTheDocument()
  })

  it("displays negotiable checkbox", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    expect(
      screen.getByRole("checkbox", { name: /negotiable/i }),
    ).toBeInTheDocument()
  })

  it("validates quality_tier_min <= quality_tier_max", async () => {
    const mockAlert = vi.fn()
    const { useAlertHook } = await import("../../../../../hooks/alert/AlertHook")
    vi.mocked(useAlertHook).mockReturnValue(mockAlert)

    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    // Set min > max
    const minSelect = screen.getByLabelText(/minimum quality tier/i)
    const maxSelect = screen.getByLabelText(/maximum quality tier/i)

    fireEvent.mouseDown(minSelect)
    const tier5Options = screen.getAllByText("Tier 5")
    fireEvent.click(tier5Options[tier5Options.length - 1])

    fireEvent.mouseDown(maxSelect)
    const tier1Options = screen.getAllByText("Tier 1")
    fireEvent.click(tier1Options[tier1Options.length - 1])

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit buy order/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          message: expect.stringContaining("quality tier"),
        }),
      )
    })
  })

  it("validates price_min <= price_max when not negotiable", async () => {
    const mockAlert = vi.fn()
    const { useAlertHook } = await import("../../../../../hooks/alert/AlertHook")
    vi.mocked(useAlertHook).mockReturnValue(mockAlert)

    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    // Set price min > max
    const minPriceInput = screen.getByLabelText(/minimum price/i)
    const maxPriceInput = screen.getByLabelText(/maximum price/i)

    fireEvent.change(minPriceInput, { target: { value: "5000" } })
    fireEvent.change(maxPriceInput, { target: { value: "1000" } })

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit buy order/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          message: expect.stringContaining("price"),
        }),
      )
    })
  })

  it("changes price labels when negotiable is checked", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    const negotiableCheckbox = screen.getByRole("checkbox", {
      name: /negotiable/i,
    })

    // Initially not negotiable
    expect(screen.getByLabelText(/minimum price/i)).toBeInTheDocument()

    // Check negotiable
    fireEvent.click(negotiableCheckbox)

    // Labels should change to "suggested"
    expect(
      screen.getByLabelText(/suggested min price/i),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/suggested max price/i),
    ).toBeInTheDocument()
  })

  it("displays total price range calculation", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    const minPriceInput = screen.getByLabelText(/minimum price/i)
    const maxPriceInput = screen.getByLabelText(/maximum price/i)
    const quantityInput = screen.getByLabelText(/enter quantity/i)

    fireEvent.change(minPriceInput, { target: { value: "1000" } })
    fireEvent.change(maxPriceInput, { target: { value: "2000" } })
    fireEvent.change(quantityInput, { target: { value: "5" } })

    // Total should show range
    const totalField = screen.getByLabelText(/total price/i)
    expect(totalField).toHaveValue()
  })

  it("maintains visual parity with V1 styling", () => {
    const { container } = renderWithProviders(
      <CreateBuyOrderV2 aggregate={mockAggregate} />,
    )

    // Check image paper styling
    const imagePaper = container.querySelector('[alt="Test Item"]')
      ?.parentElement
    expect(imagePaper).toHaveStyle({
      minHeight: "400px",
      maxHeight: "600px",
      height: "400px",
    })

    // Check Grid container exists
    const gridContainers = container.querySelectorAll('.MuiGrid-container')
    expect(gridContainers.length).toBeGreaterThan(0)
  })

  it("includes accessibility attributes", () => {
    renderWithProviders(<CreateBuyOrderV2 aggregate={mockAggregate} />)

    // Check that all form elements are accessible by label
    expect(screen.getByLabelText(/minimum quality tier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximum quality tier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/minimum price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximum price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/enter quantity/i)).toBeInTheDocument()
    
    // Check submit button has accessible name
    expect(screen.getByRole("button", { name: /submit buy order/i })).toBeInTheDocument()
  })

  it("uses fallback image on error", () => {
    const aggregateWithoutPhoto = {
      ...mockAggregate,
      photos: [],
    }

    renderWithProviders(<CreateBuyOrderV2 aggregate={aggregateWithoutPhoto} />)

    const image = screen.getByAltText("Test Item") as HTMLImageElement
    expect(image.src).toContain("default-image.png")
  })

  it("updates game_item_id when aggregate changes", () => {
    const { rerender } = renderWithProviders(
      <CreateBuyOrderV2 aggregate={mockAggregate} />,
    )

    const newAggregate = {
      ...mockAggregate,
      details: {
        ...mockAggregate.details,
        game_item_id: "new-item-id",
        title: "New Item",
      },
    }

    rerender(
      <Provider store={createTestStore()}>
        <ThemeProvider theme={createExtendedTheme()}>
          <BrowserRouter>
            <CreateBuyOrderV2 aggregate={newAggregate} />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>,
    )

    expect(screen.getByText("New Item")).toBeInTheDocument()
  })
})
