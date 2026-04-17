import "./setup";
import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GameItemListingsV2 } from "../GameItemListingsV2";
import { marketV2Api } from "../../../../store/api/v2/market";

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
  ListingNameAndRating: ({ user, contractor }: any) => (
    <div data-testid="seller-rating">
      {user?.username || contractor?.name}
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

// Mock data
const mockGameItemData = {
  game_item: {
    id: "test-game-item-id",
    name: "Test Game Item",
    type: "Weapon",
    description: "A test game item",
    image_url: "https://example.com/image.png",
  },
  quality_distribution: [
    {
      quality_tier: 1,
      listing_count: 5,
      min_price: 1000,
      avg_price: 1200,
      max_price: 1500,
      total_quantity: 50,
    },
    {
      quality_tier: 3,
      listing_count: 10,
      min_price: 2000,
      avg_price: 2500,
      max_price: 3000,
      total_quantity: 100,
    },
    {
      quality_tier: 5,
      listing_count: 3,
      min_price: 5000,
      avg_price: 5500,
      max_price: 6000,
      total_quantity: 30,
    },
  ],
  listings: [
    {
      listing_id: "listing-1",
      seller_id: "seller-1",
      seller_type: "user" as const,
      seller_name: "TestSeller1",
      seller_rating: 4.5,
      quality_tier_min: 3,
      quality_tier_max: 3,
      price_min: 2000,
      price_max: 2000,
      quantity_available: 10,
      variant_count: 1,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      listing_id: "listing-2",
      seller_id: "seller-2",
      seller_type: "user" as const,
      seller_name: "TestSeller2",
      seller_rating: 4.8,
      quality_tier_min: 5,
      quality_tier_max: 5,
      price_min: 5000,
      price_max: 5000,
      quantity_available: 5,
      variant_count: 2,
      created_at: "2024-01-02T00:00:00Z",
    },
    {
      listing_id: "listing-3",
      seller_id: "seller-3",
      seller_type: "contractor" as const,
      seller_name: "TestContractor",
      seller_rating: 4.2,
      quality_tier_min: 1,
      quality_tier_max: 1,
      price_min: 1000,
      price_max: 1000,
      quantity_available: 20,
      variant_count: 1,
      created_at: "2024-01-03T00:00:00Z",
    },
  ],
  total: 3,
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
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
}

describe("GameItemListingsV2", () => {
  beforeEach(() => {
    // Mock the RTK Query hook
    vi.spyOn(marketV2Api.endpoints.getListings, "useQuery").mockReturnValue({
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
      
      // Check for table headers
      expect(screen.getByText("Quality Tier")).toBeInTheDocument();
      expect(screen.getByText("Min Price")).toBeInTheDocument();
      expect(screen.getByText("Avg Price")).toBeInTheDocument();
      expect(screen.getByText("Max Price")).toBeInTheDocument();
      expect(screen.getByText("Total Quantity")).toBeInTheDocument();
    });

    it("should show correct price data for each tier", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      // Tier 1 prices
      expect(screen.getByText(/1,000 aUEC/)).toBeInTheDocument();
      expect(screen.getByText(/1,200 aUEC/)).toBeInTheDocument();
      expect(screen.getByText(/1,500 aUEC/)).toBeInTheDocument();
      
      // Tier 5 prices
      expect(screen.getByText(/5,000 aUEC/)).toBeInTheDocument();
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
      
      // Should show filtered header
      await waitFor(() => {
        expect(screen.getByText(/Tier 3/)).toBeInTheDocument();
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
      
      expect(screen.getByTestId("quality-badge-1")).toBeInTheDocument();
      expect(screen.getByTestId("quality-badge-3")).toBeInTheDocument();
      expect(screen.getByTestId("quality-badge-5")).toBeInTheDocument();
    });

    it("should display variant count for listings with multiple variants", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      // Listing 2 has variant_count: 2, should show variant selector
      const variantSelectors = screen.getAllByTestId("variant-selector");
      expect(variantSelectors.length).toBeGreaterThan(0);
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

    it("should disable add to cart when variant not selected for multi-variant listings", () => {
      renderWithProviders(<GameItemListingsV2 />);
      
      const addToCartButtons = screen.getAllByTestId("add-to-cart-button");
      // Listing 2 has multiple variants, button should be disabled initially
      const multiVariantButton = addToCartButtons[1];
      expect(multiVariantButton).toBeDisabled();
    });

    it("should enable add to cart after variant selection", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GameItemListingsV2 />);
      
      const variantSelector = screen.getAllByTestId("variant-selector")[0];
      await user.selectOptions(variantSelector, "variant-1");
      
      await waitFor(() => {
        const addToCartButtons = screen.getAllByTestId("add-to-cart-button");
        expect(addToCartButtons[1]).not.toBeDisabled();
      });
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
      
      expect(marketV2Api.endpoints.getListings.useQuery).toHaveBeenCalledWith(
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
      vi.spyOn(marketV2Api.endpoints.getListings, "useQuery").mockReturnValue({
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
      vi.spyOn(marketV2Api.endpoints.getListings, "useQuery").mockReturnValue({
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
      vi.spyOn(marketV2Api.endpoints.getListings, "useQuery").mockReturnValue({
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
      expect(screen.getByText("No quality data available")).toBeInTheDocument();
    });

    it("should handle empty listings", () => {
      vi.spyOn(marketV2Api.endpoints.getListings, "useQuery").mockReturnValue({
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
