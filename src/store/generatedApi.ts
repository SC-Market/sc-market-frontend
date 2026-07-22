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
import { refreshAuth } from "./refreshAuth"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${BACKEND_URL}`,
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

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await baseQueryWithReauth(args, api, extraOptions)
    if (result.error?.status === 401) {
      retry.fail(result.error)
    }
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

export const generatedApi = createApi({
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  reducerPath: "generatedApi",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [],
})
