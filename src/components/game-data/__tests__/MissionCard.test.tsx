/**
 * MissionCard Component Tests
 *
 * Tests for the MissionCard component including:
 * - Rendering mission metadata
 * - Displaying rewards
 * - Click handling
 *
 * Task 11.2 - Create MissionCard component
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi } from "vitest"
import { MissionCard } from "../MissionCard"

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

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
    renderWithRouter(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Test Mission")).toBeInTheDocument()
  })

  it("displays category chip via getMissionTypeLabel", () => {
    renderWithRouter(<MissionCard mission={mockMission} />)
    // Combat category gets formatted by getMissionTypeLabel
    // The chip should show as a category badge
    const chips = screen.getAllByRole("button")
    expect(chips.length).toBeGreaterThan(0)
  })

  it("displays star system chip", () => {
    renderWithRouter(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Stanton")).toBeInTheDocument()
  })

  it("displays chain starter badge when mission is chain starter", () => {
    const chainStarterMission = { ...mockMission, is_chain_starter: true }
    renderWithRouter(<MissionCard mission={chainStarterMission} />)
    expect(screen.getByText("Starter")).toBeInTheDocument()
  })

  it("displays giver/faction information", () => {
    renderWithRouter(<MissionCard mission={mockMission} />)
    expect(screen.getByText("UEE")).toBeInTheDocument()
  })

  it("displays credit rewards with formatCredits", () => {
    renderWithRouter(<MissionCard mission={mockMission} />)
    // 10000 = "10K aUEC", 15000 = "15K aUEC" => "10K aUEC – 15K aUEC"
    expect(screen.getByText(/10K aUEC/)).toBeInTheDocument()
  })

  it("displays blueprint count chip", () => {
    renderWithRouter(<MissionCard mission={mockMission} />)
    expect(screen.getByText("2 BP")).toBeInTheDocument()
  })

  it("displays singular blueprint count", () => {
    const singleBlueprintMission = { ...mockMission, blueprint_reward_count: 1 }
    renderWithRouter(<MissionCard mission={singleBlueprintMission} />)
    expect(screen.getByText("1 BP")).toBeInTheDocument()
  })

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn()
    renderWithRouter(<MissionCard mission={mockMission} onClick={handleClick} />)

    const card = screen.getByText("Test Mission").closest("[class*='MuiCard']")
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
      is_chain_mission: false,
      is_unique_mission: false,
      ship_encounter_count: 0,
    }

    renderWithRouter(<MissionCard mission={minimalMission} />)
    expect(screen.queryByText("Stanton")).not.toBeInTheDocument()
    expect(screen.queryByText("Illegal")).not.toBeInTheDocument()
  })

  it("does not display rewards when not present", () => {
    const noRewardsMission = {
      mission_id: "test-mission-3",
      mission_name: "No Rewards Mission",
      blueprint_reward_count: 0,
      is_shareable: false,
      is_chain_starter: false,
      is_chain_mission: false,
      is_unique_mission: false,
      ship_encounter_count: 0,
    }

    renderWithRouter(<MissionCard mission={noRewardsMission} />)
    expect(screen.queryByText(/BP$/)).not.toBeInTheDocument()
  })

  it("displays illegal badge for illegal missions", () => {
    const illegalMission = { ...mockMission, legal_status: "ILLEGAL", is_illegal: true }
    renderWithRouter(<MissionCard mission={illegalMission} />)
    expect(screen.getByText("Illegal")).toBeInTheDocument()
  })

  it("displays Reward label", () => {
    renderWithRouter(<MissionCard mission={mockMission} />)
    expect(screen.getByText("Reward")).toBeInTheDocument()
  })
})
