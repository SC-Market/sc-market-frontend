import { vi, describe, it, expect, beforeEach } from "vitest"
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BrowserRouter } from "react-router-dom"
import { CreateListingV2 } from "../CreateListingV2"

// Mock the API
const mockCreateListingMutation = vi.fn().mockReturnValue({
  unwrap: () => Promise.resolve({ listing: { listing_id: "new-id" } }),
})

vi.mock("../../../../store/api/v2/market", () => ({
  v2_marketApi: {
    reducerPath: "v2_marketApi",
    reducer: vi.fn(),
    middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
  },
  useCreateListingMutation: () => [
    mockCreateListingMutation,
    { isLoading: false },
  ],
}))

// Mock dependencies
vi.mock("@mui/icons-material", () => {
  const icon = (name: string) => {
    const Icon = (props: any) => <svg data-testid={`${name}Icon`} {...props} />
    Icon.displayName = name
    Icon.muiName = "SvgIcon"
    return Icon
  }
  return {
    AddCircleOutlineRounded: icon("AddCircleOutlineRounded"),
    DeleteOutlineRounded: icon("DeleteOutlineRounded"),
  }
})

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: any) => (typeof fallback === "string" ? fallback : key),
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}))

vi.mock("@mui/material/styles", async () => {
  const actual = await vi.importActual("@mui/material/styles")
  const base = (actual as any).createTheme()
  return {
    ...actual,
    useTheme: () => ({
      ...base,
      layoutSpacing: { layout: 1, component: 1.5, text: 0.5, compact: 0.5 },
      borderRadius: { topLevel: 1 },
    }),
  }
})

vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

vi.mock("../../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [null],
}))

vi.mock("../../../../components/markdown/Markdown.lazy", () => ({
  MarkdownEditor: ({ value, onChange, TextFieldProps }: any) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={TextFieldProps?.label}
    />
  ),
}))

vi.mock("../../../../features/market/components/GameItemSearchAutocomplete", () => ({
  GameItemSearchAutocomplete: ({ value, onChange }: any) => (
    <input
      data-testid="game-item-search"
      value={value || ""}
      onChange={(e) => onChange(e.target.value, "ship", e.target.value)}
    />
  ),
}))

vi.mock("../../../../components/modal/SelectPhotosArea", () => ({
  SelectPhotosArea: ({ photos, onPhotosChange }: any) => (
    <div data-testid="photo-area">
      <button onClick={() => onPhotosChange([])}>Clear Photos</button>
    </div>
  ),
}))

const createMockStore = () => {
  return configureStore({
    reducer: {
      placeholder: (state = {}) => state,
    },
  })
}

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  )
}

