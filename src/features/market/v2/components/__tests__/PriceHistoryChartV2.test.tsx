import "./setup";
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { PriceHistoryChartV2 } from "../PriceHistoryChartV2"
import { marketV2Api } from "../../../../../store/api/v2/market"

// Mock the MuiLineChart component
vi.mock("../../../../../components/charts/MuiCharts", () => ({
  MuiLineChart: vi.fn(({ series, height, width, xAxisType }) => (
    <div data-testid="mui-line-chart">
      <div data-testid="chart-height">{height}</div>
      <div data-testid="chart-width">{width}</div>
      <div data-testid="chart-xaxis-type">{xAxisType}</div>
      <div data-testid="chart-series-count">{series.length}</div>
      {series.map((s: any, idx: number) => (
        <div key={idx} data-testid={`series-${idx}`}>
          <div data-testid={`series-${idx}-name`}>{s.name}</div>
          <div data-testid={`series-${idx}-data-count`}>{s.data.length}</div>
        </div>
      ))}
    </div>
  )),
}))

// Mock translation
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string, options?: any) => {
        if (key === "market.tierN") {
          return `Tier ${options?.tier}`
        }
        if (key === "market.allTiers") return "All Tiers"
        if (key === "market.qualityTier") return "Quality Tier"
        if (key === "market.tier1") return "Tier 1"
        if (key === "market.tier2") return "Tier 2"
        if (key === "market.tier3") return "Tier 3"
        if (key === "market.tier4") return "Tier 4"
        if (key === "market.tier5") return "Tier 5"
        if (key === "market.loadingPriceHistory") return "Loading price history..."
        if (key === "market.errorLoadingPriceHistory")
          return "Error loading price history"
        if (key === "market.noPriceHistory") return "No price history available"
        return defaultValue || key
      },
    }),
  }
})

// Sample price history data
const mockPriceHistoryData = {
  data: [
    {
      timestamp: "2024-01-01T00:00:00Z",
      quality_tier: 1,
      avg_price: 1000,
      min_price: 900,
      max_price: 1100,
      volume: 10,
    },
    {
      timestamp: "2024-01-02T00:00:00Z",
      quality_tier: 1,
      avg_price: 1050,
      min_price: 950,
      max_price: 1150,
      volume: 12,
    },
    {
      timestamp: "2024-01-01T00:00:00Z",
      quality_tier: 3,
      avg_price: 2000,
      min_price: 1800,
      max_price: 2200,
      volume: 8,
    },
    {
      timestamp: "2024-01-02T00:00:00Z",
      quality_tier: 3,
      avg_price: 2100,
      min_price: 1900,
      max_price: 2300,
      volume: 9,
    },
    {
      timestamp: "2024-01-01T00:00:00Z",
      quality_tier: 5,
      avg_price: 5000,
      min_price: 4500,
      max_price: 5500,
      volume: 5,
    },
    {
      timestamp: "2024-01-02T00:00:00Z",
      quality_tier: 5,
      avg_price: 5200,
      min_price: 4700,
      max_price: 5700,
      volume: 6,
    },
  ],
  game_item_id: "test-item-id",
  start_date: "2024-01-01T00:00:00Z",
  end_date: "2024-01-02T00:00:00Z",
}

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

// Helper to create test store with mocked API
function createTestStore(mockData: any, isLoading = false, isError = false) {
  const store = configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
  })

  // Mock the API query
  vi.spyOn(marketV2Api, "useGetPriceHistoryQuery").mockReturnValue({
    data: mockData,
    isLoading,
    isError,
    isSuccess: !isLoading && !isError,
    isFetching: isLoading,
    refetch: vi.fn(),
  } as any)

  return store
}

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement, store: any) => {
  const theme = createExtendedTheme()
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </Provider>
  )
}

