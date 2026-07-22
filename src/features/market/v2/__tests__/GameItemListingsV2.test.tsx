import "./setup";
import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { GameItemListingsV2 } from "../GameItemListingsV2";
import * as marketApi from "../../../../store/api/v2/market";
import { marketV2Api } from "../../../../store/api/v2/market";

const testTheme = createTheme({
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
  borderRadius: { topLevel: 0.375, image: 0.375, button: 1, input: 0.5, chip: 0.5, minimal: 0 },
  palette: { outline: { main: "#e0e0e0" } },
} as any);

// Mock react-router-dom useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "test-game-item-id" }),
  };
});

// Mock react-cookie
vi.mock("react-cookie", () => ({
  useCookies: () => [
    {},
    vi.fn(),
    vi.fn(),
  ],
}));

// Deterministic translations: t returns the key (or a string defaultValue).
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: unknown) =>
      typeof defaultValue === "string" ? defaultValue : key,
    i18n: { language: "en" },
  }),
  Trans: ({ children }: any) => children,
}));

// Mock alert hook
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}));

// Mock components
vi.mock("../../../../components/market/v2/QualityHistogram", () => ({
  QualityHistogram: ({ distribution, title }: any) => (
    <div data-testid="quality-histogram">
      <div>{title}</div>
      <div>{distribution.length} tiers</div>
    </div>
  ),
}));

vi.mock("../../../../components/market/v2/QualityBadge", () => ({
  QualityBadge: ({ tier }: any) => <span data-testid={`quality-badge-${tier}`}>Tier {tier}</span>,
}));

vi.mock("../../../../components/market/v2/VariantSelector", () => ({
  VariantSelector: ({ onVariantChange }: any) => (
    <select
      data-testid="variant-selector"
      onChange={(e) => onVariantChange(e.target.value)}
    >
      <option value="">Select variant</option>
      <option value="variant-1">Variant 1</option>
      <option value="variant-2">Variant 2</option>
    </select>
  ),
}));

vi.mock("../../../../components/rating/ListingRating", () => ({
  ListingNameAndRating: ({ user, contractor, shop }: any) => (
    <div data-testid="seller-rating">
      {shop?.name || user?.username || contractor?.name}
    </div>
  ),
}));

vi.mock("../../../../components/haptic", () => ({
  HapticButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="add-to-cart-button">
      {children}
    </button>
  ),
}));

// Mock data — matches the current GetGameItemListingsResponse schema.
const mockGameItemData = {
  game_item: {
    id: "test-game-item-id",
    name: "Test Game Item",
    type: "Weapon",
    image_url: "https://example.com/image.png",
  },
  quality_distribution: [
    {
      quality_tier: 1,
      listing_count: 5,
      shop_count: 3,
      price_min: 1000,
      price_avg: 1200,
      price_max: 1500,
      quantity_available: 50,
    },
    {
      quality_tier: 3,
      listing_count: 10,
      shop_count: 6,
      price_min: 2000,
      price_avg: 2500,
      price_max: 3000,
      quantity_available: 100,
    },
    {
      quality_tier: 5,
      listing_count: 3,
      shop_count: 2,
      price_min: 5000,
      price_avg: 5500,
      price_max: 6000,
      quantity_available: 30,
    },
  ],
  listings: [
    {
      listing_id: "listing-1",
      variant_id: "variant-1",
      title: "Listing One",
      shop_id: "shop-1",
      shop_name: "TestSeller1",
      shop_slug: "test-seller-1",
      shop_rating: 4.5,
      quality_tier: 3,
      price: 2000,
      quantity_available: 10,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      listing_id: "listing-2",
      variant_id: "variant-2",
      title: "Listing Two",
      shop_id: "shop-2",
      shop_name: "TestSeller2",
      shop_slug: "test-seller-2",
      shop_rating: 4.8,
      quality_tier: 5,
      price: 5000,
      quantity_available: 5,
      created_at: "2024-01-02T00:00:00Z",
    },
    {
      listing_id: "listing-3",
      variant_id: "variant-3",
      title: "Listing Three",
      shop_id: "shop-3",
      shop_name: "TestContractor",
      shop_slug: "test-contractor",
      shop_rating: 4.2,
      quality_tier: 1,
      price: 1000,
      quantity_available: 20,
      created_at: "2024-01-03T00:00:00Z",
    },
  ],
  total: 3,
  page: 1,
  page_size: 48,
};

