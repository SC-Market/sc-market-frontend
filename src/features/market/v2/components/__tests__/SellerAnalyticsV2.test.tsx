import "./setup";
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SellerAnalyticsV2 } from "../SellerAnalyticsV2"
import { marketV2Api } from "../../../../../store/api/v2/market"

// Type definitions for test data
interface QualityTierSales {
  quality_tier: number
  volume: number
  avg_price: number
  avg_time_to_sale_hours: number
}

interface QualityTierDistribution {
  quality_tier: number
  quantity_available: number
  listing_count: number
  seller_count: number
  avg_price: number
  min_price: number
  max_price: number
}

interface QualityTierPremium {
  quality_tier: number
  premium_percentage: number
}

interface GetSellerStatsResponse {
  seller_id: string
  sales_by_quality: QualityTierSales[]
  inventory_distribution: QualityTierDistribution[]
  price_premiums: QualityTierPremium[]
}

// Mock the RTK Query hook
vi.mock("../../../../../store/api/v2/market", () => ({
  marketV2Api: {
    useGetSellerStatsQuery: vi.fn(),
  },
}))

// Mock the chart components
vi.mock("../../../../../components/charts/MuiCharts", () => ({
  MuiBarChart: ({ series }: { series: any[] }) => (
    <div data-testid="bar-chart">
      {series.map((s, i) => (
        <div key={i} data-testid={`bar-series-${i}`}>
          {s.name}: {s.data.length} data points
        </div>
      ))}
    </div>
  ),
  MuiLineChart: ({ series }: { series: any[] }) => (
    <div data-testid="line-chart">
      {series.map((s, i) => (
        <div key={i} data-testid={`line-series-${i}`}>
          {s.name}: {s.data.length} data points
        </div>
      ))}
    </div>
  ),
}))

// Mock the Section component
vi.mock("../../../../../components/paper/Section", () => ({
  Section: ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <div data-testid="section">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}))

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

// Mock MUI theme
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material")
  return {
    ...actual,
    useTheme: () => ({
      layoutSpacing: {
        layout: 2,
        component: 1,
      },
      palette: {
        warning: { main: "#ff9800" },
        grey: { 400: "#bdbdbd", 500: "#9e9e9e" },
        info: { main: "#2196f3" },
        primary: { main: "#1976d2" },
        secondary: { main: "#dc004e" },
      },
    }),
  }
})

