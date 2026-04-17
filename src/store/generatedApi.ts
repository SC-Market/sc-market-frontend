/**
 * Base API slice for OpenAPI-generated endpoints (src/store/api/*).
 * Codegen injects endpoints here; hand-written feature APIs use serviceApi.
 */
import { BACKEND_URL } from "../util/constants"
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react"

// Create base query with retry logic and exponential backoff
const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: `${BACKEND_URL}`,
    credentials: "include",
  }),
  {
    maxRetries: 3,
    // Exponential backoff: 1s, 2s, 4s
    backoff: (attempt) => {
      return new Promise((resolve) => {
        setTimeout(resolve, Math.min(1000 * 2 ** attempt, 30000))
      })
    },
  }
)

export const generatedApi = createApi({
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  reducerPath: "generatedApi",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  // Cache persists for 10 minutes (600 seconds) across page navigation
  keepUnusedDataFor: 600,
  tagTypes: [], // Generated slices add their own via enhanceEndpoints
})
