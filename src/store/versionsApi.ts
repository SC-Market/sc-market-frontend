/**
 * Versions API - RTK Query hooks for game version management
 * 
 * Provides hooks for version selection and retrieval.
 * Requirements: 13.1-13.6, 45.1-45.10
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_URL } from "../util/constants"

// ============================================================================
// Types
// ============================================================================

export interface GameVersion {
  version_id: string
  version_type: "LIVE" | "PTU" | "EPTU"
  version_number: string
  build_number?: string
  release_date?: string
  is_active: boolean
  last_data_update?: string
  created_at: string
  updated_at: string
}

export interface ActiveVersionsResponse {
  LIVE?: GameVersion
  PTU?: GameVersion
  EPTU?: GameVersion
}

export interface SelectVersionRequest {
  version_id: string
}

export interface SelectVersionResponse {
  success: boolean
  version: GameVersion
}

// ============================================================================
// API Definition
// ============================================================================

export const versionsApi = createApi({
  reducerPath: "versionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/v2/game-data/versions`,
    credentials: "include",
  }),
  tagTypes: ["Versions"],
  endpoints: (builder) => ({
    // List all versions
    listVersions: builder.query<GameVersion[], void>({
      query: () => "/",
      providesTags: ["Versions"],
    }),

    // Get active versions (one per type)
    getActiveVersions: builder.query<ActiveVersionsResponse, void>({
      query: () => "/active",
      providesTags: ["Versions"],
    }),

    // Select user's preferred version
    selectVersion: builder.mutation<SelectVersionResponse, SelectVersionRequest>({
      query: (body) => ({
        url: "/select",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Versions"],
    }),
  }),
})

// Export hooks
export const {
  useListVersionsQuery,
  useGetActiveVersionsQuery,
  useSelectVersionMutation,
} = versionsApi
