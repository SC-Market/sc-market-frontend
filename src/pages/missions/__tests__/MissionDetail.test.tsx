/**
 * MissionDetail Component Tests
 *
 * Tests for the MissionDetail component including:
 * - Mission information display
 * - Blueprint reward pools display
 * - Prerequisite missions display
 * - Mission chain information display
 * - Loading and error states
 *
 * Task 11.4 - Create MissionDetail component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { vi, beforeEach, describe, it, expect } from "vitest"
import { MissionDetail } from "../MissionDetail"
import { marketV2Api, useGetMissionDetailQuery } from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"

// Mock the market API module to control useGetMissionDetailQuery
vi.mock("../../../store/api/v2/market", async () => {
  const actual = await vi.importActual("../../../store/api/v2/market")
  return {
    ...actual,
    useGetMissionDetailQuery: vi.fn(),
  }
})

// Mock Page to avoid serviceApi dependency
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock StandardPageLayout to avoid serviceApi/profileApi dependencies
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children, headerTitle }: { children: React.ReactNode; headerTitle?: string }) => <div>{headerTitle && <h1>{headerTitle}</h1>}{children}</div>,
}))

// Mock react-i18next
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, def?: string) => def || key,
      i18n: { language: "en", changeLanguage: vi.fn() },
    }),
  }
})

// Mock mission detail data
const mockMissionDetail = {
  mission: {
    mission_id: "mission-1",
    version_id: "version-1",
    mission_code: "MISSION_CODE_001",
    mission_name: "Test Mission",
    mission_description: "This is a test mission description",
    category: "Combat",
    mission_type: "Contract",
    career_type: "Mercenary",
    legal_status: "LEGAL" as const,
    difficulty_level: 3,
    star_system: "Stanton",
    planet_moon: "Hurston",
    location_detail: "Lorville",
    mission_giver_org: "Hurston Dynamics",
    faction: "Hurston Dynamics",
    credit_reward_min: 10000,
    credit_reward_max: 15000,
    reputation_reward: 100,
    is_shareable: true,
    availability_type: "Always Available",
    associated_event: undefined,
    required_rank: 1,
    required_reputation: 0,
    is_chain_starter: true,
    is_chain_mission: true,
    is_unique_mission: false,
    prerequisite_missions: undefined,
    estimated_uec_per_hour: 50000,
    estimated_rep_per_hour: 500,
    rank_index: 10,
    reward_scope: "Personal",
    community_difficulty_avg: 3.5,
    community_difficulty_count: 42,
    community_satisfaction_avg: 4.2,
    community_satisfaction_count: 38,
    data_source: "extraction",
    is_verified: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  blueprint_rewards: [
    {
      reward_pool_id: 1,
      reward_pool_size: 3,
      selection_count: 1,
      blueprints: [
        {
          blueprint_id: "bp-1",
          blueprint_name: "Test Blueprint 1",
          output_item_name: "Test Item 1",
          output_item_icon: "https://example.com/icon1.png",
          drop_probability: 33.33,
          is_guaranteed: false,
          rarity: "Rare",
          tier: 3,
          user_owns: false,
        },
        {
          blueprint_id: "bp-2",
          blueprint_name: "Test Blueprint 2",
          output_item_name: "Test Item 2",
          output_item_icon: "https://example.com/icon2.png",
          drop_probability: 33.33,
          is_guaranteed: false,
          rarity: "Epic",
          tier: 4,
          user_owns: true,
        },
        {
          blueprint_id: "bp-3",
          blueprint_name: "Test Blueprint 3",
          output_item_name: "Test Item 3",
          output_item_icon: undefined,
          drop_probability: 33.33,
          is_guaranteed: false,
          rarity: "Common",
          tier: 1,
          user_owns: false,
        },
      ],
    },
  ],
  prerequisite_missions: [
    {
      mission_id: "prereq-1",
      version_id: "version-1",
      mission_code: "PREREQ_001",
      mission_name: "Prerequisite Mission",
      mission_description: undefined,
      category: "Delivery",
      mission_type: undefined,
      career_type: "Hauling",
      legal_status: "LEGAL" as const,
      difficulty_level: 1,
      star_system: "Stanton",
      planet_moon: undefined,
      location_detail: undefined,
      mission_giver_org: undefined,
      faction: "Crusader Industries",
      credit_reward_min: 5000,
      credit_reward_max: 7000,
      reputation_reward: undefined,
      is_shareable: false,
      availability_type: undefined,
      associated_event: undefined,
      required_rank: undefined,
      required_reputation: undefined,
      is_chain_starter: false,
      is_chain_mission: false,
      is_unique_mission: false,
      prerequisite_missions: undefined,
      estimated_uec_per_hour: undefined,
      estimated_rep_per_hour: undefined,
      rank_index: undefined,
      reward_scope: undefined,
      community_difficulty_avg: undefined,
      community_difficulty_count: 0,
      community_satisfaction_avg: undefined,
      community_satisfaction_count: 0,
      data_source: "extraction",
      is_verified: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ],
  user_completed: false,
  user_rating: {
    difficulty_rating: 3,
    satisfaction_rating: 4,
    rating_comment: "Great mission!",
  },
}

// Create a simple store (no preloaded RTK Query state needed since we mock the hook)
const createMockStore = () => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware, serviceApi.middleware),
  })
}

const renderWithProviders = () => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/missions/mission-1"]}>
        <Routes>
          <Route path="/missions/:slug" element={<MissionDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe("MissionDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: return fulfilled data
    ;(useGetMissionDetailQuery as any).mockReturnValue({
      data: mockMissionDetail,
      isLoading: false,
      error: undefined,
    })
  })

  it("renders loading state", () => {
    ;(useGetMissionDetailQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    })

    renderWithProviders()

    // Check for loading indicator (CircularProgress)
    expect(screen.getByRole("progressbar") || screen.getByText(/loading/i)).toBeTruthy()
  })

  it("renders error state", () => {
    ;(useGetMissionDetailQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Failed to load" },
    })

    renderWithProviders()

    expect(screen.getByText(/Failed to load mission details/i)).toBeInTheDocument()
  })

  it("renders mission header with name and badges", () => {
    renderWithProviders()

    expect(screen.getByText("Test Mission")).toBeInTheDocument()
    expect(screen.getByText("Combat")).toBeInTheDocument()
    expect(screen.getByText("Mercenary")).toBeInTheDocument()
    expect(screen.getByText("LEGAL")).toBeInTheDocument()
    expect(screen.getByText("Difficulty 3")).toBeInTheDocument()
    expect(screen.getByText("Shareable")).toBeInTheDocument()
    expect(screen.getByText("Chain Starter")).toBeInTheDocument()
  })

  it("renders mission description", () => {
    renderWithProviders()

    expect(screen.getByText("This is a test mission description")).toBeInTheDocument()
  })

  it("renders mission metadata (location, giver, type)", () => {
    renderWithProviders()

    expect(screen.getByText("Location")).toBeInTheDocument()
    expect(screen.getByText("Stanton • Hurston • Lorville")).toBeInTheDocument()
    expect(screen.getByText("Mission Giver")).toBeInTheDocument()
    expect(screen.getByText("Hurston Dynamics")).toBeInTheDocument()
    expect(screen.getByText("Mission Type")).toBeInTheDocument()
    expect(screen.getByText("Contract")).toBeInTheDocument()
  })

  it("renders credit and reputation rewards", () => {
    renderWithProviders()

    expect(screen.getByText("Credits")).toBeInTheDocument()
    expect(screen.getByText("10,000 - 15,000 aUEC")).toBeInTheDocument()
    expect(screen.getByText("Reputation")).toBeInTheDocument()
    expect(screen.getByText("+100")).toBeInTheDocument()
  })

  it("renders estimated rewards per hour", () => {
    renderWithProviders()

    expect(screen.getByText("Est. UEC/Hour")).toBeInTheDocument()
    expect(screen.getByText("50,000 aUEC")).toBeInTheDocument()
    expect(screen.getByText("Est. Rep/Hour")).toBeInTheDocument()
    expect(screen.getByText("+500")).toBeInTheDocument()
  })

  it("renders blueprint reward pools with probabilities", () => {
    renderWithProviders()

    expect(screen.getByText("Blueprint Rewards")).toBeInTheDocument()
    expect(screen.getByText("Reward Pool 1")).toBeInTheDocument()
    expect(screen.getByText(/1 of 3 blueprints selected/i)).toBeInTheDocument()
    expect(screen.getByText("Test Blueprint 1")).toBeInTheDocument()
    expect(screen.getByText("Test Blueprint 2")).toBeInTheDocument()
    expect(screen.getByText("Test Blueprint 3")).toBeInTheDocument()
  })

  it("renders blueprint rarity and tier badges", () => {
    renderWithProviders()

    expect(screen.getByText("Tier 3")).toBeInTheDocument()
    expect(screen.getByText("Tier 4")).toBeInTheDocument()
    expect(screen.getByText("Tier 1")).toBeInTheDocument()
    expect(screen.getByText("Owned")).toBeInTheDocument()
  })

  it("renders drop probabilities for blueprints", () => {
    renderWithProviders()

    // Should find 3 blueprints with 33.3% chance each, plus the pool header text
    const probabilities = screen.getAllByText(/33\.3% chance/i)
    expect(probabilities.length).toBeGreaterThanOrEqual(3)
  })

  it("renders prerequisite missions", () => {
    renderWithProviders()

    expect(screen.getByText("Prerequisite Missions")).toBeInTheDocument()
    expect(
      screen.getByText("Complete these missions before attempting this one")
    ).toBeInTheDocument()
    expect(screen.getByText("Prerequisite Mission")).toBeInTheDocument()
    expect(screen.getByText("Delivery • Stanton • Crusader Industries")).toBeInTheDocument()
  })

  it("renders mission chain information", () => {
    renderWithProviders()

    expect(screen.getByText("Mission Chain Information")).toBeInTheDocument()
    expect(
      screen.getByText(/This is a chain starter mission/i)
    ).toBeInTheDocument()
  })

  it("renders requirements section", () => {
    renderWithProviders()

    expect(screen.getByText("Requirements")).toBeInTheDocument()
    expect(screen.getByText("Required Rank")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("renders community ratings", () => {
    renderWithProviders()

    expect(screen.getByText("Community Ratings")).toBeInTheDocument()
    expect(screen.getByText("Difficulty")).toBeInTheDocument()
    expect(screen.getByText("⭐ 3.5 / 5.0")).toBeInTheDocument()
    expect(screen.getByText("42 ratings")).toBeInTheDocument()
    expect(screen.getByText("Satisfaction")).toBeInTheDocument()
    expect(screen.getByText("⭐ 4.2 / 5.0")).toBeInTheDocument()
    expect(screen.getByText("38 ratings")).toBeInTheDocument()
  })

  it("renders user rating when available", () => {
    renderWithProviders()

    expect(screen.getByText("Your Rating")).toBeInTheDocument()
    expect(screen.getByText(/Difficulty: 3\/5 • Satisfaction: 4\/5/i)).toBeInTheDocument()
    expect(screen.getByText('"Great mission!"')).toBeInTheDocument()
  })

  it("renders mission metadata section", () => {
    renderWithProviders()

    expect(screen.getByText("Additional Information")).toBeInTheDocument()
    expect(screen.getByText("Mission Code")).toBeInTheDocument()
    expect(screen.getByText("MISSION_CODE_001")).toBeInTheDocument()
    expect(screen.getByText("Rank Index")).toBeInTheDocument()
    expect(screen.getByText("10")).toBeInTheDocument()
    expect(screen.getByText("Data Source")).toBeInTheDocument()
    expect(screen.getByText("extraction ✓")).toBeInTheDocument()
  })

  it("does not render optional sections when data is missing", () => {
    const minimalMissionDetail = {
      mission: {
        ...mockMissionDetail.mission,
        mission_description: undefined,
        credit_reward_min: undefined,
        credit_reward_max: undefined,
        reputation_reward: undefined,
        estimated_uec_per_hour: undefined,
        estimated_rep_per_hour: undefined,
        required_rank: undefined,
        required_reputation: undefined,
        community_difficulty_avg: undefined,
        community_satisfaction_avg: undefined,
      },
      blueprint_rewards: [],
      prerequisite_missions: undefined,
      user_completed: false,
      user_rating: undefined,
    }

    ;(useGetMissionDetailQuery as any).mockReturnValue({
      data: minimalMissionDetail,
      isLoading: false,
      error: undefined,
    })

    renderWithProviders()

    expect(screen.queryByText("Blueprint Rewards")).not.toBeInTheDocument()
    expect(screen.queryByText("Prerequisite Missions")).not.toBeInTheDocument()
    expect(screen.queryByText("Requirements")).not.toBeInTheDocument()
    expect(screen.queryByText("Community Ratings")).not.toBeInTheDocument()
  })
})
