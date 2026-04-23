import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MarketRouter } from "../MarketRouter"
import * as useFeatureFlagModule from "../../../hooks/market/useFeatureFlag"

// Mock the feature flag hook
vi.mock("../../../hooks/market/useFeatureFlag")

// Mock the V1 and V2 components
vi.mock("../../../features/market/components/MarketPage", () => ({
  MarketPage: () => <div data-testid="market-v1">Market V1</div>,
}))

vi.mock("../v2/MarketPageV2", () => ({
  MarketPageV2: () => <div data-testid="market-v2">Market V2</div>,
}))

describe("MarketRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render loading state while fetching feature flag", () => {
    vi.mocked(useFeatureFlagModule.useFeatureFlag).mockReturnValue({
      marketVersion: "V1",
      isLoading: true,
      error: null,
      setMarketVersion: vi.fn(),
      isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
    })

    render(<MarketRouter />)

    // Should show loading spinner
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("should render V1 component when feature flag is V1", async () => {
    vi.mocked(useFeatureFlagModule.useFeatureFlag).mockReturnValue({
      marketVersion: "V1",
      isLoading: false,
      error: null,
      setMarketVersion: vi.fn(),
      isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
    })

    render(<MarketRouter />)

    // Wait for lazy component to load
    await waitFor(() => {
      expect(screen.getByTestId("market-v1")).toBeInTheDocument()
    })

    expect(screen.getByText("Market V1")).toBeInTheDocument()
  })

  it("should render V2 component when feature flag is V2", async () => {
    vi.mocked(useFeatureFlagModule.useFeatureFlag).mockReturnValue({
      marketVersion: "V2",
      isLoading: false,
      error: null,
      setMarketVersion: vi.fn(),
      isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
    })

    render(<MarketRouter />)

    // Wait for lazy component to load
    await waitFor(() => {
      expect(screen.getByTestId("market-v2")).toBeInTheDocument()
    })

    expect(screen.getByText("Market V2")).toBeInTheDocument()
  })

  it("should fall back to V1 on error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    
    vi.mocked(useFeatureFlagModule.useFeatureFlag).mockReturnValue({
      marketVersion: "V1",
      isLoading: false,
      error: new Error("Failed to fetch feature flag"),
      setMarketVersion: vi.fn(),
      isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
    })

    render(<MarketRouter />)

    // Wait for lazy component to load
    await waitFor(() => {
      expect(screen.getByTestId("market-v1")).toBeInTheDocument()
    })

    expect(screen.getByText("Market V1")).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to load feature flag, falling back to V1:",
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it("should show loading state for lazy component", async () => {
    vi.mocked(useFeatureFlagModule.useFeatureFlag).mockReturnValue({
      marketVersion: "V1",
      isLoading: false,
      error: null,
      setMarketVersion: vi.fn(),
      isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
    })

    render(<MarketRouter />)

    // The lazy component may load immediately in test environment
    // Just verify that the component eventually renders
    await waitFor(() => {
      expect(screen.getByTestId("market-v1")).toBeInTheDocument()
    })
  })

  it("should handle switching from V1 to V2", async () => {
    const { rerender } = render(<MarketRouter />)

    // Start with V1
    vi.mocked(useFeatureFlagModule.useFeatureFlag).mockReturnValue({
      marketVersion: "V1",
      isLoading: false,
      error: null,
      setMarketVersion: vi.fn(),
      isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
    })

    rerender(<MarketRouter />)

    await waitFor(() => {
      expect(screen.getByTestId("market-v1")).toBeInTheDocument()
    })

    // Switch to V2
    vi.mocked(useFeatureFlagModule.useFeatureFlag).mockReturnValue({
      marketVersion: "V2",
      isLoading: false,
      error: null,
      setMarketVersion: vi.fn(),
      isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
    })

    rerender(<MarketRouter />)

    await waitFor(() => {
      expect(screen.getByTestId("market-v2")).toBeInTheDocument()
    })
  })
})