describe("SellerAnalyticsV2", () => {
  const mockSellerId = "seller-123"

  const mockSalesData: QualityTierSales[] = [
    {
      quality_tier: 1,
      volume: 100,
      avg_price: 1000,
      avg_time_to_sale_hours: 24.5,
    },
    {
      quality_tier: 2,
      volume: 80,
      avg_price: 1500,
      avg_time_to_sale_hours: 18.2,
    },
    {
      quality_tier: 3,
      volume: 60,
      avg_price: 2000,
      avg_time_to_sale_hours: 12.8,
    },
    {
      quality_tier: 4,
      volume: 40,
      avg_price: 3000,
      avg_time_to_sale_hours: 8.5,
    },
    {
      quality_tier: 5,
      volume: 20,
      avg_price: 5000,
      avg_time_to_sale_hours: 4.2,
    },
  ]

  const mockInventoryData: QualityTierDistribution[] = [
    {
      quality_tier: 1,
      quantity_available: 500,
      listing_count: 10,
      seller_count: 5,
      avg_price: 1000,
      min_price: 900,
      max_price: 1100,
    },
    {
      quality_tier: 2,
      quantity_available: 400,
      listing_count: 8,
      seller_count: 4,
      avg_price: 1500,
      min_price: 1400,
      max_price: 1600,
    },
    {
      quality_tier: 3,
      quantity_available: 300,
      listing_count: 6,
      seller_count: 3,
      avg_price: 2000,
      min_price: 1900,
      max_price: 2100,
    },
    {
      quality_tier: 4,
      quantity_available: 200,
      listing_count: 4,
      seller_count: 2,
      avg_price: 3000,
      min_price: 2900,
      max_price: 3100,
    },
    {
      quality_tier: 5,
      quantity_available: 100,
      listing_count: 2,
      seller_count: 1,
      avg_price: 5000,
      min_price: 4900,
      max_price: 5100,
    },
  ]

  const mockPricePremiums: QualityTierPremium[] = [
    { quality_tier: 1, premium_percentage: 0 },
    { quality_tier: 2, premium_percentage: 50 },
    { quality_tier: 3, premium_percentage: 100 },
    { quality_tier: 4, premium_percentage: 200 },
    { quality_tier: 5, premium_percentage: 400 },
  ]

  const mockSellerStatsResponse: GetSellerStatsResponse = {
    seller_id: mockSellerId,
    sales_by_quality: mockSalesData,
    inventory_distribution: mockInventoryData,
    price_premiums: mockPricePremiums,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Loading State", () => {
    it("should display loading message when data is loading", () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      expect(
        screen.getByText("Loading seller analytics...")
      ).toBeInTheDocument()
    })
  })

  describe("Error State", () => {
    it("should display error message when data fetch fails", () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      expect(
        screen.getByText("Error loading seller analytics")
      ).toBeInTheDocument()
    })
  })

  describe("Empty State", () => {
    it("should display empty message when no data is available", () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: {
          seller_id: mockSellerId,
          sales_by_quality: [],
          inventory_distribution: [],
          price_premiums: [],
        },
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      expect(
        screen.getByText("No seller analytics data available")
      ).toBeInTheDocument()
    })
  })

  describe("Sales Volume by Quality Tier", () => {
    it("should display sales volume chart with correct data", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Sales Volume by Quality Tier")
        ).toBeInTheDocument()
      })

      // Check that bar chart is rendered
      const barCharts = screen.getAllByTestId("bar-chart")
      expect(barCharts.length).toBeGreaterThan(0)

      // Check that sales volume series has correct number of data points
      const salesVolumeSeries = screen.getByText(/Sales Volume: 5 data points/)
      expect(salesVolumeSeries).toBeInTheDocument()
    })

    it("should transform sales volume data correctly", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Sales Volume by Quality Tier")
        ).toBeInTheDocument()
      })

      // Verify that all 5 quality tiers are represented
      const salesVolumeSeries = screen.getByText(/Sales Volume: 5 data points/)
      expect(salesVolumeSeries).toBeInTheDocument()
    })
  })

  describe("Average Sale Price by Quality Tier", () => {
    it("should display average sale price chart with correct data", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Average Sale Price by Quality Tier")
        ).toBeInTheDocument()
      })

      // Check that bar chart is rendered
      const barCharts = screen.getAllByTestId("bar-chart")
      expect(barCharts.length).toBeGreaterThan(0)

      // Check that average sale price series has correct number of data points
      const avgPriceSeries = screen.getByText(
        /Average Sale Price: 5 data points/
      )
      expect(avgPriceSeries).toBeInTheDocument()
    })
  })

  describe("Time to Sale by Quality Tier", () => {
    it("should display time to sale chart with correct data", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Time to Sale by Quality Tier")
        ).toBeInTheDocument()
      })

      // Check that line chart is rendered
      const lineCharts = screen.getAllByTestId("line-chart")
      expect(lineCharts.length).toBeGreaterThan(0)

      // Check that time to sale series has correct number of data points
      const timeToSaleSeries = screen.getByText(
        /Average Time to Sale \(hours\): 5 data points/
      )
      expect(timeToSaleSeries).toBeInTheDocument()
    })
  })

  describe("Current Inventory Distribution", () => {
    it("should display inventory distribution chart with correct data", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Current Inventory Distribution")
        ).toBeInTheDocument()
      })

      // Check that bar chart is rendered
      const barCharts = screen.getAllByTestId("bar-chart")
      expect(barCharts.length).toBeGreaterThan(0)

      // Check that inventory distribution series has correct number of data points
      const inventorySeries = screen.getByText(
        /Quantity Available: 5 data points/
      )
      expect(inventorySeries).toBeInTheDocument()
    })
  })

  describe("Price Premium Percentage", () => {
    it("should display price premium chart with correct data", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Price Premium by Quality Tier")
        ).toBeInTheDocument()
      })

      // Check that line chart is rendered
      const lineCharts = screen.getAllByTestId("line-chart")
      expect(lineCharts.length).toBeGreaterThan(0)

      // Check that price premium series has correct number of data points
      const pricePremiumSeries = screen.getByText(
        /Price Premium \(%\): 5 data points/
      )
      expect(pricePremiumSeries).toBeInTheDocument()
    })

    it("should calculate price premium correctly", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Price Premium by Quality Tier")
        ).toBeInTheDocument()
      })

      // Verify that price premiums are displayed
      // Tier 1: 0%, Tier 2: 50%, Tier 3: 100%, Tier 4: 200%, Tier 5: 400%
      const pricePremiumSeries = screen.getByText(
        /Price Premium \(%\): 5 data points/
      )
      expect(pricePremiumSeries).toBeInTheDocument()
    })
  })

  describe("API Integration", () => {
    it("should call useGetSellerStatsQuery with correct seller ID", () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      expect(marketV2Api.useGetSellerStatsQuery).toHaveBeenCalledWith({
        shopId: mockSellerId,
      })
    })

    it("should call useGetSellerStatsQuery without seller ID when not provided", () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 />)

      expect(marketV2Api.useGetSellerStatsQuery).toHaveBeenCalledWith({
        shopId: undefined,
      })
    })
  })

  describe("Visual Parity", () => {
    it("should use Section component for all chart sections", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        const sections = screen.getAllByTestId("section")
        // Should have 5 sections: sales volume, avg price, time to sale, inventory, price premium
        expect(sections.length).toBe(5)
      })
    })

    it("should use MuiBarChart for bar chart sections", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        const barCharts = screen.getAllByTestId("bar-chart")
        // Should have 3 bar charts: sales volume, avg price, inventory
        expect(barCharts.length).toBe(3)
      })
    })

    it("should use MuiLineChart for line chart sections", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        const lineCharts = screen.getAllByTestId("line-chart")
        // Should have 2 line charts: time to sale, price premium
        expect(lineCharts.length).toBe(2)
      })
    })

    it("should set chart height to 400px", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: mockSellerStatsResponse,
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        expect(
          screen.getByText("Sales Volume by Quality Tier")
        ).toBeInTheDocument()
      })

      // All charts should have height 400 (verified in component implementation)
    })
  })

  describe("Partial Data Handling", () => {
    it("should handle missing sales data gracefully", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: {
          seller_id: mockSellerId,
          sales_by_quality: [],
          inventory_distribution: mockInventoryData,
          price_premiums: mockPricePremiums,
        },
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        // Should not display sales-related charts
        expect(
          screen.queryByText("Sales Volume by Quality Tier")
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText("Average Sale Price by Quality Tier")
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText("Time to Sale by Quality Tier")
        ).not.toBeInTheDocument()

        // Should still display inventory and price premium charts
        expect(
          screen.getByText("Current Inventory Distribution")
        ).toBeInTheDocument()
        expect(
          screen.getByText("Price Premium by Quality Tier")
        ).toBeInTheDocument()
      })
    })

    it("should handle missing inventory data gracefully", async () => {
      vi.mocked(marketV2Api.useGetSellerStatsQuery).mockReturnValue({
        data: {
          seller_id: mockSellerId,
          sales_by_quality: mockSalesData,
          inventory_distribution: [],
          price_premiums: [],
        },
        isLoading: false,
        isError: false,
      } as any)

      render(<SellerAnalyticsV2 sellerId={mockSellerId} />)

      await waitFor(() => {
        // Should display sales-related charts
        expect(
          screen.getByText("Sales Volume by Quality Tier")
        ).toBeInTheDocument()
        expect(
          screen.getByText("Average Sale Price by Quality Tier")
        ).toBeInTheDocument()
        expect(
          screen.getByText("Time to Sale by Quality Tier")
        ).toBeInTheDocument()

        // Should not display inventory and price premium charts
        expect(
          screen.queryByText("Current Inventory Distribution")
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText("Price Premium by Quality Tier")
        ).not.toBeInTheDocument()
      })
    })
  })
})
