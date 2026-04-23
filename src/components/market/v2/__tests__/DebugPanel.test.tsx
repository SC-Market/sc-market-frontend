import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { DebugPanel } from "../DebugPanel"
import * as useFeatureFlagModule from "../../../../hooks/market/useFeatureFlag"
import { ThemeProvider, createTheme } from "@mui/material/styles"

// Mock the useFeatureFlag hook
vi.mock("../../../../hooks/market/useFeatureFlag")

const mockUseFeatureFlag = vi.mocked(useFeatureFlagModule.useFeatureFlag)

// Helper to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme()
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe("DebugPanel", () => {
  const mockSetMarketVersion = vi.fn()

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Visibility for developers only", () => {
    it("should not render when user is not a developer", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: false, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      const { container } = renderWithTheme(<DebugPanel />)
      expect(container.firstChild).toBeNull()
    })

    it("should render when user is a developer", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)
      expect(screen.getByLabelText("Open debug panel")).toBeInTheDocument()
    })

    it("should render toggle button when panel is closed", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)
      const toggleButton = screen.getByLabelText("Open debug panel")
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe("Panel open/close functionality", () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })
    })

    it("should open panel when toggle button is clicked", async () => {
      renderWithTheme(<DebugPanel />)
      
      const toggleButton = screen.getByLabelText("Open debug panel")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText("Debug Panel")).toBeInTheDocument()
      })
    })

    it("should close panel when close button is clicked", async () => {
      renderWithTheme(<DebugPanel />)
      
      // Open panel
      const toggleButton = screen.getByLabelText("Open debug panel")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText("Debug Panel")).toBeInTheDocument()
      })

      // Close panel
      const closeButton = screen.getByLabelText("Close debug panel")
      fireEvent.click(closeButton)

      // Wait for the toggle button to reappear (panel is closed)
      await waitFor(() => {
        expect(screen.getByLabelText("Open debug panel")).toBeInTheDocument()
      })
    })

    it("should persist panel open state to localStorage", async () => {
      renderWithTheme(<DebugPanel />)
      
      const toggleButton = screen.getByLabelText("Open debug panel")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(localStorage.getItem("debug_panel_open")).toBe("true")
      })
    })

    it("should persist panel closed state to localStorage", async () => {
      renderWithTheme(<DebugPanel />)
      
      // Open panel
      const toggleButton = screen.getByLabelText("Open debug panel")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText("Debug Panel")).toBeInTheDocument()
      })

      // Close panel
      const closeButton = screen.getByLabelText("Close debug panel")
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(localStorage.getItem("debug_panel_open")).toBe("false")
      })
    })

    it("should restore panel open state from localStorage on mount", () => {
      localStorage.setItem("debug_panel_open", "true")

      renderWithTheme(<DebugPanel />)

      // Panel should be open
      expect(screen.getByText("Debug Panel")).toBeInTheDocument()
    })
  })

  describe("Version display", () => {
    it("should display current market version V1", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByText("V1")).toBeInTheDocument()
    })

    it("should display current market version V2", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V2",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByText("V2")).toBeInTheDocument()
    })

    it("should show V1 radio button as selected when version is V1", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v1Radio = screen.getByRole("radio", { name: /V1 \(Production\)/i })
      expect(v1Radio).toBeChecked()
    })

    it("should show V2 radio button as selected when version is V2", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V2",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      expect(v2Radio).toBeChecked()
    })
  })

  describe("Version switching functionality", () => {
    beforeEach(() => {
      mockSetMarketVersion.mockResolvedValue(undefined)
    })

    it("should call setMarketVersion when V2 is selected", async () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      fireEvent.click(v2Radio)

      await waitFor(() => {
        expect(mockSetMarketVersion).toHaveBeenCalledWith("V2")
      })
    })

    it("should call setMarketVersion when V1 is selected", async () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V2",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v1Radio = screen.getByRole("radio", { name: /V1 \(Production\)/i })
      fireEvent.click(v1Radio)

      await waitFor(() => {
        expect(mockSetMarketVersion).toHaveBeenCalledWith("V1")
      })
    })

    it("should not call setMarketVersion when same version is selected", async () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v1Radio = screen.getByRole("radio", { name: /V1 \(Production\)/i })
      fireEvent.click(v1Radio)

      await waitFor(() => {
        expect(mockSetMarketVersion).not.toHaveBeenCalled()
      })
    })

    it("should show switching indicator when version is being changed", async () => {
      mockSetMarketVersion.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      fireEvent.click(v2Radio)

      await waitFor(() => {
        expect(screen.getByText(/Switching version/i)).toBeInTheDocument()
      })
    })

    it("should disable radio buttons while switching", async () => {
      mockSetMarketVersion.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      fireEvent.click(v2Radio)

      await waitFor(() => {
        const v1Radio = screen.getByRole("radio", { name: /V1 \(Production\)/i })
        expect(v1Radio).toBeDisabled()
        expect(v2Radio).toBeDisabled()
      })
    })

    it("should handle setMarketVersion errors gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      mockSetMarketVersion.mockRejectedValue(new Error("Network error"))

      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      fireEvent.click(v2Radio)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to switch market version:",
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe("Loading state", () => {
    it("should disable radio buttons when feature flag is loading", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: true,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      const v1Radio = screen.getByRole("radio", { name: /V1 \(Production\)/i })
      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })

      expect(v1Radio).toBeDisabled()
      expect(v2Radio).toBeDisabled()
    })
  })

  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })
    })

    it("should have proper aria-label for toggle button", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByLabelText("Open debug panel")).toBeInTheDocument()
    })

    it("should have proper aria-label for close button", async () => {
      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByLabelText("Close debug panel")).toBeInTheDocument()
    })

    it("should have proper aria-label for radio group", () => {
      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByLabelText("Market version selector")).toBeInTheDocument()
    })
  })

  describe("UI elements", () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })
      localStorage.setItem("debug_panel_open", "true")
    })

    it("should display panel title", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByText("Debug Panel")).toBeInTheDocument()
    })

    it("should display current version section", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByText("Current Market Version")).toBeInTheDocument()
    })

    it("should display switch version section", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByText("Switch Version")).toBeInTheDocument()
    })

    it("should display V1 option with description", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByText("V1 (Production)")).toBeInTheDocument()
      expect(screen.getByText("Current stable market system")).toBeInTheDocument()
    })

    it("should display V2 option with description", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByText("V2 (Beta)")).toBeInTheDocument()
      expect(screen.getByText("New market with variants & quality tiers")).toBeInTheDocument()
    })

    it("should display developer notice", () => {
      renderWithTheme(<DebugPanel />)
      expect(
        screen.getByText(/This panel is only visible to developers/i)
      ).toBeInTheDocument()
    })
  })

  describe("Feature Flag Toggle (Requirement 59.6)", () => {
    beforeEach(() => {
      mockSetMarketVersion.mockResolvedValue(undefined)
      localStorage.setItem("debug_panel_open", "true")
    })

    it("toggles from V1 to V2 successfully", async () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      fireEvent.click(v2Radio)

      await waitFor(() => {
        expect(mockSetMarketVersion).toHaveBeenCalledWith("V2")
        expect(mockSetMarketVersion).toHaveBeenCalledTimes(1)
      })
    })

    it("toggles from V2 to V1 successfully", async () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V2",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)

      const v1Radio = screen.getByRole("radio", { name: /V1 \(Production\)/i })
      fireEvent.click(v1Radio)

      await waitFor(() => {
        expect(mockSetMarketVersion).toHaveBeenCalledWith("V1")
        expect(mockSetMarketVersion).toHaveBeenCalledTimes(1)
      })
    })

    it("persists feature flag selection across page reloads", async () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      fireEvent.click(v2Radio)

      await waitFor(() => {
        expect(mockSetMarketVersion).toHaveBeenCalledWith("V2")
      })

      // Simulate page reload by re-rendering with V2 active
      vi.clearAllMocks()
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V2",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)

      await waitFor(() => {
        const v2RadioAfterReload = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
        expect(v2RadioAfterReload).toBeChecked()
      })
    })

    it("shows visual feedback during version switch", async () => {
      let resolveSwitch: () => void
      const switchPromise = new Promise<void>((resolve) => {
        resolveSwitch = resolve
      })

      mockSetMarketVersion.mockReturnValue(switchPromise)

      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      fireEvent.click(v2Radio)

      // Should show switching indicator
      await waitFor(() => {
        expect(screen.getByText(/Switching version/i)).toBeInTheDocument()
      })

      // Complete the switch
      resolveSwitch!()

      await waitFor(() => {
        expect(screen.queryByText(/Switching version/i)).not.toBeInTheDocument()
      })
    })

    it("prevents multiple simultaneous version switches", async () => {
      let resolveSwitch: () => void
      const switchPromise = new Promise<void>((resolve) => {
        resolveSwitch = resolve
      })

      mockSetMarketVersion.mockReturnValue(switchPromise)

      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      
      // Click multiple times
      fireEvent.click(v2Radio)
      fireEvent.click(v2Radio)
      fireEvent.click(v2Radio)

      await waitFor(() => {
        // Should only call once
        expect(mockSetMarketVersion).toHaveBeenCalledTimes(1)
      })

      resolveSwitch!()
    })

    it("displays current version badge correctly", () => {
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V2",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      const { container } = renderWithTheme(<DebugPanel />)

      // Check for version badge/chip
      const versionBadge = screen.getByText("V2")
      expect(versionBadge).toBeInTheDocument()

      // Should be styled as a chip or badge
      const chip = versionBadge.closest('[class*="MuiChip-root"]')
      expect(chip).toBeInTheDocument()
    })

    it("handles rapid version toggling", async () => {
      mockSetMarketVersion.mockResolvedValue(undefined)

      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V1",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      renderWithTheme(<DebugPanel />)

      const v2Radio = screen.getByRole("radio", { name: /V2 \(Beta\)/i })
      const v1Radio = screen.getByRole("radio", { name: /V1 \(Production\)/i })

      // Rapid toggling
      fireEvent.click(v2Radio)
      await waitFor(() => expect(mockSetMarketVersion).toHaveBeenCalledWith("V2"))

      vi.clearAllMocks()
      mockUseFeatureFlag.mockReturnValue({
        marketVersion: "V2",
        isLoading: false,
        error: null,
        setMarketVersion: mockSetMarketVersion,
        isDeveloper: true, hasOverride: false, flags: { market_v2: false, crafting: false, wiki: false }, overriddenFlags: [] as string[], setFlag: vi.fn(),
      })

      fireEvent.click(v1Radio)
      await waitFor(() => expect(mockSetMarketVersion).toHaveBeenCalledWith("V1"))
    })
  })
})
