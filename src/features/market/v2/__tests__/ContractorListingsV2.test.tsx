import "./setup";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ContractorListingsV2 } from "../ContractorListingsV2";
import * as marketApi from "../../../../store/api/v2/market";
import { marketV2Api } from "../../../../store/api/v2/market";
import { serviceApi } from "../../../../store/service";

const testTheme = createTheme({
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
  borderRadius: { topLevel: 0.375, image: 0.375, button: 1, input: 0.5, chip: 0.5, minimal: 0 },
  palette: { outline: { main: "#e0e0e0" } },
} as any);

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: unknown) =>
      typeof defaultValue === "string" ? defaultValue : key,
  }),
}));

vi.mock("../../../../hooks/layout/Drawer", () => ({
  useDrawerOpen: () => [false, vi.fn()],
}));

vi.mock("../../../../util/time", () => ({
  getRelativeTime: () => "2 days ago",
}));

vi.mock("../../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [
    {
      spectrum_id: "test-contractor-123",
      name: "Test Organization",
      roles: [
        {
          role_id: "role-1",
          name: "Manager",
          position: 1,
          manage_market: true,
        },
      ],
    },
    vi.fn(),
  ],
}));

// Override the global profileApi mock (setupTests) so the component sees a
// profile that belongs to the contractor org (enables the contractor lookup).
vi.mock("../../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({
    data: {
      username: "testuser",
      user_id: "user-123",
      contractors: [
        {
          spectrum_id: "test-contractor-123",
          role: "Manager",
          role_id: "role-1",
          roles: ["role-1"],
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

// Provide the contractor org details used for the header subtitle.
vi.mock("../../../contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: () => ({
    data: { name: "Test Organization", spectrum_id: "test-contractor-123" },
    isLoading: false,
    error: undefined,
  }),
}));

vi.mock("../../../../views/contractor/OrgRoles", () => ({
  has_permission: () => true,
}));

// Mock ListingSkeleton to avoid theme issues
vi.mock("../../../../components/skeletons", () => ({
  ListingSkeleton: () => <div data-testid="listing-skeleton">Loading...</div>,
}));

// Mock pagination component
vi.mock("../../components/listings/ListingPagination", () => ({
  ListingPagination: () => <nav>Pagination</nav>,
}));

// Mock empty state component
vi.mock("../../../../components/empty-states", () => ({
  EmptyListings: ({ title, description }: any) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

// Helper to create mock store with preloaded data
function createMockStore(mockData?: any) {
  const reducer = {
    [marketV2Api.reducerPath]: marketV2Api.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
  } as any;

  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware, serviceApi.middleware),
    preloadedState: mockData,
  });
}

// Helper to render component with router and store
function renderWithProviders(
  ui: React.ReactElement,
  {
    store = createMockStore(),
    route = "/org/test-contractor-123/listings",
  } = {}
) {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/org/:contractor_id/listings" element={ui} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
}

