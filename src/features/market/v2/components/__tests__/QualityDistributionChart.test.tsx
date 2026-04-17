import "./setup";
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { QualityDistributionChart } from "../QualityDistributionChart"
import { marketV2Api } from "../../../../../store/api/v2/market"
import type { GetQualityDistributionResponse } from "../../../../../store/api/v2/market"

// Mock the MUI X-Charts BarChart component
vi.mock("@mui/x-charts/BarChart", () => ({
  BarChart: vi.fn(({ xAxis, yAxis, series, height, onAxisClick }) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-height">{height}</div>
      <svg height={height}>
        <text data-testid="y-axis-label">{yAxis?.[0]?.label}</text>
        {xAxis?.[0]?.data?.map((label: string, idx: number) => (
          <text key={idx} data-testid={`x-axis-label-${idx}`}>
            {label}
          </text>
        ))}
        {series?.[0]?.data?.map((value: number, idx: number) => (
          <rect
            key={idx}
            data-testid={`bar-${idx}`}
            data-value={value}
            onClick={() => onAxisClick?.(null, { axisValue: xAxis?.[0]?.data?.[idx] })}
          />
        ))}
      </svg>
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
        if (key === "market.tierBronze") return "Bronze"
        if (key === "market.tierSilver") return "Silver"
        if (key === "market.tierGold") return "Gold"
        if (key === "market.tierPlatinum") return "Platinum"
        if (key === "market.tierDiamond") return "Diamond"
        if (key === "market.quantityAvailable") return "Quantity Available"
        if (key === "market.quantity") return "Quantity"
        if (key === "market.loadingQualityDistribution")
          return "Loading quality distribution..."
        if (key === "market.errorLoadingQualityDistribution")
          return "Error loading quality distribution"
        if (key === "market.noQualityDistribution")
          return "No quality distribution data available"
        return defaultValue || key
      },
    }),
  }
})

