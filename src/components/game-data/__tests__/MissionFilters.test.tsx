/**
 * MissionFilters Component Tests
 *
 * Tests for the MissionFilters component including:
 * - Rendering all filter controls
 * - Filter change handlers
 * - Reset functionality
 *
 * Task 11.3 - Create MissionFilters component
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { MissionFilters } from "../MissionFilters"

// Mock the useGetGameEventsQuery hook
vi.mock("../../../store/api/v2/market", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useGetGameEventsQuery: () => ({
      data: { events: [{ event_code: "EVT1", event_name: "Holiday Event", mission_count: 3 }] },
      isLoading: false,
    }),
  }
})

describe("MissionFilters", () => {
  const mockHandlers = {
    onSearchTextChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onCareerTypeChange: vi.fn(),
    onStarSystemChange: vi.fn(),
    onFactionChange: vi.fn(),
    onLegalStatusChange: vi.fn(),
    onDifficultyRangeChange: vi.fn(),
    onIsShareableChange: vi.fn(),
    onHasBlueprintsChange: vi.fn(),
    onIsChainStarterChange: vi.fn(),
    onMissionGiverChange: vi.fn(),
    onCreditRewardMinChange: vi.fn(),
    onEventCodeChange: vi.fn(),
    onShowEventMissionsChange: vi.fn(),
    onResetFilters: vi.fn(),
  }

  const defaultProps = {
    searchText: "",
    category: "",
    careerType: "",
    starSystem: "",
    faction: "",
    missionGiver: "",
    legalStatus: "" as const,
    difficultyRange: [1, 5],
    isShareable: undefined as boolean | undefined,
    hasBlueprints: undefined as boolean | undefined,
    isChainStarter: undefined as boolean | undefined,
    creditRewardMin: "" as number | "",
    eventCode: "",
    showEventMissions: false,
    ...mockHandlers,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render all filter controls", () => {
      render(<MissionFilters {...defaultProps} />)

      // Search text input (TextField with label works with getByLabelText)
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument()

      // Selects render as combobox roles
      const comboboxes = screen.getAllByRole("combobox")
      expect(comboboxes.length).toBeGreaterThanOrEqual(5)

      // TextFields
      expect(screen.getByLabelText(/faction/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mission giver/i)).toBeInTheDocument()

      // Checkboxes
      expect(screen.getByText(/shareable/i)).toBeInTheDocument()
      expect(screen.getByText(/blueprints/i)).toBeInTheDocument()
      expect(screen.getByText(/chain starter/i)).toBeInTheDocument()

      // Reset button
      expect(screen.getByText(/reset filters/i)).toBeInTheDocument()
    })

    it("should display current search text value", () => {
      const propsWithValues = {
        ...defaultProps,
        searchText: "test mission",
      }
      render(<MissionFilters {...propsWithValues} />)

      const searchInput = screen.getByLabelText(/search/i) as HTMLInputElement
      expect(searchInput.value).toBe("test mission")
    })
  })

  describe("Search Text Filter", () => {
    it("should call onSearchTextChange when text is entered", () => {
      render(<MissionFilters {...defaultProps} />)
      const searchInput = screen.getByLabelText(/search/i)

      fireEvent.change(searchInput, { target: { value: "bounty" } })

      expect(mockHandlers.onSearchTextChange).toHaveBeenCalledWith("bounty")
    })
  })

  describe("Category Filter", () => {
    it("should render category select", () => {
      render(<MissionFilters {...defaultProps} />)
      // Category is the first select (combobox)
      const selects = screen.getAllByRole("combobox")
      expect(selects[0]).toBeInTheDocument()
    })
  })

  describe("Career Type Filter", () => {
    it("should render career select with options", () => {
      render(<MissionFilters {...defaultProps} />)
      // Find the Career select trigger (MUI renders it as a div with role combobox)
      const careerSelects = screen.getAllByRole("combobox")
      // Career is the second Select (after Category)
      const careerSelect = careerSelects[1]

      fireEvent.mouseDown(careerSelect)

      expect(screen.getByText("All")).toBeInTheDocument()
      expect(screen.getByText("Mercenary")).toBeInTheDocument()
      expect(screen.getByText("Hauling")).toBeInTheDocument()
      expect(screen.getByText("Mining")).toBeInTheDocument()
    })
  })

  describe("Location Filters", () => {
    it("should render star system filter with options", () => {
      render(<MissionFilters {...defaultProps} />)
      // System is the third Select
      const selects = screen.getAllByRole("combobox")
      const systemSelect = selects[2]

      fireEvent.mouseDown(systemSelect)

      expect(screen.getByText("Stanton")).toBeInTheDocument()
      expect(screen.getByText("Pyro")).toBeInTheDocument()
      expect(screen.getByText("Nyx")).toBeInTheDocument()
      expect(screen.getByText("Terra")).toBeInTheDocument()
      expect(screen.getByText("Magnus")).toBeInTheDocument()
    })
  })

  describe("Legal Status Filter", () => {
    it("should render legal status options", () => {
      render(<MissionFilters {...defaultProps} />)
      // Legal is the fourth Select
      const selects = screen.getAllByRole("combobox")
      const legalSelect = selects[3]

      fireEvent.mouseDown(legalSelect)

      // "Legal" appears as both label and option; check for the menu item role
      const options = screen.getAllByRole("option")
      const optionTexts = options.map(o => o.textContent)
      expect(optionTexts).toContain("Legal")
      expect(optionTexts).toContain("Illegal")
    })

    it("should call onLegalStatusChange with correct value", () => {
      render(<MissionFilters {...defaultProps} />)
      const selects = screen.getAllByRole("combobox")
      const legalSelect = selects[3]

      fireEvent.mouseDown(legalSelect)
      // Click the "Legal" option (menu item)
      const options = screen.getAllByRole("option")
      const legalOption = options.find(o => o.textContent === "Legal")
      fireEvent.click(legalOption!)

      expect(mockHandlers.onLegalStatusChange).toHaveBeenCalledWith("LEGAL")
    })
  })

  describe("Difficulty Filter", () => {
    it("should render difficulty select", () => {
      render(<MissionFilters {...defaultProps} />)
      // Difficulty is the fifth Select
      const selects = screen.getAllByRole("combobox")
      expect(selects[4]).toBeInTheDocument()
    })

    it("should show difficulty options when opened", () => {
      render(<MissionFilters {...defaultProps} />)
      // Difficulty is the fifth Select
      const selects = screen.getAllByRole("combobox")
      const difficultySelect = selects[4]

      fireEvent.mouseDown(difficultySelect)

      expect(screen.getByText("All Difficulties")).toBeInTheDocument()
      expect(screen.getByText(/easy/i)).toBeInTheDocument()
      expect(screen.getByText(/medium/i)).toBeInTheDocument()
      expect(screen.getByText(/hard/i)).toBeInTheDocument()
    })
  })

  describe("Boolean Filters", () => {
    it("should render shareable checkbox", () => {
      render(<MissionFilters {...defaultProps} />)
      expect(screen.getByText(/shareable/i)).toBeInTheDocument()
    })

    it("should render blueprints checkbox", () => {
      render(<MissionFilters {...defaultProps} />)
      expect(screen.getByText(/blueprints/i)).toBeInTheDocument()
    })

    it("should render chain starter checkbox", () => {
      render(<MissionFilters {...defaultProps} />)
      expect(screen.getByText(/chain starter/i)).toBeInTheDocument()
    })
  })

  describe("Faction Filter", () => {
    it("should call onFactionChange when text is entered", () => {
      render(<MissionFilters {...defaultProps} />)
      const factionInput = screen.getByLabelText(/faction/i)

      fireEvent.change(factionInput, { target: { value: "UEE" } })

      expect(mockHandlers.onFactionChange).toHaveBeenCalledWith("UEE")
    })
  })

  describe("Mission Giver Filter", () => {
    it("should call onMissionGiverChange when text is entered", () => {
      render(<MissionFilters {...defaultProps} />)
      const giverInput = screen.getByLabelText(/mission giver/i)

      fireEvent.change(giverInput, { target: { value: "Miles" } })

      expect(mockHandlers.onMissionGiverChange).toHaveBeenCalledWith("Miles")
    })
  })

  describe("Min Reward Filter", () => {
    it("should call onCreditRewardMinChange when value is entered", () => {
      render(<MissionFilters {...defaultProps} />)
      const rewardInput = screen.getByLabelText(/min reward/i)

      fireEvent.change(rewardInput, { target: { value: "5000" } })

      expect(mockHandlers.onCreditRewardMinChange).toHaveBeenCalledWith(5000)
    })

    it("should call onCreditRewardMinChange with empty string when cleared", () => {
      render(<MissionFilters {...defaultProps} creditRewardMin={5000} />)
      const rewardInput = screen.getByLabelText(/min reward/i)

      fireEvent.change(rewardInput, { target: { value: "" } })

      expect(mockHandlers.onCreditRewardMinChange).toHaveBeenCalledWith("")
    })
  })

  describe("Event Filters", () => {
    it("should show event select when showEventMissions is true", () => {
      render(<MissionFilters {...defaultProps} showEventMissions={true} />)
      // When event missions enabled, an extra combobox appears for Event
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBeGreaterThanOrEqual(6)
    })

    it("should not show event select when showEventMissions is false", () => {
      render(<MissionFilters {...defaultProps} showEventMissions={false} />)
      // Without event missions, only 5 selects
      const selects = screen.getAllByRole("combobox")
      expect(selects.length).toBe(5)
    })
  })

  describe("Reset Filters", () => {
    it("should call onResetFilters when reset button is clicked", () => {
      render(<MissionFilters {...defaultProps} />)
      const resetButton = screen.getByText(/reset filters/i)

      fireEvent.click(resetButton)

      expect(mockHandlers.onResetFilters).toHaveBeenCalled()
    })
  })
})
