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
      if (!refreshPromise) {
        const authQuery = fetchBaseQuery({ baseUrl: `${BACKEND_URL}`, credentials: "include" })
        refreshPromise = (async () => {
          const r = await authQuery({ url: "/api/auth/refresh", method: "POST" }, api, extraOptions)
          return !!r.data
        })()
        refreshPromise.finally(() => { refreshPromise = null })
      }
      const refreshed = await refreshPromise
      if (refreshed) result = await query(args, api, extraOptions)
    }
    return result
  }
}

const baseQueryWithRetry = retry(baseQueryWithReauth, {
  maxRetries: 2,
  backoff: (attempt) =>
    new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 10000))),
  retryCondition: (_error, _args, { attempt, baseQueryApi, extraOptions }) => {
    // Only retry on network errors or 5xx server errors
    const status = (_error as any)?.status
    if (typeof status === "number" && status >= 400 && status < 500) return false
    return attempt < 2
  },
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
