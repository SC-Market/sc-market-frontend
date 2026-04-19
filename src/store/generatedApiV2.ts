/**
 * Base API slice for V2 OpenAPI-generated endpoints.
 * All V2 endpoints are prefixed with /api/v2 via the baseUrl.
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
  baseUrl: `${BACKEND_URL}/api/v2`,
  credentials: "include",
})

let refreshPromise: Promise<boolean> | null = null

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    if (!refreshPromise) {
      // Use the root URL for auth refresh, not /api/v2
      const authQuery = fetchBaseQuery({
        baseUrl: `${BACKEND_URL}`,
        credentials: "include",
      })
      refreshPromise = (async () => {
        const r = await authQuery(
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
  }

  return result
}

const baseQueryWithRetry = retry(baseQueryWithReauth, {
  maxRetries: 3,
  backoff: (attempt) =>
    new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 30000))),
})

export const generatedApiV2 = createApi({
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  reducerPath: "generatedApiV2",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [],
})
