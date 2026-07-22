import "./setup";
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { CreateBuyOrderV2 } from "../CreateBuyOrderV2"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BrowserRouter } from "react-router-dom"
import { serviceApi } from "../../../../../store/service"
import { generatedApiV2 } from "../../../../../store/generatedApiV2"
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
  useCreateStandingBuyOrderMutation: vi.fn(() => [
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

// A "tier" quality-mode item (armor/weapon/clothing) so the component renders
// the Min/Max Quality Tier dropdowns. "commodity" would trigger value mode.
const mockGameItem = {
  id: "test-item-id",
  name: "Test Item",
  type: "helmet",
}

const createTestStore = () =>
  configureStore({
    reducer: {
      [serviceApi.reducerPath]: serviceApi.reducer,
      [generatedApiV2.reducerPath]: generatedApiV2.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(serviceApi.middleware, generatedApiV2.middleware),
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

  it("renders with create buy order form", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    expect(screen.getByText("Create Buy Order")).toBeInTheDocument()
  })

  it("displays quality tier range selectors", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    expect(screen.getByLabelText(/min quality tier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max quality tier/i)).toBeInTheDocument()
  })

  it("displays price range inputs", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    expect(screen.getByLabelText(/min price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max price/i)).toBeInTheDocument()
  })

  it("displays quantity input", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it("displays negotiable checkbox", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    expect(
      screen.getByRole("checkbox", { name: /negotiable/i }),
    ).toBeInTheDocument()
  })

  it("validates quality_tier_min <= quality_tier_max", async () => {
    const mockAlert = vi.fn()
    const { useAlertHook } = await import("../../../../../hooks/alert/AlertHook")
    vi.mocked(useAlertHook).mockReturnValue(mockAlert)

    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    // Provide a valid price + quantity first so validation reaches the quality check
    // (the price check runs before the quality-tier check).
    fireEvent.change(screen.getByLabelText(/min price/i), { target: { value: "1000" } })
    fireEvent.change(screen.getByLabelText(/max price/i), { target: { value: "2000" } })

    // Set min > max
    const minSelect = screen.getByLabelText(/min quality tier/i)
    const maxSelect = screen.getByLabelText(/max quality tier/i)

    fireEvent.change(minSelect, { target: { value: "5" } })
    fireEvent.change(maxSelect, { target: { value: "1" } })

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit/i })
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

    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    // Set price min > max
    const minPriceInput = screen.getByLabelText(/min price/i)
    const maxPriceInput = screen.getByLabelText(/max price/i)

    fireEvent.change(minPriceInput, { target: { value: "5000" } })
    fireEvent.change(maxPriceInput, { target: { value: "1000" } })

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit/i })
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
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    const negotiableCheckbox = screen.getByRole("checkbox", {
      name: /negotiable/i,
    })

    // Initially not negotiable
    expect(screen.getByLabelText(/min price/i)).toBeInTheDocument()

    // Check negotiable
    fireEvent.click(negotiableCheckbox)

    // Labels should change to "optional"
    expect(
      screen.getByLabelText(/min price \(optional\)/i),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/max price \(optional\)/i),
    ).toBeInTheDocument()
  })

  it("displays total price range calculation", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    const minPriceInput = screen.getByLabelText(/min price/i)
    const maxPriceInput = screen.getByLabelText(/max price/i)
    const quantityInput = screen.getByLabelText(/quantity/i)

    fireEvent.change(minPriceInput, { target: { value: "1000" } })
    fireEvent.change(maxPriceInput, { target: { value: "2000" } })
    fireEvent.change(quantityInput, { target: { value: "5" } })

    // Total should show range
    const totalField = screen.getByLabelText(/total price range/i)
    expect(totalField).toBeInTheDocument()
  })

  it("maintains visual parity with V1 styling", () => {
    const { container } = renderWithProviders(
      <CreateBuyOrderV2 gameItem={mockGameItem} />,
    )

    // Check Grid container exists
    const gridContainers = container.querySelectorAll('.MuiGrid-container')
    expect(gridContainers.length).toBeGreaterThan(0)
    
    // Check Section component is used
    expect(screen.getByText("Create Buy Order")).toBeInTheDocument()
  })

  it("includes accessibility attributes", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    // Check that all form elements are accessible by label
    expect(screen.getByLabelText(/min quality tier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max quality tier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/min price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    
    // Check submit button has accessible name
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument()
  })

  it("disables price inputs when negotiable is checked", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    const negotiableCheckbox = screen.getByRole("checkbox", {
      name: /negotiable/i,
    })
    const minPriceInput = screen.getByLabelText(/min price/i)
    const maxPriceInput = screen.getByLabelText(/max price/i)

    // Initially enabled
    expect(minPriceInput).not.toBeDisabled()
    expect(maxPriceInput).not.toBeDisabled()

    // Check negotiable
    fireEvent.click(negotiableCheckbox)

    // Should be disabled
    expect(minPriceInput).toBeDisabled()
    expect(maxPriceInput).toBeDisabled()
  })

  it("reflects the selected quality tier values", () => {
    renderWithProviders(<CreateBuyOrderV2 gameItem={mockGameItem} />)

    const minSelect = screen.getByLabelText(/min quality tier/i) as HTMLSelectElement
    const maxSelect = screen.getByLabelText(/max quality tier/i) as HTMLSelectElement

    // Select tier range
    fireEvent.change(minSelect, { target: { value: "3" } })
    fireEvent.change(maxSelect, { target: { value: "5" } })

    // The native selects should hold the chosen tier values
    expect(minSelect.value).toBe("3")
    expect(maxSelect.value).toBe("5")
  })
})
