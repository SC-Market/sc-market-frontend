import "./setup";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
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

// The current MyListingsV2 desktop view renders three independent lazy sections
// (Active / Inactive / Archived), each calling useGetMyListingsQuery. We mock the
// hook at module level so every section resolves to the same controllable result.
let myListingsReturn: any = {
  data: undefined,
  isLoading: true,
  isFetching: false,
  error: undefined,
  refetch: () => {},
};

vi.mock("../../../../store/api/v2/market", async () => {
  const actual: any = await vi.importActual("../../../../store/api/v2/market");
  return {
    ...actual,
    useGetMyListingsQuery: () => myListingsReturn,
    useUpdateListingMutation: () => [
      vi.fn(() => ({ unwrap: () => Promise.resolve({}) })),
      {},
    ],
  };
});

// Import the component AFTER declaring the mock.
import { MyListingsV2 } from "../MyListingsV2";

vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../../components/router/ShopContextFromRoute", () => ({
  useShopRouteContext: () => ({ shop: { shop_id: "shop-1", name: "Test Shop", slug: "test-shop" } }),
  useOptionalShopRouteContext: () => ({ shop: { shop_id: "shop-1", name: "Test Shop", slug: "test-shop" } }),
}));

vi.mock("../../../../hooks/layout/Drawer", () => ({
  useDrawerOpen: () => [false, vi.fn()],
}));

vi.mock("../../../../util/time", () => ({
  getRelativeTime: () => "2 days ago",
}));

// react-i18next mock — return a string when a default value is provided either as
// a plain string or inside an options object ({ defaultValue }).
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
    }),
  };
});

const createMockStore = () =>
  configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    } as any,
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
    quantity_available: 50,
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
    quantity_available: 100,
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
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>,
  );
};

describe("MyListingsV2", () => {
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

  it("renders section headers for the desktop manage view", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Inactive Listings")).toBeInTheDocument());
    expect(screen.getByText("Archived Listings")).toBeInTheDocument();
  });

  it("renders listings with variant count and total quantity", async () => {
    renderPage();
    // Three lazy sections share the mocked query, so each listing appears once per section.
    await waitFor(() =>
      expect(screen.getAllByText("High Quality Mining Tool").length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText("3 variants").length).toBeGreaterThan(0);
    expect(screen.getAllByText("50").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Standard Ship Components").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 variant").length).toBeGreaterThan(0);
    expect(screen.getAllByText("100").length).toBeGreaterThan(0);
  });

  it("displays price range (min to max across variants)", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("1,000 - 5,000 aUEC").length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText("500 aUEC").length).toBeGreaterThan(0);
  });

  it("displays quality tier range for each listing", async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByText("Tier 3-5").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Tier 2").length).toBeGreaterThan(0);
  });

  it("provides an edit button for each listing", async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByText("Edit").length).toBeGreaterThan(0));
    const editButtons = screen.getAllByText("Edit");
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("links each listing card to its detail page", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("High Quality Mining Tool").length).toBeGreaterThan(0),
    );
    const card = screen
      .getAllByText("High Quality Mining Tool")[0]
      .closest("a") as HTMLAnchorElement;
    expect(card).toBeTruthy();
    // formatMarketUrl → /market/<8charid>--<slug>
    expect(card.getAttribute("href")).toContain("/market/");
    expect(card.getAttribute("href")).toContain("high-quality-mining-tool");
  });

  it("displays empty state when no listings found", async () => {
    myListingsReturn = {
      data: { listings: [], total: 0 },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    };
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("No listings yet").length).toBeGreaterThan(0),
    );
  });

  it("displays listing title, status chip, and created date", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("High Quality Mining Tool").length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText("ACTIVE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2 days ago").length).toBeGreaterThan(0);
  });
});