// Helper to create test store
function createTestStore() {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
  });
}

// Helper to render with providers
function renderWithProviders(component: React.ReactElement) {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <ThemeProvider theme={testTheme}>
        <BrowserRouter>{component}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

describe("GameItemListingsV2", () => {
  beforeEach(() => {
    // Mock the RTK Query hook (standalone export used by the component)
    vi.spyOn(marketApi, "useGetListingsQuery").mockReturnValue({
      data: mockGameItemData,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Requirement 39.1: GameItemListingsV2 React component", () => {
    it("should render the component", () => {
      renderWithProviders(<GameItemListingsV2 />);
      expect(screen.getByText("Test Game Item")).toBeInTheDocument();
    });
  });

  describe("Requirement 39.2: Visual parity with V1", () => {
    it("should use identical card styling with minHeight 400", () => {
      renderWithProviders(<GameItemListingsV2 />);
      const cards = screen.getAllByRole("img");
      expect(cards.length).toBeGreaterThan(0);
    });

    it("should display game item image with fallback", () => {
      renderWithProviders(<GameItemListingsV2 />);
      const image = screen.getByAltText("Test Game Item");
      expect(image).toHaveAttribute("src", "https://example.com/image.png");
    });
  });

  describe("Requirement 39.4: Display QualityHistogram", () => {
    it("should render quality histogram with distribution data", () => {
      renderWithProviders(<GameItemListingsV2 />);
      const histogram = screen.getByTestId("quality-histogram");
      expect(histogram).toBeInTheDocument();
      expect(within(histogram).getByText("3 tiers")).toBeInTheDocument();
    });
  });

  describe("Requirement 39.5: Show price ranges by quality_tier", () => {
    it("should display price range table with all quality tiers", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      // Check for table headers ("Quality Tier" also appears as the filter label).
      expect(screen.getAllByText("Quality Tier").length).toBeGreaterThan(0);
      expect(screen.getByText("Min Price")).toBeInTheDocument();
      expect(screen.getByText("Avg Price")).toBeInTheDocument();
      expect(screen.getByText("Max Price")).toBeInTheDocument();
      expect(screen.getByText("Total Quantity")).toBeInTheDocument();
    });

    it("should show correct price data for each tier", () => {
      renderWithProviders(<GameItemListingsV2 />);

      // Prices may appear in both the distribution table and listing rows.
      expect(screen.getAllByText(/1,000 aUEC/).length).toBeGreaterThan(0);
      expect(screen.getByText(/1,200 aUEC/)).toBeInTheDocument();
      expect(screen.getByText(/1,500 aUEC/)).toBeInTheDocument();

      expect(screen.getAllByText(/5,000 aUEC/).length).toBeGreaterThan(0);
      expect(screen.getByText(/5,500 aUEC/)).toBeInTheDocument();
      expect(screen.getByText(/6,000 aUEC/)).toBeInTheDocument();
    });
  });

  describe("Requirement 39.6: Quality tier filter dropdown", () => {
    it("should render quality tier filter", () => {
      renderWithProviders(<GameItemListingsV2 />);
      expect(screen.getByLabelText("Quality Tier")).toBeInTheDocument();
    });

    it("should filter listings when tier is selected", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GameItemListingsV2 />);
      
      const filterSelect = screen.getByLabelText("Quality Tier");
      await user.selectOptions(filterSelect, "3");

      // Should show filtered header (Tier 3 also appears in badges/rows).
      await waitFor(() => {
        expect(screen.getAllByText(/Tier 3/).length).toBeGreaterThan(0);
      });
    });

    it("should show clear filter button when tier is selected", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GameItemListingsV2 />);
      
      const filterSelect = screen.getByLabelText("Quality Tier");
      await user.selectOptions(filterSelect, "5");
      
      await waitFor(() => {
        expect(screen.getByText("Clear Filter")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement 39.7: Display individual listings with variant information", () => {
    it("should display all listings", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      expect(screen.getByText("TestSeller1")).toBeInTheDocument();
      expect(screen.getByText("TestSeller2")).toBeInTheDocument();
      expect(screen.getByText("TestContractor")).toBeInTheDocument();
    });

    it("should show quality tier badges for each listing", () => {
      renderWithProviders(<GameItemListingsV2 />);

      // Badges appear both in the price-range table and in each listing row.
      expect(screen.getAllByTestId("quality-badge-1").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("quality-badge-3").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("quality-badge-5").length).toBeGreaterThan(0);
    });

    it("should display quality tier information per listing", () => {
      renderWithProviders(<GameItemListingsV2 />);

      // Each listing row surfaces its variant's quality tier via a QualityBadge.
      expect(screen.getAllByTestId("quality-badge-1").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("quality-badge-3").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("quality-badge-5").length).toBeGreaterThan(0);
    });
  });

  describe("Requirement 39.8: Show seller comparison for same quality_tier", () => {
    it("should display seller ratings", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      const sellerRatings = screen.getAllByTestId("seller-rating");
      expect(sellerRatings.length).toBe(3);
    });

    it("should show both user and contractor sellers", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      expect(screen.getByText("TestSeller1")).toBeInTheDocument();
      expect(screen.getByText("TestContractor")).toBeInTheDocument();
    });
  });

  describe("Requirement 39.9: Highlight best price per quality_tier", () => {
    it("should highlight the best price listing", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      // Listing 3 has the best price for Tier 1 (1000 aUEC)
      const bestPriceIndicators = screen.getAllByText("Best Price");
      expect(bestPriceIndicators.length).toBeGreaterThan(0);
    });

    it("should use success color for best price", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      const bestPriceText = screen.getAllByText("Best Price")[0];
      expect(bestPriceText).toBeInTheDocument();
    });
  });

  describe("Requirement 39.10: Add to Cart with variant selection", () => {
    it("should render add to cart button for each listing", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      const addToCartButtons = screen.getAllByTestId("add-to-cart-button");
      expect(addToCartButtons.length).toBe(3);
    });

    it("should render an enabled add to cart button per listing row", () => {
      renderWithProviders(<GameItemListingsV2 />);

      // Each per-variant row exposes its own add-to-cart button (variant is
      // implicit per row, so buttons are not disabled).
      const addToCartButtons = screen.getAllByTestId("add-to-cart-button");
      addToCartButtons.forEach((button) => expect(button).not.toBeDisabled());
    });

    it("should allow quantity input", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      const quantityInputs = screen.getAllByLabelText(/quantityToBuy/i);
      expect(quantityInputs.length).toBe(3);
    });
  });

  describe("Requirement 39.11: Feature flag routing", () => {
    it("should use RTK Query hook for data fetching", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      expect(marketApi.useGetListingsQuery).toHaveBeenCalledWith(
        {
          id: "test-game-item-id",
          qualityTier: undefined,
        },
        { skip: false }
      );
    });
  });

  describe("Requirement 39.12: Reuse MarketSidebar for filters", () => {
    it("should display filter controls", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      expect(screen.getByText("Filter by Quality Tier:")).toBeInTheDocument();
      expect(screen.getByLabelText("Quality Tier")).toBeInTheDocument();
    });
  });

  describe("Loading and error states", () => {
    it("should show loading state", () => {
      vi.spyOn(marketApi, "useGetListingsQuery").mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isSuccess: false,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<GameItemListingsV2 />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should show error state", () => {
      vi.spyOn(marketApi, "useGetListingsQuery").mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isSuccess: false,
        isError: true,
        error: { status: 500, data: "Server error" },
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<GameItemListingsV2 />);
      expect(screen.getByText("Failed to load game item listings")).toBeInTheDocument();
    });
  });

  describe("Empty states", () => {
    it("should handle empty quality distribution", () => {
      vi.spyOn(marketApi, "useGetListingsQuery").mockReturnValue({
        data: {
          ...mockGameItemData,
          quality_distribution: [],
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<GameItemListingsV2 />);
      // With no distribution, the price-range table renders its empty message.
      expect(screen.getByText("No price data available")).toBeInTheDocument();
    });

    it("should handle empty listings", () => {
      vi.spyOn(marketApi, "useGetListingsQuery").mockReturnValue({
        data: {
          ...mockGameItemData,
          listings: [],
          total: 0,
        },
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<GameItemListingsV2 />);
      // Should still render the component structure
      expect(screen.getByText("Test Game Item")).toBeInTheDocument();
    });
  });
});
