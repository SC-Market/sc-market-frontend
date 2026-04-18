/**
 * Base API slice for OpenAPI-generated endpoints (src/store/api/*).
 * Codegen injects endpoints here; hand-written feature APIs use serviceApi.
 */
import { BACKEND_URL } from "../util/constants"
import {
  createApi,
  fetchBaseQuery,
  retry,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${BACKEND_URL}`,
  credentials: "include",
})

// Mutex to prevent parallel refresh calls
let refreshPromise: Promise<boolean> | null = null

/**
 * Wraps the base query with 401 → refresh → retry logic.
 * If the access token expires, POST /api/auth/refresh exchanges the refresh
 * cookie for a new access token, then retries the original request.
 * If refresh also fails, the user is redirected to /login.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    // If a refresh is already in flight, wait for it
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const r = await rawBaseQuery(
          { url: "/api/auth/refresh", method: "POST" },
          api,
          extraOptions,
        )
        return !!r.data
      })()
      refreshPromise.finally(() => { refreshPromise = null })
    }
    const refreshed = await refreshPromise
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions)
    }
    // If refresh failed, the 401 propagates and LoggedInRoute redirects to /login
  }

  return result
}

// Wrap with retry for non-401 errors (network issues, 500s, etc.)
const baseQueryWithRetry = retry(baseQueryWithReauth, {
  maxRetries: 3,
  backoff: (attempt) =>
    new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 30000))),
})

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
