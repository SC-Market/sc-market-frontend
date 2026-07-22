import "./setup";
/**
 * StockManagerV2 Component Tests
 *
 * The StockManagerV2 page renders the "Manage Listings" stock view: a page
 * header with a Create Listing action plus a data grid of the shop's listings
 * (driven by useGetMyListingsQuery). The data grid itself (LazyDataGrid) and the
 * sidebar search area are mocked so the tests focus on this component's own
 * structure and data plumbing.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MyListingItem } from "../../../../store/api/v2/market";
import { marketV2Api } from "../../../../store/api/v2/market";
import { serviceApi } from "../../../../store/service";

const testTheme = createTheme({
  palette: { outline: { main: "#e0e0e0" } },
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
  borderRadius: { topLevel: 0.375, image: 0.375, button: 1, input: 0.5, chip: 0.5, minimal: 0 },
} as any);

// Control the listings query result at module level.
let myListingsReturn: any = {
  data: undefined,
  isLoading: true,
  isFetching: false,
  error: undefined,
  refetch: () => {},
};

vi.mock("../../../../store/api/v2/market", async () => {
  const actual: any = await vi.importActual("../../../../store/api/v2/market");
  const noopMutation = () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), {}];
  return {
    ...actual,
    useGetMyListingsQuery: () => myListingsReturn,
    useUpdateListingMutation: noopMutation,
    useRefreshListingMutation: noopMutation,
    useDeleteListingMutation: noopMutation,
    useCreateListingMutation: noopMutation,
    useUpdateStockLotMutation: noopMutation,
  };
});

// Mock the lazy data grid so the grid does not suspend forever in tests.
vi.mock("../../../../components/grid/ThemedDataGrid", () => ({
  ThemedDataGrid: ({ rows }: any) => (
    <div data-testid="stock-data-grid">
      {(rows || []).map((r: any) => (
        <div key={r.id} data-testid="stock-row">
          {r.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock the heavy sidebar search area.
vi.mock("../ListingSearchV2", () => ({
  MarketSearchAreaV2: () => <div data-testid="market-search-area" />,
}));

import { StockManagerV2 } from "../StockManagerV2";

vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children, isLoading }: any) => (
    <div data-testid="standard-page-layout">
      {isLoading && <div role="progressbar" data-testid="loading" />}
      {children}
    </div>
  ),
}));

vi.mock("../../../../components/metadata/Page", () => ({
  Page: ({ children }: any) => <>{children}</>,
  shouldShowErrorPage: () => false,
}));

vi.mock("../../../../components/router/ShopContextFromRoute", () => ({
  useShopRouteContext: () => ({
    shop: { shop_id: "shop-1", name: "Test Shop", slug: "test-shop" },
  }),
  useOptionalShopRouteContext: () => ({
    shop: { shop_id: "shop-1", name: "Test Shop", slug: "test-shop" },
  }),
}));

vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}));

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string | { defaultValue?: string }) => {
        if (typeof defaultValue === "object" && defaultValue !== null) {
          return defaultValue.defaultValue ?? key;
        }
        return (defaultValue as string) || key;
      },
      i18n: { language: "en", changeLanguage: vi.fn() },
    }),
  };
});

const createMockStore = () =>
  configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware, serviceApi.middleware),
  });

const mockListings: MyListingItem[] = [
  {
    listing_id: "listing-1",
    title: "High Quality Mining Tool",
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-16T12:00:00Z",
    variant_count: 3,
    quantity_available: 100,
    price_min: 1000,
    price_max: 5000,
    quality_tier_min: 3,
    quality_tier_max: 5,
  },
  {
    listing_id: "listing-2",
    title: "Standard Ship Components",
    status: "active",
    created_at: "2024-01-14T08:00:00Z",
    updated_at: "2024-01-14T08:00:00Z",
    variant_count: 1,
    quantity_available: 50,
    price_min: 500,
    price_max: 500,
    quality_tier_min: 2,
    quality_tier_max: 2,
  },
] as any;

const renderPage = () => {
  const store = createMockStore();
  return render(
    <ThemeProvider theme={testTheme}>
      <MemoryRouter>
        <Provider store={store}>
          <StockManagerV2 />
        </Provider>
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe("StockManagerV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    myListingsReturn = {
      data: { listings: mockListings, total: 2 },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    };
  });

  it("renders loading state initially", () => {
    myListingsReturn = {
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    };
    renderPage();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders the manage listings header and create button", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("Manage Listings").length).toBeGreaterThan(0),
    );
    expect(screen.getByText("Create Listing")).toBeInTheDocument();
  });

  it("renders the sidebar search area", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("market-search-area")).toBeInTheDocument(),
    );
  });

  it("renders a data grid populated with the shop's listings", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("stock-data-grid")).toBeInTheDocument(),
    );
    expect(screen.getByText("High Quality Mining Tool")).toBeInTheDocument();
    expect(screen.getByText("Standard Ship Components")).toBeInTheDocument();
  });

  it("renders an empty data grid when there are no listings", async () => {
    myListingsReturn = {
      data: { listings: [], total: 0 },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    };
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("stock-data-grid")).toBeInTheDocument(),
    );
    expect(screen.queryAllByTestId("stock-row")).toHaveLength(0);
  });

  it("links to the archived listings view", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("sidebar.archived_listings")).toBeInTheDocument(),
    );
  });
});