describe("PriceHistoryChartV2", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state", () => {
    const store = createTestStore(null, true, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    expect(screen.getByText("Loading price history...")).toBeInTheDocument()
  })

  it("renders error state", () => {
    const store = createTestStore(null, false, true)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    expect(screen.getByText("Error loading price history")).toBeInTheDocument()
  })

  it("renders empty state when no data", () => {
    const store = createTestStore({ data: [] }, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    expect(screen.getByText("No price history available")).toBeInTheDocument()
  })

  it("renders chart with multiple quality tier series", () => {
    const store = createTestStore(mockPriceHistoryData, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Check chart is rendered
    expect(screen.getByTestId("mui-line-chart")).toBeInTheDocument()

    // Check chart configuration
    expect(screen.getByTestId("chart-height")).toHaveTextContent("400")
    expect(screen.getByTestId("chart-width")).toHaveTextContent("100%")
    expect(screen.getByTestId("chart-xaxis-type")).toHaveTextContent("time")

    // Check series count (3 tiers: 1, 3, 5)
    expect(screen.getByTestId("chart-series-count")).toHaveTextContent("3")

    // Check series names
    expect(screen.getByTestId("series-0-name")).toHaveTextContent("Tier 1")
    expect(screen.getByTestId("series-1-name")).toHaveTextContent("Tier 3")
    expect(screen.getByTestId("series-2-name")).toHaveTextContent("Tier 5")

    // Check data point counts (2 per tier)
    expect(screen.getByTestId("series-0-data-count")).toHaveTextContent("2")
    expect(screen.getByTestId("series-1-data-count")).toHaveTextContent("2")
    expect(screen.getByTestId("series-2-data-count")).toHaveTextContent("2")
  })

  it("renders quality tier filter dropdown", () => {
    const store = createTestStore(mockPriceHistoryData, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Check filter label
    expect(screen.getByLabelText("Quality Tier")).toBeInTheDocument()
  })

  it("filters by quality tier when dropdown changes", async () => {
    const store = createTestStore(mockPriceHistoryData, false, false)
    const user = userEvent.setup()

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Open dropdown
    const select = screen.getByLabelText("Quality Tier")
    await user.click(select)

    // Select Tier 3
    const tier3Option = screen.getByRole("option", { name: "Tier 3" })
    await user.click(tier3Option)

    // Verify API was called with quality_tier filter
    await waitFor(() => {
      expect(marketV2Api.useGetPriceHistoryQuery).toHaveBeenCalledWith({
        gameItemId: "test-item-id",
        qualityTier: 3,
        interval: "day",
      })
    })
  })

  it("shows all tiers when 'All Tiers' is selected", async () => {
    const store = createTestStore(mockPriceHistoryData, false, false)
    const user = userEvent.setup()

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Open dropdown
    const select = screen.getByLabelText("Quality Tier")
    await user.click(select)

    // Select All Tiers
    const allTiersOption = screen.getByRole("option", { name: "All Tiers" })
    await user.click(allTiersOption)

    // Verify API was called without quality_tier filter
    await waitFor(() => {
      expect(marketV2Api.useGetPriceHistoryQuery).toHaveBeenCalledWith({
        gameItemId: "test-item-id",
        qualityTier: undefined,
        interval: "day",
      })
    })
  })

  it("accepts custom height prop", () => {
    const store = createTestStore(mockPriceHistoryData, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" height={600} />,
      store
    )

    expect(screen.getByTestId("chart-height")).toHaveTextContent("600")
  })

  it("accepts custom width prop", () => {
    const store = createTestStore(mockPriceHistoryData, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" width="80%" />,
      store
    )

    expect(screen.getByTestId("chart-width")).toHaveTextContent("80%")
  })

  it("groups data by quality tier correctly", () => {
    const store = createTestStore(mockPriceHistoryData, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Verify each tier has correct number of data points
    expect(screen.getByTestId("series-0-data-count")).toHaveTextContent("2") // Tier 1
    expect(screen.getByTestId("series-1-data-count")).toHaveTextContent("2") // Tier 3
    expect(screen.getByTestId("series-2-data-count")).toHaveTextContent("2") // Tier 5
  })

  it("handles data with null quality tier", () => {
    const dataWithNullTier = {
      data: [
        {
          timestamp: "2024-01-01T00:00:00Z",
          quality_tier: null,
          avg_price: 1500,
          min_price: 1400,
          max_price: 1600,
          volume: 15,
        },
        {
          timestamp: "2024-01-02T00:00:00Z",
          quality_tier: null,
          avg_price: 1550,
          min_price: 1450,
          max_price: 1650,
          volume: 16,
        },
      ],
      game_item_id: "test-item-id",
      start_date: "2024-01-01T00:00:00Z",
      end_date: "2024-01-02T00:00:00Z",
    }

    const store = createTestStore(dataWithNullTier, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Should show "All Tiers" for null quality tier
    expect(screen.getByTestId("series-0-name")).toHaveTextContent("All Tiers")
    expect(screen.getByTestId("series-0-data-count")).toHaveTextContent("2")
  })

  it("sorts tiers in ascending order (null first, then 1-5)", () => {
    const mixedTierData = {
      data: [
        {
          timestamp: "2024-01-01T00:00:00Z",
          quality_tier: 5,
          avg_price: 5000,
          min_price: 4500,
          max_price: 5500,
          volume: 5,
        },
        {
          timestamp: "2024-01-01T00:00:00Z",
          quality_tier: 1,
          avg_price: 1000,
          min_price: 900,
          max_price: 1100,
          volume: 10,
        },
        {
          timestamp: "2024-01-01T00:00:00Z",
          quality_tier: null,
          avg_price: 2500,
          min_price: 2000,
          max_price: 3000,
          volume: 20,
        },
        {
          timestamp: "2024-01-01T00:00:00Z",
          quality_tier: 3,
          avg_price: 3000,
          min_price: 2700,
          max_price: 3300,
          volume: 8,
        },
      ],
      game_item_id: "test-item-id",
      start_date: "2024-01-01T00:00:00Z",
      end_date: "2024-01-01T00:00:00Z",
    }

    const store = createTestStore(mixedTierData, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Verify sort order: null (All Tiers), then 1, 3, 5
    expect(screen.getByTestId("series-0-name")).toHaveTextContent("All Tiers")
    expect(screen.getByTestId("series-1-name")).toHaveTextContent("Tier 1")
    expect(screen.getByTestId("series-2-name")).toHaveTextContent("Tier 3")
    expect(screen.getByTestId("series-3-name")).toHaveTextContent("Tier 5")
  })

  it("uses ExtendedTheme for styling", () => {
    const store = createTestStore(mockPriceHistoryData, false, false)

    const { container } = renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Verify MUI theme components are used (Stack, Box, FormControl, etc.)
    expect(container.querySelector(".MuiStack-root")).toBeInTheDocument()
    expect(container.querySelector(".MuiBox-root")).toBeInTheDocument()
    expect(container.querySelector(".MuiFormControl-root")).toBeInTheDocument()
  })

  it("maintains visual parity with V1 (400px height, 100% width, time axis)", () => {
    const store = createTestStore(mockPriceHistoryData, false, false)

    renderWithProviders(
      <PriceHistoryChartV2 gameItemId="test-item-id" />,
      store
    )

    // Verify default chart configuration matches V1
    expect(screen.getByTestId("chart-height")).toHaveTextContent("400")
    expect(screen.getByTestId("chart-width")).toHaveTextContent("100%")
    expect(screen.getByTestId("chart-xaxis-type")).toHaveTextContent("time")
  })
})
