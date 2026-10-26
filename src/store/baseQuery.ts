/**
 * The one base query factory used by every API slice.
 *
 * Environment-specific behaviour (credentials, extra headers, what to do on a
 * 401) comes from the store's NetworkEnv (see ./networkEnv), read per request
 * from RTK's `extra` argument — never from module state here.
 */
import {
  fetchBaseQuery,
  retry,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { getNetworkEnv, type NetworkEnv } from "./networkEnv"
import {
  MFA_CHALLENGE_CODES,
  isMfaEndpoint,
  mfaErrorCode,
  requestMfaChallenge,
} from "../features/mfa/challengeBroker"

export type AppBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>

export interface CreateBaseQueryOptions {
  baseUrl: string
  /**
   * Retry transient failures (network errors, 5xx) up to 3 times.
   * 4xx responses are never retried.
   */
  retry: boolean
}

const MAX_RETRIES = 3

export function createBaseQuery({
  baseUrl,
  retry: shouldRetry,
}: CreateBaseQueryOptions): AppBaseQuery {
  // fetchBaseQuery fixes credentials at creation, so build one per env.
  const rawQueries = new WeakMap<NetworkEnv, AppBaseQuery>()
  const rawQueryFor = (env: NetworkEnv): AppBaseQuery => {
    let rawQuery = rawQueries.get(env)
    if (!rawQuery) {
      rawQuery = fetchBaseQuery({
        baseUrl,
        credentials: env.credentials,
        prepareHeaders: (headers) => {
          for (const [name, value] of Object.entries(env.headers)) {
            headers.set(name, value)
          }
          return headers
        },
      })
      rawQueries.set(env, rawQuery)
    }
    return rawQuery
  }

  const baseQueryWithReauth: AppBaseQuery = async (args, api, extraOptions) => {
    const env = getNetworkEnv(api.extra)
    const rawQuery = rawQueryFor(env)
    let result = await rawQuery(args, api, extraOptions)
    if (result.error?.status === 401) {
      const refreshed = await env.onUnauthorized()
      if (refreshed) {
        result = await rawQuery(args, api, extraOptions)
      }
    }
    // Admin two-factor: 403 (not 401, which only refreshes) with an MFA code
    // means "verify, then try again". Retry once after a successful prompt.
    if (result.error?.status === 403 && !isMfaEndpoint(args)) {
      const kind = MFA_CHALLENGE_CODES[mfaErrorCode(result.error) ?? ""]
      if (kind && (await requestMfaChallenge(kind))) {
        result = await rawQuery(args, api, extraOptions)
      }
    }
    return result
  }

  if (!shouldRetry) return baseQueryWithReauth

  return retry(
    async (args: string | FetchArgs, api, extraOptions) => {
      const result = await baseQueryWithReauth(args, api, extraOptions)
      // Only retry transient network/5xx errors. Never retry 4xx client errors,
      // including 401 (already handled by reauth above) and 429 (rate limited)
      // — retrying a rate-limited request just amplifies the overload against
      // an already-limited endpoint.
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
    { maxRetries: MAX_RETRIES },
  )
}
