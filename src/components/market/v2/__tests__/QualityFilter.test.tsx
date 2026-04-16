/**
 * Unit tests for QualityFilter component
 * 
 * Tests:
 * - Min/max selection
 * - onChange event emission
 * - Validation (min <= max)
 * 
 * Sub-task 15.3
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QualityFilter } from "../QualityFilter"
import "@testing-library/jest-dom"
import { vi } from "vitest"

describe("QualityFilter", () => {
  const mockOnMinChange = vi.fn()
  const mockOnMaxChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Component Rendering", () => {
    it("should render min and max tier dropdowns", () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      // Use role="combobox" to find the Select components
      const selects = screen.getAllByRole("combobox")
      expect(selects).toHaveLength(2)
    })

    it("should render with custom label", () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
          label="Quality Range"
        />,
      )

      expect(screen.getByText("Quality Range")).toBeInTheDocument()
    })

    it("should render without label when not provided", () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      // Should not have any h6 heading (subtitle2)
      const headings = screen.queryAllByRole("heading")
      expect(headings).toHaveLength(0)
    })

    it("should display separator text between dropdowns", () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      expect(screen.getByText(/to/i)).toBeInTheDocument()
    })
  })

  describe("Min Tier Selection", () => {
    it("should allow selecting min tier", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      const tier3Option = await screen.findByText("Tier 3")
      fireEvent.click(tier3Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(3)
      })
    })

    it("should display all tier options (1-5) in min dropdown", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      await waitFor(() => {
        expect(screen.getByText("Tier 1")).toBeInTheDocument()
        expect(screen.getByText("Tier 2")).toBeInTheDocument()
        expect(screen.getByText("Tier 3")).toBeInTheDocument()
        expect(screen.getByText("Tier 4")).toBeInTheDocument()
        expect(screen.getByText("Tier 5")).toBeInTheDocument()
      })
    })

    it("should display 'Any' option in min dropdown", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      await waitFor(() => {
        expect(screen.getByText("Any")).toBeInTheDocument()
      })
    })

    it("should call onMinChange with empty string when 'Any' selected", async () => {
      render(
        <QualityFilter
          minTier={3}
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      const anyOption = await screen.findByText("Any")
      fireEvent.click(anyOption)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith("")
      })
    })

    it("should display selected min tier value", () => {
      render(
        <QualityFilter
          minTier={2}
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      expect(minSelect).toHaveTextContent("Tier 2")
    })
  })

  describe("Max Tier Selection", () => {
    it("should allow selecting max tier", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const maxSelect = selects[1]
      fireEvent.mouseDown(maxSelect)

      const tier5Option = await screen.findByText("Tier 5")
      fireEvent.click(tier5Option)

      await waitFor(() => {
        expect(mockOnMaxChange).toHaveBeenCalledWith(5)
      })
    })

    it("should display all tier options (1-5) in max dropdown", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const maxSelect = selects[1]
      fireEvent.mouseDown(maxSelect)

      await waitFor(() => {
        expect(screen.getByText("Tier 1")).toBeInTheDocument()
        expect(screen.getByText("Tier 2")).toBeInTheDocument()
        expect(screen.getByText("Tier 3")).toBeInTheDocument()
        expect(screen.getByText("Tier 4")).toBeInTheDocument()
        expect(screen.getByText("Tier 5")).toBeInTheDocument()
      })
    })

    it("should display 'Any' option in max dropdown", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const maxSelect = selects[1]
      fireEvent.mouseDown(maxSelect)

      await waitFor(() => {
        expect(screen.getByText("Any")).toBeInTheDocument()
      })
    })

    it("should call onMaxChange with empty string when 'Any' selected", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier={4}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const maxSelect = selects[1]
      fireEvent.mouseDown(maxSelect)

      const anyOption = await screen.findByText("Any")
      fireEvent.click(anyOption)

      await waitFor(() => {
        expect(mockOnMaxChange).toHaveBeenCalledWith("")
      })
    })

    it("should display selected max tier value", () => {
      render(
        <QualityFilter
          minTier=""
          maxTier={4}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const maxSelect = selects[1]
      expect(maxSelect).toHaveTextContent("Tier 4")
    })
  })

  describe("Validation (min <= max)", () => {
    it("should auto-adjust max when min is set higher than max", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier={2}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      const tier4Option = await screen.findByText("Tier 4")
      fireEvent.click(tier4Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(4)
        expect(mockOnMaxChange).toHaveBeenCalledWith(4)
      })
    })

    it("should auto-adjust min when max is set lower than min", async () => {
      render(
        <QualityFilter
          minTier={4}
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const maxSelect = selects[1]
      fireEvent.mouseDown(maxSelect)

      const tier2Option = await screen.findByText("Tier 2")
      fireEvent.click(tier2Option)

      await waitFor(() => {
        expect(mockOnMaxChange).toHaveBeenCalledWith(2)
        expect(mockOnMinChange).toHaveBeenCalledWith(2)
      })
    })

    it("should not adjust when min equals max", async () => {
      render(
        <QualityFilter
          minTier={3}
          maxTier={3}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      // Select a different value (Tier 2) to test that max doesn't adjust when min < max
      const tier2Option = await screen.findByText("Tier 2")
      fireEvent.click(tier2Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(2)
        // Max should not be adjusted since 2 < 3
        expect(mockOnMaxChange).not.toHaveBeenCalled()
      })
    })

    it("should not adjust when min < max", async () => {
      render(
        <QualityFilter
          minTier={2}
          maxTier={4}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      const tier3Option = await screen.findByText("Tier 3")
      fireEvent.click(tier3Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(3)
        expect(mockOnMaxChange).not.toHaveBeenCalled()
      })
    })

    it("should not validate when either value is empty", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier={2}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      const tier1Option = await screen.findByText("Tier 1")
      fireEvent.click(tier1Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(1)
        expect(mockOnMaxChange).not.toHaveBeenCalled()
      })
    })
  })

  describe("Visual Indicators", () => {
    it("should display visual indicators when showIndicators is true and values are set", () => {
      render(
        <QualityFilter
          minTier={2}
          maxTier={4}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
          showIndicators={true}
        />,
      )

      expect(screen.getByText(/min: tier 2/i)).toBeInTheDocument()
      expect(screen.getByText(/max: tier 4/i)).toBeInTheDocument()
    })

    it("should not display visual indicators when showIndicators is false", () => {
      render(
        <QualityFilter
          minTier={2}
          maxTier={4}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
          showIndicators={false}
        />,
      )

      expect(screen.queryByText(/min: tier 2/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/max: tier 4/i)).not.toBeInTheDocument()
    })

    it("should not display indicators when no values are set", () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
          showIndicators={true}
        />,
      )

      expect(screen.queryByText(/min:/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/max:/i)).not.toBeInTheDocument()
    })

    it("should display only min indicator when only min is set", () => {
      render(
        <QualityFilter
          minTier={3}
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
          showIndicators={true}
        />,
      )

      expect(screen.getByText(/min: tier 3/i)).toBeInTheDocument()
      expect(screen.queryByText(/max:/i)).not.toBeInTheDocument()
    })

    it("should display only max indicator when only max is set", () => {
      render(
        <QualityFilter
          minTier=""
          maxTier={5}
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
          showIndicators={true}
        />,
      )

      expect(screen.queryByText(/min:/i)).not.toBeInTheDocument()
      expect(screen.getByText(/max: tier 5/i)).toBeInTheDocument()
    })

    it("should display star icons in dropdown options", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)

      await waitFor(() => {
        // Check that star symbols are present (★)
        const options = screen.getAllByRole("option")
        const tier1Option = options.find((opt) => opt.textContent?.includes("Tier 1"))
        const tier5Option = options.find((opt) => opt.textContent?.includes("Tier 5"))

        expect(tier1Option?.textContent).toContain("★")
        expect(tier5Option?.textContent).toContain("★")
      })
    })
  })

  describe("onChange Event Emission", () => {
    it("should emit onChange events with correct values", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      // Change min tier
      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)
      const tier2Option = await screen.findByText("Tier 2")
      fireEvent.click(tier2Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(2)
        expect(mockOnMinChange).toHaveBeenCalledTimes(1)
      })

      vi.clearAllMocks()

      // Change max tier
      const maxSelect = selects[1]
      fireEvent.mouseDown(maxSelect)
      const tier4Option = await screen.findByText("Tier 4")
      fireEvent.click(tier4Option)

      await waitFor(() => {
        expect(mockOnMaxChange).toHaveBeenCalledWith(4)
        expect(mockOnMaxChange).toHaveBeenCalledTimes(1)
      })
    })

    it("should emit onChange with number type for tier values", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)
      const tier3Option = await screen.findByText("Tier 3")
      fireEvent.click(tier3Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(3)
        expect(typeof mockOnMinChange.mock.calls[0][0]).toBe("number")
      })
    })

    it("should emit onChange with empty string for 'Any' selection", async () => {
      render(
        <QualityFilter
          minTier={2}
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      fireEvent.mouseDown(minSelect)
      const anyOption = await screen.findByText("Any")
      fireEvent.click(anyOption)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith("")
        expect(mockOnMinChange.mock.calls[0][0]).toBe("")
      })
    })
  })

  describe("Edge Cases", () => {
    it("should handle rapid selection changes", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]

      // Rapidly change selections
      fireEvent.mouseDown(minSelect)
      const tier1 = await screen.findByText("Tier 1")
      fireEvent.click(tier1)

      fireEvent.mouseDown(minSelect)
      const tier3 = await screen.findByText("Tier 3")
      fireEvent.click(tier3)

      fireEvent.mouseDown(minSelect)
      const tier5 = await screen.findByText("Tier 5")
      fireEvent.click(tier5)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledTimes(3)
        expect(mockOnMinChange).toHaveBeenLastCalledWith(5)
      })
    })

    it("should handle multiple value changes", async () => {
      render(
        <QualityFilter
          minTier={3}
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]
      
      // First change to Tier 2
      fireEvent.mouseDown(minSelect)
      const tier2Option = await screen.findByText("Tier 2")
      fireEvent.click(tier2Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(2)
      })

      vi.clearAllMocks()

      // Then change to Tier 4 (different value)
      fireEvent.mouseDown(minSelect)
      const tier4Option = await screen.findByText("Tier 4")
      fireEvent.click(tier4Option)

      await waitFor(() => {
        expect(mockOnMinChange).toHaveBeenCalledWith(4)
      })
    })

    it("should handle all tiers from 1 to 5", async () => {
      render(
        <QualityFilter
          minTier=""
          maxTier=""
          onMinChange={mockOnMinChange}
          onMaxChange={mockOnMaxChange}
        />,
      )

      const selects = screen.getAllByRole("combobox")
      const minSelect = selects[0]

      for (let tier = 1; tier <= 5; tier++) {
        vi.clearAllMocks()
        fireEvent.mouseDown(minSelect)
        const tierOption = await screen.findByText(`Tier ${tier}`)
        fireEvent.click(tierOption)

        await waitFor(() => {
          expect(mockOnMinChange).toHaveBeenCalledWith(tier)
        })
      }
    })
  })
})