describe("QualityDistributionChart", () => {
  const mockGameItemId = "test-game-item-id"

  const mockDistributionData: GetQualityDistributionResponse = {
    game_item_id: mockGameItemId,
    game_item_name: "Test Item",
    distribution: [
      {
        quality_tier: 1,
        quantity_available: 50,
        listing_count: 5,
        avg_price: 1000,
        min_price: 800,
        max_price: 1200,
        seller_count: 3,
      },
      {
        quality_tier: 2,
        quantity_available: 75,
        listing_count: 8,
        avg_price: 1500,
        min_price: 1300,
        max_price: 1700,
        seller_count: 5,
      },
      {
        quality_tier: 3,
        quantity_available: 100,
        listing_count: 10,
        avg_price: 2000,
        min_price: 1800,
        max_price: 2200,
        seller_count: 7,
      },
      {
        quality_tier: 4,
        quantity_available: 60,
        listing_count: 6,
        avg_price: 2500,
        min_price: 2300,
        max_price: 2700,
        seller_count: 4,
      },
      {
        quality_tier: 5,
        quantity_available: 30,
        listing_count: 3,
        avg_price: 3000,
        min_price: 2800,
        max_price: 3200,
        seller_count: 2,
      },
    ],
    total_quantity: 315,
  }

  // Helper to render component with theme and store
  const renderWithProviders = (ui: React.ReactElement) => {
    const store = configureStore({
      reducer: {
        [marketV2Api.reducerPath]: marketV2Api.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(marketV2Api.middleware),
    })

    const theme = createTheme()

    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>{ui}</ThemeProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    expect(screen.getByText(/loading quality distribution/i)).toBeInTheDocument()
  })

  it("renders error state", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    expect(
      screen.getByText(/error loading quality distribution/i)
    ).toBeInTheDocument()
  })

  it("renders empty state when no data", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: {
        game_item_id: mockGameItemId,
        game_item_name: "Test Item",
        distribution: [],
        total_quantity: 0,
      },
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    expect(
      screen.getByText(/no quality distribution data available/i)
    ).toBeInTheDocument()
  })

  it("renders empty state when all quantities are zero", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: {
        game_item_id: mockGameItemId,
        game_item_name: "Test Item",
        distribution: [
          {
            quality_tier: 1,
            quantity_available: 0,
            listing_count: 0,
            avg_price: 0,
            min_price: 0,
            max_price: 0,
            seller_count: 0,
          },
        ],
        total_quantity: 0,
      },
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    expect(
      screen.getByText(/no quality distribution data available/i)
    ).toBeInTheDocument()
  })

  it("renders bar chart with quality distribution data", async () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    // Wait for chart to render
    await waitFor(() => {
      // Check that tier labels are present (Bronze, Silver, Gold, Platinum, Diamond)
      expect(screen.getByText(/bronze/i)).toBeInTheDocument()
      expect(screen.getByText(/silver/i)).toBeInTheDocument()
      expect(screen.getByText(/gold/i)).toBeInTheDocument()
      expect(screen.getByText(/platinum/i)).toBeInTheDocument()
      expect(screen.getByText(/diamond/i)).toBeInTheDocument()
    })
  })

  it("fills missing tiers with zero quantity", async () => {
    const partialData: GetQualityDistributionResponse = {
      game_item_id: mockGameItemId,
      game_item_name: "Test Item",
      distribution: [
        {
          quality_tier: 1,
          quantity_available: 50,
          listing_count: 5,
          avg_price: 1000,
          min_price: 800,
          max_price: 1200,
          seller_count: 3,
        },
        {
          quality_tier: 5,
          quantity_available: 30,
          listing_count: 3,
          avg_price: 3000,
          min_price: 2800,
          max_price: 3200,
          seller_count: 2,
        },
      ],
      total_quantity: 80,
    }

    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: partialData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    // All 5 tiers should be displayed even if some have 0 quantity
    await waitFor(() => {
      expect(screen.getByText(/bronze/i)).toBeInTheDocument()
      expect(screen.getByText(/silver/i)).toBeInTheDocument()
      expect(screen.getByText(/gold/i)).toBeInTheDocument()
      expect(screen.getByText(/platinum/i)).toBeInTheDocument()
      expect(screen.getByText(/diamond/i)).toBeInTheDocument()
    })
  })

  it("calls onTierClick when a bar is clicked", async () => {
    const mockOnTierClick = vi.fn()

    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(
      <QualityDistributionChart
        gameItemId={mockGameItemId}
        onTierClick={mockOnTierClick}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/bronze/i)).toBeInTheDocument()
    })

    // Simulate clicking on the first bar (Bronze/Tier 1)
    const firstBar = screen.getByTestId("bar-0")
    await userEvent.click(firstBar)

    expect(mockOnTierClick).toHaveBeenCalledWith(1)
  })

  it("respects custom height prop", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(
      <QualityDistributionChart gameItemId={mockGameItemId} height={300} />
    )

    // Check that height is passed to chart
    expect(screen.getByTestId("chart-height")).toHaveTextContent("300")
  })

  it("respects custom width prop", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    const { container } = renderWithProviders(
      <QualityDistributionChart gameItemId={mockGameItemId} width={600} />
    )

    // Check that the container has the correct width
    const chartContainer = container.querySelector("div")
    expect(chartContainer).toHaveStyle({ width: "600px" })
  })

  it("uses default height of 400px when not specified", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    expect(screen.getByTestId("chart-height")).toHaveTextContent("400")
  })

  it("uses default width of 100% when not specified", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    const { container } = renderWithProviders(
      <QualityDistributionChart gameItemId={mockGameItemId} />
    )

    const chartContainer = container.querySelector("div")
    expect(chartContainer).toHaveStyle({ width: "100%" })
  })

  it("passes correct gameItemId to API query", () => {
    const customGameItemId = "custom-game-item-id"
    const spy = vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={customGameItemId} />)

    expect(spy).toHaveBeenCalledWith({
      gameItemId: customGameItemId,
    })
  })

  it("displays quantity available on Y-axis", async () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    await waitFor(() => {
      // Check for Y-axis label
      expect(screen.getByText(/quantity available/i)).toBeInTheDocument()
    })
  })

  it("maintains visual consistency with V1 charts (400px height)", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    renderWithProviders(<QualityDistributionChart gameItemId={mockGameItemId} />)

    // V1 charts use 400px height by default
    expect(screen.getByTestId("chart-height")).toHaveTextContent("400")
  })

  it("is responsive for mobile (renders without errors)", () => {
    vi.spyOn(marketV2Api, "useGetQualityDistributionQuery").mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
    } as any)

    // Render component
    const { container } = renderWithProviders(
      <QualityDistributionChart gameItemId={mockGameItemId} />
    )

    // Chart should render without errors
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument()
  })
})
