/**
 * MissionFilters Component Tests
 * 
 * Tests for the MissionFilters component including:
 * - Rendering all filter controls
 * - Filter change handlers
 * - Reset functionality
 * - Responsive layout
 * 
 * Task 11.3 - Create MissionFilters component
 * Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4, 17.5, 41.1-41.10
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { MissionFilters } from "../MissionFilters"

describe("MissionFilters", () => {
  const mockHandlers = {
    onSearchTextChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onCareerTypeChange: vi.fn(),
    onStarSystemChange: vi.fn(),
    onPlanetMoonChange: vi.fn(),
    onFactionChange: vi.fn(),
    onLegalStatusChange: vi.fn(),
    onDifficultyRangeChange: vi.fn(),
    onIsShareableChange: vi.fn(),
    onHasBlueprintsChange: vi.fn(),
    onIsChainStarterChange: vi.fn(),
    onResetFilters: vi.fn(),
  }

  const defaultProps = {
    searchText: "",
    category: "",
    careerType: "",
    starSystem: "",
    planetMoon: "",
    faction: "",
    legalStatus: "" as const,
    difficultyRange: [1, 5],
    isShareable: undefined,
    hasBlueprints: undefined,
    isChainStarter: undefined,
    missionGiver: "",
    onMissionGiverChange: vi.fn(),
    creditRewardMin: "" as number | "",
    onCreditRewardMinChange: vi.fn(),
    ...mockHandlers,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render all filter controls", () => {
      render(<MissionFilters {...defaultProps} />)

      // Search text input
      expect(screen.getByLabelText(/search missions/i)).toBeInTheDocument()

      // Dropdowns
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/career type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/star system/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/faction/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/legal status/i)).toBeInTheDocument()

      // Difficulty slider
      expect(screen.getByText(/difficulty level/i)).toBeInTheDocument()

      // Checkboxes
      expect(screen.getByLabelText(/shareable/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/has blueprint rewards/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/chain starter/i)).toBeInTheDocument()

      // Reset button
      expect(screen.getByText(/reset all filters/i)).toBeInTheDocument()
    })

    it("should render planet/moon filter when handler is provided", () => {
      render(<MissionFilters {...defaultProps} />)
      expect(screen.getByLabelText(/planet\/moon/i)).toBeInTheDocument()
    })

    it("should not render planet/moon filter when handler is not provided", () => {
      const propsWithoutPlanetMoon = {
        ...defaultProps,
        onPlanetMoonChange: undefined,
      }
      render(<MissionFilters {...propsWithoutPlanetMoon} />)
      expect(screen.queryByLabelText(/planet\/moon/i)).not.toBeInTheDocument()
    })

    it("should display current filter values", () => {
      const propsWithValues = {
        ...defaultProps,
        searchText: "test mission",
        category: "Combat",
        difficultyRange: [2, 4],
      }
      render(<MissionFilters {...propsWithValues} />)

      const searchInput = screen.getByLabelText(/search missions/i) as HTMLInputElement
      expect(searchInput.value).toBe("test mission")

      expect(screen.getByText(/difficulty level: 2 - 4/i)).toBeInTheDocument()
    })
  })

  describe("Search Text Filter", () => {
    it("should call onSearchTextChange when text is entered", () => {
      render(<MissionFilters {...defaultProps} />)
      const searchInput = screen.getByLabelText(/search missions/i)

      fireEvent.change(searchInput, { target: { value: "bounty" } })

      expect(mockHandlers.onSearchTextChange).toHaveBeenCalledWith("bounty")
    })

    it("should display helper text for partial matching", () => {
      render(<MissionFilters {...defaultProps} />)
      expect(screen.getByText(/partial name matching supported/i)).toBeInTheDocument()
    })
  })

  describe("Category Filter (Requirement 41.1)", () => {
    it("should render all category options", () => {
      render(<MissionFilters {...defaultProps} />)
      const categorySelect = screen.getByLabelText(/category/i)

      fireEvent.mouseDown(categorySelect)

      expect(screen.getByText("All Categories")).toBeInTheDocument()
      expect(screen.getByText("Combat")).toBeInTheDocument()
      expect(screen.getByText("Delivery")).toBeInTheDocument()
      expect(screen.getByText("Investigation")).toBeInTheDocument()
      expect(screen.getByText("Bounty Hunting")).toBeInTheDocument()
      expect(screen.getByText("Mercenary")).toBeInTheDocument()
      expect(screen.getByText("Mining")).toBeInTheDocument()
      expect(screen.getByText("Salvage")).toBeInTheDocument()
      expect(screen.getByText("Trading")).toBeInTheDocument()
    })
  })

  describe("Career Type Filter (Requirement 17.1)", () => {
    it("should render all career type options", () => {
      render(<MissionFilters {...defaultProps} />)
      const careerSelect = screen.getByLabelText(/career type/i)

      fireEvent.mouseDown(careerSelect)

      expect(screen.getByText("All Career Types")).toBeInTheDocument()
      expect(screen.getByText("Mercenary")).toBeInTheDocument()
      expect(screen.getByText("Hauling")).toBeInTheDocument()
      expect(screen.getByText("Mining")).toBeInTheDocument()
    })
  })

  describe("Location Filters (Requirements 16.1, 16.2)", () => {
    it("should render star system filter with options", () => {
      render(<MissionFilters {...defaultProps} />)
      const systemSelect = screen.getByLabelText(/star system/i)

      fireEvent.mouseDown(systemSelect)

      expect(screen.getByText("All Systems")).toBeInTheDocument()
      expect(screen.getByText("Stanton")).toBeInTheDocument()
      expect(screen.getByText("Pyro")).toBeInTheDocument()
      expect(screen.getByText("Nyx")).toBeInTheDocument()
      expect(screen.getByText("Terra")).toBeInTheDocument()
    })

    it("should render planet/moon filter with options", () => {
      render(<MissionFilters {...defaultProps} />)
      const planetSelect = screen.getByLabelText(/planet\/moon/i)

      fireEvent.mouseDown(planetSelect)

      expect(screen.getByText("All Locations")).toBeInTheDocument()
      expect(screen.getByText("Crusader")).toBeInTheDocument()
      expect(screen.getByText("Hurston")).toBeInTheDocument()
      expect(screen.getByText("microTech")).toBeInTheDocument()
    })
  })

  describe("Legal Status Filter (Requirement 17.2)", () => {
    it("should render legal status options", () => {
      render(<MissionFilters {...defaultProps} />)
      const legalSelect = screen.getByLabelText(/legal status/i)

      fireEvent.mouseDown(legalSelect)

      expect(screen.getByText("All")).toBeInTheDocument()
      expect(screen.getByText("Legal")).toBeInTheDocument()
      expect(screen.getByText("Illegal")).toBeInTheDocument()
    })

    it("should call onLegalStatusChange with correct value", () => {
      render(<MissionFilters {...defaultProps} />)
      const legalSelect = screen.getByLabelText(/legal status/i)

      fireEvent.mouseDown(legalSelect)
      fireEvent.click(screen.getByText("Legal"))

      expect(mockHandlers.onLegalStatusChange).toHaveBeenCalledWith("LEGAL")
    })
  })

  describe("Difficulty Filter (Requirement 17.3)", () => {
    it("should display difficulty range", () => {
      render(<MissionFilters {...defaultProps} />)
      expect(screen.getByText(/difficulty level: 1 - 5/i)).toBeInTheDocument()
    })

    it("should display custom difficulty range", () => {
      const propsWithRange = {
        ...defaultProps,
        difficultyRange: [2, 4],
      }
      render(<MissionFilters {...propsWithRange} />)
      expect(screen.getByText(/difficulty level: 2 - 4/i)).toBeInTheDocument()
    })
  })

  describe("Boolean Filters (Requirements 41.5, 41.9, 47.2)", () => {
    it("should render shareable checkbox", () => {
      render(<MissionFilters {...defaultProps} />)
      const shareableCheckbox = screen.getByLabelText(/shareable/i)
      expect(shareableCheckbox).toBeInTheDocument()
    })

    it("should render blueprint rewards checkbox", () => {
      render(<MissionFilters {...defaultProps} />)
      const blueprintCheckbox = screen.getByLabelText(/has blueprint rewards/i)
      expect(blueprintCheckbox).toBeInTheDocument()
    })

    it("should render chain starter checkbox", () => {
      render(<MissionFilters {...defaultProps} />)
      const chainCheckbox = screen.getByLabelText(/chain starter/i)
      expect(chainCheckbox).toBeInTheDocument()
    })

    it("should handle shareable checkbox state transitions", () => {
      render(<MissionFilters {...defaultProps} />)
      const shareableCheckbox = screen.getByLabelText(/shareable/i)

      // First click: undefined -> true
      fireEvent.click(shareableCheckbox)
      expect(mockHandlers.onIsShareableChange).toHaveBeenCalledWith(true)

      // Simulate checked state
      const propsChecked = { ...defaultProps, isShareable: true }
      const { rerender } = render(<MissionFilters {...propsChecked} />)

      // Second click: true -> false
      fireEvent.click(screen.getByLabelText(/shareable/i))
      expect(mockHandlers.onIsShareableChange).toHaveBeenCalledWith(false)
    })

    it("should handle blueprint checkbox state transitions", () => {
      render(<MissionFilters {...defaultProps} />)
      const blueprintCheckbox = screen.getByLabelText(/has blueprint rewards/i)

      fireEvent.click(blueprintCheckbox)
      expect(mockHandlers.onHasBlueprintsChange).toHaveBeenCalledWith(true)
    })

    it("should handle chain starter checkbox state transitions", () => {
      render(<MissionFilters {...defaultProps} />)
      const chainCheckbox = screen.getByLabelText(/chain starter/i)

      fireEvent.click(chainCheckbox)
      expect(mockHandlers.onIsChainStarterChange).toHaveBeenCalledWith(true)
    })
  })

  describe("Reset Filters", () => {
    it("should call onResetFilters when reset button is clicked", () => {
      render(<MissionFilters {...defaultProps} />)
      const resetButton = screen.getByText(/reset all filters/i)

      fireEvent.click(resetButton)

      expect(mockHandlers.onResetFilters).toHaveBeenCalledTimes(1)
    })

    it("should display reset button with correct styling", () => {
      render(<MissionFilters {...defaultProps} />)
      const resetButton = screen.getByText(/reset all filters/i)

      expect(resetButton).toHaveStyle({ cursor: "pointer" })
    })
  })

  describe("Faction Filter (Requirement 41.4)", () => {
    it("should render faction options", () => {
      render(<MissionFilters {...defaultProps} />)
      const factionSelect = screen.getByLabelText(/faction/i)

      fireEvent.mouseDown(factionSelect)

      expect(screen.getByText("All Factions")).toBeInTheDocument()
      expect(screen.getByText("UEE")).toBeInTheDocument()
      expect(screen.getByText("Crusader Industries")).toBeInTheDocument()
      expect(screen.getByText("Hurston Dynamics")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have proper labels for all inputs", () => {
      render(<MissionFilters {...defaultProps} />)

      expect(screen.getByLabelText(/search missions/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/career type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/star system/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/faction/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/legal status/i)).toBeInTheDocument()
    })

    it("should have accessible checkboxes", () => {
      render(<MissionFilters {...defaultProps} />)

      const shareableCheckbox = screen.getByLabelText(/shareable/i)
      const blueprintCheckbox = screen.getByLabelText(/has blueprint rewards/i)
      const chainCheckbox = screen.getByLabelText(/chain starter/i)

      expect(shareableCheckbox).toHaveAttribute("type", "checkbox")
      expect(blueprintCheckbox).toHaveAttribute("type", "checkbox")
      expect(chainCheckbox).toHaveAttribute("type", "checkbox")
    })
  })

  describe("Integration", () => {
    it("should work with all filters applied", () => {
      const propsWithAllFilters = {
        ...defaultProps,
        searchText: "bounty",
        category: "Combat",
        careerType: "Mercenary",
        starSystem: "Stanton",
        faction: "UEE",
        legalStatus: "LEGAL" as const,
        difficultyRange: [3, 5],
        isShareable: true,
        hasBlueprints: true,
        isChainStarter: false,
      }

      render(<MissionFilters {...propsWithAllFilters} />)

      const searchInput = screen.getByLabelText(/search missions/i) as HTMLInputElement
      expect(searchInput.value).toBe("bounty")
      expect(screen.getByText(/difficulty level: 3 - 5/i)).toBeInTheDocument()
    })
  })
})
