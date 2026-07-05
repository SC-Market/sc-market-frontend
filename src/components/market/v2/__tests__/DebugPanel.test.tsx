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
  const mockSetFlag = vi.fn().mockResolvedValue(undefined)

  const defaultMockReturn = {
    marketVersion: "V1" as const,
    isLoading: false,
    error: null,
    setMarketVersion: mockSetMarketVersion,
    isDeveloper: true,
    hasOverride: false,
    flags: { market_v2: false, crafting: false, wiki: false },
    overriddenFlags: [] as string[],
    setFlag: mockSetFlag,
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockUseFeatureFlag.mockReturnValue(defaultMockReturn)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Visibility for developers only", () => {
    it("should not render when user is not a developer and has no override", () => {
      mockUseFeatureFlag.mockReturnValue({
        ...defaultMockReturn,
        isDeveloper: false,
        hasOverride: false,
      })

      const { container } = renderWithTheme(<DebugPanel />)
      expect(container.firstChild).toBeNull()
    })

    it("should render when user is a developer", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByLabelText("Open debug panel")).toBeInTheDocument()
    })

    it("should render when user has override", () => {
      mockUseFeatureFlag.mockReturnValue({
        ...defaultMockReturn,
        isDeveloper: false,
        hasOverride: true,
      })

      renderWithTheme(<DebugPanel />)
      expect(screen.getByLabelText("Open debug panel")).toBeInTheDocument()
    })

    it("should render toggle button when panel is closed", () => {
      renderWithTheme(<DebugPanel />)
      const toggleButton = screen.getByLabelText("Open debug panel")
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe("Panel open/close functionality", () => {
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

  describe("Feature Flags display", () => {
    it("should display Feature Flags section heading", () => {
      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByText("Feature Flags")).toBeInTheDocument()
    })

    it("should display flag toggle switches", () => {
      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      // Should render switches for each flag
      const switches = screen.getAllByRole("checkbox")
      expect(switches.length).toBe(3) // market_v2, crafting, wiki
    })

    it("should display flag labels", () => {
      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByText("market V2")).toBeInTheDocument()
      expect(screen.getByText("crafting")).toBeInTheDocument()
      expect(screen.getByText("wiki")).toBeInTheDocument()
    })

    it("should show Override label for overridden flags", () => {
      mockUseFeatureFlag.mockReturnValue({
        ...defaultMockReturn,
        overriddenFlags: ["market_v2"],
      })

      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByText("Override")).toBeInTheDocument()
    })
  })

  describe("Flag switching functionality", () => {
    beforeEach(() => {
      localStorage.setItem("debug_panel_open", "true")
    })

    it("should call setFlag when a switch is toggled", async () => {
      // Mock window.location.reload
      const reloadSpy = vi.fn()
      Object.defineProperty(window, "location", {
        value: { ...window.location, reload: reloadSpy },
        writable: true,
      })

      renderWithTheme(<DebugPanel />)

      const switches = screen.getAllByRole("checkbox")
      fireEvent.click(switches[0]) // Toggle market_v2

      await waitFor(() => {
        expect(mockSetFlag).toHaveBeenCalledWith("market_v2", true)
      })
    })

    it("should show switching indicator while toggling", async () => {
      mockSetFlag.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      renderWithTheme(<DebugPanel />)

      const switches = screen.getAllByRole("checkbox")
      fireEvent.click(switches[0])

      await waitFor(() => {
        expect(screen.getByText(/Switching version/i)).toBeInTheDocument()
      })
    })

    it("should disable switches while toggling", async () => {
      mockSetFlag.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      renderWithTheme(<DebugPanel />)

      const switches = screen.getAllByRole("checkbox")
      fireEvent.click(switches[0])

      await waitFor(() => {
        switches.forEach((s) => expect(s).toBeDisabled())
      })
    })
  })

  describe("Accessibility", () => {
    it("should have proper aria-label for toggle button", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByLabelText("Open debug panel")).toBeInTheDocument()
    })

    it("should have proper aria-label for close button", () => {
      localStorage.setItem("debug_panel_open", "true")
      renderWithTheme(<DebugPanel />)

      expect(screen.getByLabelText("Close debug panel")).toBeInTheDocument()
    })
  })

  describe("UI elements", () => {
    beforeEach(() => {
      localStorage.setItem("debug_panel_open", "true")
    })

    it("should display panel title", () => {
      renderWithTheme(<DebugPanel />)
      expect(screen.getByText("Debug Panel")).toBeInTheDocument()
    })

    it("should display developer notice", () => {
      renderWithTheme(<DebugPanel />)
      expect(
        screen.getByText(/This panel is only visible to developers/i)
      ).toBeInTheDocument()
    })
  })
})
