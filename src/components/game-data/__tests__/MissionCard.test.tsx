/**
 * MissionCard Component Tests
 * 
 * Tests for the MissionCard component including:
 * - Rendering mission metadata
 * - Displaying rewards
 * - Click handling
 * - Responsive layout
 * 
 * Task 11.2 - Create MissionCard component
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { MissionCard } from "../MissionCard"

describe("MissionCard", () => {
  const mockMission = {
    mission_id: "test-mission-1",
    mission_name: "Test Mission",
    category: "Combat",
    career_type: "Mercenary",
    legal_status: "LEGAL",
    difficulty_level: 3,
    star_system: "Stanton",
    planet_moon: "Crusader",
    faction: "UEE",
    credit_reward_min: 10000,
    credit_reward_max: 15000,
    blueprint_reward_count: 2,
    community_satisfaction_avg: 4.5,
    is_shareable: true,
    is_chain_starter: false,
    is_chain_mission: false,
    is_unique_mission: false,
    ship_encounter_count: 0,
  }

  it("renders mission name", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Test Mission")).toBeInTheDocument()
  })

  it("displays category badge", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Combat")).toBeInTheDocument()
  })

  it("displays career type badge", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Mercenary")).toBeInTheDocument()
  })

  it("displays legal status badge", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText("LEGAL")).toBeInTheDocument()
  })

  it("displays difficulty level", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Difficulty 3")).toBeInTheDocument()
  })

  it("displays shareable badge when mission is shareable", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Shareable")).toBeInTheDocument()
  })

  it("displays chain starter badge when mission is chain starter", () => {
    const chainStarterMission = { ...mockMission, is_chain_starter: true }
    render(<MissionCard mission={chainStarterMission} />)
    expect(screen.getByText("Chain Starter")).toBeInTheDocument()
  })

  it("displays location information", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText(/Stanton • Crusader • UEE/)).toBeInTheDocument()
  })

  it("displays credit rewards", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText(/10,000 - 15,000 aUEC/)).toBeInTheDocument()
  })

  it("displays blueprint count", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText("2 Blueprints")).toBeInTheDocument()
  })

  it("displays singular blueprint text when count is 1", () => {
    const singleBlueprintMission = { ...mockMission, blueprint_reward_count: 1 }
    render(<MissionCard mission={singleBlueprintMission} />)
    expect(screen.getByText("1 Blueprint")).toBeInTheDocument()
  })

  it("displays community satisfaction rating", () => {
    render(<MissionCard mission={mockMission} />)
    expect(screen.getByText(/4.5 satisfaction/)).toBeInTheDocument()
  })

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn()
    render(<MissionCard mission={mockMission} onClick={handleClick} />)
    
    const card = screen.getByText("Test Mission").closest(".MuiCard-root")
    if (card) {
      fireEvent.click(card)
      expect(handleClick).toHaveBeenCalledWith("test-mission-1")
    }
  })

  it("does not display badges for missing optional fields", () => {
    const minimalMission = {
      mission_id: "test-mission-2",
      mission_name: "Minimal Mission",
      blueprint_reward_count: 0,
      is_shareable: false,
      is_chain_starter: false,
    }
    
    render(<MissionCard mission={minimalMission} />)
    expect(screen.queryByText("Combat")).not.toBeInTheDocument()
    expect(screen.queryByText("Mercenary")).not.toBeInTheDocument()
    expect(screen.queryByText("LEGAL")).not.toBeInTheDocument()
  })

  it("does not display rewards when not present", () => {
    const noRewardsMission = {
      mission_id: "test-mission-3",
      mission_name: "No Rewards Mission",
      blueprint_reward_count: 0,
      is_shareable: false,
      is_chain_starter: false,
    }
    
    render(<MissionCard mission={noRewardsMission} />)
    expect(screen.queryByText(/aUEC/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Blueprint/)).not.toBeInTheDocument()
  })

  it("applies hover styles when onClick is provided", () => {
    const handleClick = vi.fn()
    const { container } = render(<MissionCard mission={mockMission} onClick={handleClick} />)
    
    const card = container.querySelector(".MuiCard-root")
    expect(card).toHaveStyle({ cursor: "pointer" })
  })

  it("does not apply pointer cursor when onClick is not provided", () => {
    const { container } = render(<MissionCard mission={mockMission} />)
    
    const card = container.querySelector(".MuiCard-root")
    expect(card).toHaveStyle({ cursor: "default" })
  })
})
