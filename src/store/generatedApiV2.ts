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
import { refreshAuth } from "./refreshAuth"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${BACKEND_URL}/api/v2`,
  credentials: "include",
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshed = await refreshAuth()
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions)
    }
  }

  return result
}

/**
 * Create a base query with reauth for a V2 sub-path.
 * Use this for standalone createApi instances that need the same auth handling.
 */
export function createV2BaseQuery(subPath: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const query = fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/v2${subPath}`,
    credentials: "include",
  })
  return async (args, api, extraOptions) => {
    let result = await query(args, api, extraOptions)
    if (result.error?.status === 401) {
      const refreshed = await refreshAuth()
      if (refreshed) result = await query(args, api, extraOptions)
    }
    return result
  }
}

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await baseQueryWithReauth(args, api, extraOptions)
    // Only retry transient network/5xx errors. Never retry 4xx client errors,
    // including 429 (rate limited) — retrying a rate-limited request just
    // amplifies the overload against an already-limited endpoint.
    if (
      result.error &&
      typeof result.error.status === "number" &&
      result.error.status >= 400 &&
      result.error.status < 500
    ) {
      retry.fail(result.error)
    }
    return result
  },
  {
    maxRetries: 3,
  },
)

export const generatedApiV2 = createApi({
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  reducerPath: "generatedApiV2",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [],
})