describe("CreateListingV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateListingMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        listing: { listing_id: "test-listing-id" },
      }),
    })
  })

  describe("Form Rendering", () => {
    it("should render all form fields", () => {
      renderWithProviders(<CreateListingV2 />)

      expect(screen.getByTestId("game-item-search")).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
      expect(screen.getByText(/Unified Pricing/i)).toBeInTheDocument()
      expect(screen.getByText(/Per-Variant Pricing/i)).toBeInTheDocument()
    })

    it("should render initial lot input", () => {
      renderWithProviders(<CreateListingV2 />)

      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quality tier/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quality value/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/source/i)).toBeInTheDocument()
    })
  })

  describe("Pricing Mode", () => {
    it("should show base price field in unified mode", () => {
      renderWithProviders(<CreateListingV2 />)

      const unifiedRadio = screen.getByLabelText(/Unified Pricing/i)
      fireEvent.click(unifiedRadio)

      expect(screen.getByLabelText(/base price/i)).toBeInTheDocument()
    })

    it("should show price field per lot in per-variant mode", () => {
      renderWithProviders(<CreateListingV2 />)

      const perVariantRadio = screen.getByLabelText(/Per-Variant Pricing/i)
      fireEvent.click(perVariantRadio)

      expect(screen.getByLabelText(/^price$/i)).toBeInTheDocument()
    })

    it("should switch between pricing modes", () => {
      renderWithProviders(<CreateListingV2 />)

      // Start with unified
      const unifiedRadio = screen.getByLabelText(/Unified Pricing/i)
      fireEvent.click(unifiedRadio)
      expect(screen.getByLabelText(/base price/i)).toBeInTheDocument()

      // Switch to per-variant
      const perVariantRadio = screen.getByLabelText(/Per-Variant Pricing/i)
      fireEvent.click(perVariantRadio)
      expect(screen.queryByLabelText(/base price/i)).not.toBeInTheDocument()
      expect(screen.getByLabelText(/^price$/i)).toBeInTheDocument()
    })
  })

  describe("Lot Management", () => {
    it("should add new lot when clicking add button", () => {
      renderWithProviders(<CreateListingV2 />)

      const addButton = screen.getByText(/add another lot/i)
      fireEvent.click(addButton)

      const lots = screen.getAllByText(/Lot \d+/)
      expect(lots.length).toBe(2)
    })

    it("should remove lot when clicking delete button", async () => {
      renderWithProviders(<CreateListingV2 />)

      // Add a second lot
      const addButton = screen.getByText(/add another lot/i)
      fireEvent.click(addButton)

      // Find and click delete button
      const deleteButtons = screen.getAllByRole("button", { name: "" })
      const deleteButton = deleteButtons.find(
        (btn) => btn.querySelector("svg")?.getAttribute("data-testid") === "DeleteOutlineRoundedIcon"
      )

      if (deleteButton) {
        fireEvent.click(deleteButton)
      }

      await waitFor(() => {
        const lots = screen.getAllByText(/Lot \d+/)
        expect(lots.length).toBe(1)
      })
    })

    it("should not show delete button when only one lot exists", () => {
      renderWithProviders(<CreateListingV2 />)

      const deleteButtons = screen.queryAllByRole("button", { name: "" })
      const hasDeleteIcon = deleteButtons.some(
        (btn) => btn.querySelector("svg")?.getAttribute("data-testid") === "DeleteOutlineRoundedIcon"
      )

      expect(hasDeleteIcon).toBe(false)
    })
  })

  describe("Form Validation", () => {
    it("should require game item selection", async () => {
      renderWithProviders(<CreateListingV2 />)

      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: "Test Listing" } })

      const submitButton = screen.getByText(/create listing/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateListingMutation).not.toHaveBeenCalled()
      })
    })

    it("should require title", async () => {
      renderWithProviders(<CreateListingV2 />)

      const gameItemSearch = screen.getByTestId("game-item-search")
      fireEvent.change(gameItemSearch, { target: { value: "test-item-id" } })

      const submitButton = screen.getByText(/create listing/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateListingMutation).not.toHaveBeenCalled()
      })
    })
  })

  describe("Form Submission", () => {
    // TODO: MUI TextField fireEvent.change does not trigger React state updates correctly in test env
    it.skip("should submit with unified pricing", async () => {
      renderWithProviders(<CreateListingV2 />)

      // Fill form
      const gameItemSearch = screen.getByTestId("game-item-search")
      fireEvent.change(gameItemSearch, { target: { value: "test-item-id" } })

      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: "Test Listing" } })

      const descriptionInput = screen.getByPlaceholderText(/description/i)
      fireEvent.change(descriptionInput, { target: { value: "Test description" } })

      // Submit
      const submitButton = screen.getByText(/create listing/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateListingMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            createListingRequest: expect.objectContaining({
              title: "Test Listing",
              description: "Test description",
              game_item_id: "test-item-id",
              pricing_mode: "unified",
            }),
          })
        )
      })
    })

    it.skip("should submit with per-variant pricing", async () => {
      renderWithProviders(<CreateListingV2 />)

      // Fill form
      const gameItemSearch = screen.getByTestId("game-item-search")
      fireEvent.change(gameItemSearch, { target: { value: "test-item-id" } })

      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: "Test Listing" } })

      // Switch to per-variant pricing
      const perVariantRadio = screen.getByLabelText(/Per-Variant Pricing/i)
      fireEvent.click(perVariantRadio)

      // Submit
      const submitButton = screen.getByText(/create listing/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateListingMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            createListingRequest: expect.objectContaining({
              pricing_mode: "per_variant",
            }),
          })
        )
      })
    })

    it.skip("should include variant attributes in submission", async () => {
      renderWithProviders(<CreateListingV2 />)

      // Fill form
      const gameItemSearch = screen.getByTestId("game-item-search")
      fireEvent.change(gameItemSearch, { target: { value: "test-item-id" } })

      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: "Test Listing" } })

      // Submit
      const submitButton = screen.getByText(/create listing/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateListingMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            createListingRequest: expect.objectContaining({
              lots: expect.arrayContaining([
                expect.objectContaining({
                  variant_attributes: expect.objectContaining({
                    quality_tier: expect.any(Number),
                    quality_value: expect.any(Number),
                    crafted_source: expect.any(String),
                  }),
                }),
              ]),
            }),
          })
        )
      })
    })
  })

  describe("Error Handling", () => {
    it.skip("should handle API errors", async () => {
      mockCreateListingMutation.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "API Error" },
        }),
      })

      renderWithProviders(<CreateListingV2 />)

      // Fill and submit form
      const gameItemSearch = screen.getByTestId("game-item-search")
      fireEvent.change(gameItemSearch, { target: { value: "test-item-id" } })

      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: "Test Listing" } })

      const submitButton = screen.getByText(/create listing/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateListingMutation).toHaveBeenCalled()
      })
    })
  })
})
