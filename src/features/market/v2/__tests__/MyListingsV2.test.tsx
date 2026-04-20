import "./setup";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MyListingsV2 } from "../MyListingsV2";
import { marketV2Api } from "../../../../store/api/v2/market";
import type { MyListingItem } from "../../../../store/api/v2/market";

// Mock the hooks
vi.mock("../../../../hooks/layout/Drawer", () => ({
  useDrawerOpen: () => [false, vi.fn()],
}));

vi.mock("../../../../hooks/styles/Theme", () => ({
  ExtendedTheme: {},
}));

vi.mock("../../../../util/time", () => ({
  getRelativeTime: (date: string) => "2 days ago",
}));

// Mock translation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create mock store
const createMockStore = (mockData?: any) => {
  const reducer = {
    [marketV2Api.reducerPath]: marketV2Api.reducer,
  } as any
  
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
    preloadedState: mockData,
  });
};

// Mock listing data
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
];

describe("MyListingsV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    const store = createMockStore();

    // Mock the query to return loading state
    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Should show skeleton loaders
    expect(screen.getAllByTestId("listing-skeleton")).toHaveLength(16);
  });

  it("renders listings with variant count and total quantity", async () => {
    const store = createMockStore();

    // Mock the query to return data
    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 2,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Check first listing
    expect(screen.getByText("High Quality Mining Tool")).toBeInTheDocument();
    expect(screen.getByText("3 variants")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    // Check second listing
    expect(screen.getByText("Standard Ship Components")).toBeInTheDocument();
    expect(screen.getByText("1 variant")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("displays price range (min to max across variants)", async () => {
    const store = createMockStore();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 2,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // First listing has price range
    expect(screen.getByText("1,000 - 5,000 aUEC")).toBeInTheDocument();

    // Second listing has single price
    expect(screen.getByText("500 aUEC")).toBeInTheDocument();
  });

  it("displays quality tier range for each listing", async () => {
    const store = createMockStore();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 2,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // First listing has quality range
    expect(screen.getByText("Tier 3-5")).toBeInTheDocument();

    // Second listing has single tier
    expect(screen.getByText("Tier 2")).toBeInTheDocument();
  });

  it("provides status filter dropdown", async () => {
    const store = createMockStore();
    const mockRefetch = vi.fn();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 2,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Find status filter dropdown
    const statusFilter = screen.getByLabelText("Status");
    expect(statusFilter).toBeInTheDocument();

    // Open dropdown
    fireEvent.mouseDown(statusFilter);

    // Check options
    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Sold")).toBeInTheDocument();
      expect(screen.getByText("Expired")).toBeInTheDocument();
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });
  });

  it("provides pagination controls", async () => {
    const store = createMockStore();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 100, // More than one page
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Check pagination is present
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("links to listing detail page for each listing", async () => {
    const store = createMockStore();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 2,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Click on first listing card
    const firstListingCard = screen.getByText("High Quality Mining Tool").closest("div[role='button']");
    if (firstListingCard) {
      fireEvent.click(firstListingCard);
    }

    // Check navigation was called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/market/listing-1");
    });
  });

  it("provides edit button for each listing", async () => {
    const store = createMockStore();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 2,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Find edit buttons
    const editButtons = screen.getAllByText("Edit");
    expect(editButtons.length).toBeGreaterThan(0);

    // Click first edit button
    fireEvent.click(editButtons[0]);

    // Check navigation was called with edit route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/market_edit/listing-1");
    });
  });

  it("displays empty state when no listings found", async () => {
    const store = createMockStore();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: [],
        total: 0,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Check empty state
    expect(screen.getByText("No listings found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You haven't created any listings yet. Create your first listing to get started!"
      )
    ).toBeInTheDocument();
  });

  it("displays listing title, status, and created date", async () => {
    const store = createMockStore();

    vi.spyOn(marketV2Api.endpoints.getMyListings, "useQuery").mockReturnValue({
      data: {
        listings: mockListings,
        total: 2,
        page: 1,
        page_size: 48,
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyListingsV2 />
        </BrowserRouter>
      </Provider>
    );

    // Check title
    expect(screen.getByText("High Quality Mining Tool")).toBeInTheDocument();

    // Check status chip
    expect(screen.getAllByText("ACTIVE")[0]).toBeInTheDocument();

    // Check created date (mocked to return "2 days ago")
    expect(screen.getAllByText("2 days ago").length).toBeGreaterThan(0);
  });
});