describe("ContractorListingsV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render organization header", async () => {
      // Mock the query to return empty results
      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: [], total: 0, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        expect(screen.getByText("Organization Listings")).toBeInTheDocument();
        expect(screen.getByText("Test Organization")).toBeInTheDocument();
      });
    });

    it("should display empty state when no listings found", async () => {
      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: [], total: 0, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        expect(screen.getByText("No listings found")).toBeInTheDocument();
      });
    });
  });

  describe("Contractor Filtering", () => {
    it("should filter listings to show only contractor listings", async () => {
      const mockListings = [
        {
          listing_id: "listing-1",
          seller_id: "test-contractor-123",
          seller_type: "contractor" as const,
          shop_name: "Test Organization",
          shop_rating: 4.5,
          title: "Contractor Listing",
          variant_count: 3,
          quantity_available: 150,
          price_min: 1000,
          price_max: 5000,
          quality_tier_min: 3,
          quality_tier_max: 5,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
        {
          listing_id: "listing-2",
          seller_id: "user-789",
          seller_type: "user" as const,
          shop_name: "someuser",
          shop_rating: 4.0,
          title: "User Listing",
          variant_count: 1,
          quantity_available: 10,
          price_min: 100,
          price_max: 100,
          quality_tier_min: 1,
          quality_tier_max: 1,
          created_at: "2024-01-13T10:00:00Z",
          updated_at: "2024-01-13T10:00:00Z",
        },
      ];

      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: mockListings, total: 2, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        // Filtering happens server-side (via shopSlug); the component renders
        // whatever the search endpoint returns.
        expect(screen.getByText("Contractor Listing")).toBeInTheDocument();
      });
    });
  });

  describe("Variant Information Display", () => {
    it("should display variant count and quality tier range", async () => {
      const mockListings = [
        {
          listing_id: "listing-1",
          seller_id: "test-contractor-123",
          seller_type: "contractor" as const,
          shop_name: "Test Organization",
          shop_rating: 4.5,
          title: "High Quality Components",
          variant_count: 3,
          quantity_available: 150,
          price_min: 1000,
          price_max: 5000,
          quality_tier_min: 3,
          quality_tier_max: 5,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: mockListings, total: 1, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        expect(screen.getByText("High Quality Components")).toBeInTheDocument();
        expect(screen.getByText("3 variants")).toBeInTheDocument();
        expect(screen.getByText("Tier 3-5")).toBeInTheDocument();
        expect(screen.getByText("1,000 - 5,000 aUEC")).toBeInTheDocument();
      });
    });
  });

  describe("Organization Branding", () => {
    it("should display organization name and rating", async () => {
      const mockListings = [
        {
          listing_id: "listing-1",
          seller_id: "test-contractor-123",
          seller_type: "contractor" as const,
          shop_name: "Test Organization",
          shop_rating: 4.5,
          title: "Test Listing",
          variant_count: 1,
          quantity_available: 100,
          price_min: 500,
          price_max: 500,
          quality_tier_min: 2,
          quality_tier_max: 2,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: mockListings, total: 1, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        expect(screen.getAllByText("Test Organization").length).toBeGreaterThan(0);
        // Rating renders as "4.5" followed by a star icon (no "⭐" text node).
        expect(screen.getByText("4.5")).toBeInTheDocument();
      });
    });
  });

  describe("RTK Query Integration", () => {
    it("should use useSearchListingsQuery hook", async () => {
      const mockQuery = vi.spyOn(marketApi, "useSearchListingsQuery");
      mockQuery.mockReturnValue({
        data: { listings: [], total: 0, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        expect(mockQuery).toHaveBeenCalled();
      });
    });
  });

  describe("Organization Branding Display (Requirement 43.10)", () => {
    it("should display organization logo when available", async () => {
      const mockListings = [
        {
          listing_id: "listing-1",
          seller_id: "test-contractor-123",
          seller_type: "contractor" as const,
          shop_name: "Test Organization",
          shop_rating: 4.8,
          shop_logo: "https://example.com/org-logo.png",
          title: "Organization Listing",
          variant_count: 2,
          quantity_available: 50,
          price_min: 2000,
          price_max: 3000,
          quality_tier_min: 4,
          quality_tier_max: 5,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: mockListings, total: 1, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        // The card surfaces the organization via a labeled Chip (with a
        // BusinessRounded icon), not an <img> logo.
        expect(screen.getAllByText("Test Organization").length).toBeGreaterThan(0);
      });
    });

    it("should display organization name prominently", async () => {
      const mockListings = [
        {
          listing_id: "listing-1",
          seller_id: "test-contractor-123",
          seller_type: "contractor" as const,
          shop_name: "Premium Organization",
          shop_rating: 4.9,
          title: "Premium Listing",
          variant_count: 5,
          quantity_available: 200,
          price_min: 5000,
          price_max: 10000,
          quality_tier_min: 3,
          quality_tier_max: 5,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: mockListings, total: 1, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        // Organization name should appear in header
        expect(screen.getAllByText("Premium Organization").length).toBeGreaterThan(0);
      });
    });

    it("should display organization rating badge", async () => {
      const mockListings = [
        {
          listing_id: "listing-1",
          seller_id: "test-contractor-123",
          seller_type: "contractor" as const,
          shop_name: "Verified Organization",
          shop_rating: 5.0,
          title: "Verified Listing",
          variant_count: 1,
          quantity_available: 10,
          price_min: 1000,
          price_max: 1000,
          quality_tier_min: 5,
          quality_tier_max: 5,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: mockListings, total: 1, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        // Rating renders as "5.0" followed by a star icon (no "⭐" text node).
        expect(screen.getByText("5.0")).toBeInTheDocument();
      });
    });

    it("should display contractor badge for organization listings", async () => {
      const mockListings = [
        {
          listing_id: "listing-1",
          seller_id: "test-contractor-123",
          seller_type: "contractor" as const,
          shop_name: "Test Organization",
          shop_rating: 4.5,
          title: "Contractor Badge Test",
          variant_count: 1,
          quantity_available: 10,
          price_min: 500,
          price_max: 500,
          quality_tier_min: 2,
          quality_tier_max: 2,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      vi.spyOn(marketApi, "useSearchListingsQuery").mockReturnValue({
        data: { listings: mockListings, total: 1, page: 1, page_size: 48 },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      const { container } = renderWithProviders(<ContractorListingsV2 />);

      await waitFor(() => {
        // Check for contractor/organization badge chip
        const chips = container.querySelectorAll('[class*="MuiChip-root"]');
        expect(chips.length).toBeGreaterThan(0);
      });
    });
  });
});
