/**
 * Missions API - RTK Query hooks for Game Data Missions
 * 
 * Provides hooks for mission search, detail, and blueprint queries.
 * Task 11.1 - Mission Search Frontend
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ============================================================================
// Types
// ============================================================================

export interface MissionSearchResult {
  mission_id: string
  mission_name: string
  category: string
  career_type?: string
  legal_status?: string
  difficulty_level?: number
  star_system?: string
  planet_moon?: string
  faction?: string
  credit_reward_min?: number
  credit_reward_max?: number
  blueprint_reward_count: number
  community_difficulty_avg?: number
  community_satisfaction_avg?: number
  is_chain_starter: boolean
  is_shareable: boolean
}

export interface SearchMissionsResponse {
  missions: MissionSearchResult[]
  total: number
  page: number
  page_size: number
}

export interface SearchMissionsParams {
  text?: string
  category?: string
  career_type?: string
  star_system?: string
  planet_moon?: string
  faction?: string
  legal_status?: "LEGAL" | "ILLEGAL"
  difficulty_min?: number
  difficulty_max?: number
  is_shareable?: boolean
  availability_type?: string
  associated_event?: string
  is_chain_starter?: boolean
  has_blueprint_rewards?: boolean
  credit_reward_min?: number
  community_difficulty_min?: number
  community_satisfaction_min?: number
  version_id?: string
  page?: number
  page_size?: number
}

export interface Mission {
  mission_id: string
  version_id: string
  mission_code: string
  mission_name: string
  mission_description?: string
  category: string
  mission_type?: string
  career_type?: string
  legal_status?: "LEGAL" | "ILLEGAL" | "UNKNOWN"
  difficulty_level?: number
  star_system?: string
  planet_moon?: string
  location_detail?: string
  mission_giver_org?: string
  faction?: string
  credit_reward_min?: number
  credit_reward_max?: number
  reputation_reward?: number
  is_shareable: boolean
  availability_type?: string
  associated_event?: string
  required_rank?: number
  required_reputation?: number
  is_chain_starter: boolean
  is_chain_mission: boolean
  is_unique_mission: boolean
  prerequisite_missions?: any
  estimated_uec_per_hour?: number
  estimated_rep_per_hour?: number
  rank_index?: number
  reward_scope?: string
  community_difficulty_avg?: number
  community_difficulty_count: number
  community_satisfaction_avg?: number
  community_satisfaction_count: number
  data_source: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface MissionBlueprintReward {
  blueprint_id: string
  blueprint_name: string
  output_item_name: string
  output_item_icon?: string
  drop_probability: number
  is_guaranteed: boolean
  rarity?: string
  tier?: number
  user_owns?: boolean
}

export interface MissionRewardPool {
  reward_pool_id: number
  reward_pool_size: number
  selection_count: number
  blueprints: MissionBlueprintReward[]
}

export interface UserMissionRating {
  difficulty_rating: number
  satisfaction_rating: number
  rating_comment?: string
}

export interface MissionDetailResponse {
  mission: Mission
  blueprint_rewards: MissionRewardPool[]
  prerequisite_missions?: Mission[]
  user_completed?: boolean
  user_rating?: UserMissionRating
}

export interface BlueprintDetail {
  blueprint_id: string
  blueprint_code: string
  blueprint_name: string
  blueprint_description?: string
  output_game_item_id: string
  output_item_name: string
  output_item_type: string
  output_item_icon?: string
  output_quantity: number
  item_category?: string
  item_subcategory?: string
  rarity?: string
  tier?: number
  crafting_station_type?: string
  crafting_time_seconds?: number
  required_skill_level?: number
  icon_url?: string
  ingredient_count: number
  drop_probability: number
  is_guaranteed: boolean
}

export interface RateMissionRequest {
  mission_id: string
  body: {
    difficulty_rating: number
    satisfaction_rating: number
    rating_comment?: string
  }
}

export interface RateMissionResponse {
  success: boolean
  rating_id: string
}

// ============================================================================
// API Definition
// ============================================================================

export const missionsApi = createApi({
  reducerPath: "missionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v2/game-data/missions",
    credentials: "include",
  }),
  tagTypes: ["Missions", "MissionDetail", "MissionBlueprints"],
  endpoints: (builder) => ({
    // Search missions with comprehensive filters
    searchMissions: builder.query<SearchMissionsResponse, SearchMissionsParams>({
      query: (params) => ({
        url: "/search",
        params: {
          ...params,
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: ["Missions"],
    }),

    // Get mission detail with blueprint rewards
    getMissionDetail: builder.query<
      MissionDetailResponse,
      { mission_id: string; user_id?: string }
    >({
      query: ({ mission_id, user_id }) => ({
        url: `/${mission_id}`,
        params: user_id ? { user_id } : undefined,
      }),
      providesTags: (_result, _error, { mission_id }) => [
        { type: "MissionDetail", id: mission_id },
      ],
    }),

    // Get blueprints rewarded by mission
    getMissionBlueprints: builder.query<BlueprintDetail[], string>({
      query: (mission_id) => `/${mission_id}/blueprints`,
      providesTags: (_result, _error, mission_id) => [
        { type: "MissionBlueprints", id: mission_id },
      ],
    }),

    // Rate mission (difficulty and satisfaction)
    rateMission: builder.mutation<RateMissionResponse, RateMissionRequest>({
      query: ({ mission_id, body }) => ({
        url: `/${mission_id}/rate`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { mission_id }) => [
        { type: "MissionDetail", id: mission_id },
        "Missions",
      ],
    }),
  }),
})

// Export hooks
export const {
  useSearchMissionsQuery,
  useGetMissionDetailQuery,
  useGetMissionBlueprintsQuery,
  useRateMissionMutation,
} = missionsApi
