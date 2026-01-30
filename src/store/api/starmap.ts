import { generatedApi as api } from "../generatedApi"
export const addTagTypes = ["Starmap"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getStarmapRoute: build.query<
        GetStarmapRouteApiResponse,
        GetStarmapRouteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/starmap/route/${queryArg["from"]}/${queryArg.to}`,
        }),
        providesTags: ["Starmap"],
      }),
      getCelestialObject: build.query<
        GetCelestialObjectApiResponse,
        GetCelestialObjectApiArg
      >({
        query: (queryArg) => ({
          url: `/api/starmap/route/${queryArg.identifier}`,
        }),
        providesTags: ["Starmap"],
      }),
      searchStarmap: build.query<SearchStarmapApiResponse, SearchStarmapApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/starmap/search/${queryArg.query}`,
          }),
          providesTags: ["Starmap"],
        },
      ),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as starmapApi }
export type GetStarmapRouteApiResponse =
  /** status 200 Route retrieved successfully */ StarmapRoute
export type GetStarmapRouteApiArg = {
  /** Starting location */
  from: string
  /** Destination location */
  to: string
}
export type GetCelestialObjectApiResponse =
  /** status 200 Celestial object retrieved successfully */ StarmapObject
export type GetCelestialObjectApiArg = {
  /** Celestial object identifier */
  identifier: string
}
export type SearchStarmapApiResponse =
  /** status 200 Search results retrieved successfully */ StarmapSearchResult
export type SearchStarmapApiArg = {
  /** Search query */
  query: string
}
export type StarmapRoute = {
  /** Route distance */
  distance?: number
  /** Travel time in seconds */
  duration?: number
  waypoints?: {
    name?: string
    coordinates?: {
      x?: number
      y?: number
      z?: number
    }
  }[]
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type RateLimitError = {
  /** Error type identifier */
  error: "RATE_LIMIT_EXCEEDED"
  /** Human-readable error message */
  message: string
  /** Seconds to wait before retrying */
  retryAfter: number
  /** Maximum requests allowed per time window */
  limit: number
  /** Requests remaining in current window */
  remaining: number
  /** Unix timestamp when rate limit resets */
  resetTime: number
  /** User tier that triggered the rate limit */
  userTier: "anonymous" | "authenticated" | "admin"
  /** Endpoint that was rate limited */
  endpoint: string
}
export type ServerError = {
  message: "Internal Server Error"
}
export type StarmapObject = {
  id?: string
  name?: string
  type?: string
  coordinates?: {
    x?: number
    y?: number
    z?: number
  }
  description?: string | null
}
export type StarmapSearchResult = {
  results?: StarmapObject[]
}
export const {
  useGetStarmapRouteQuery,
  useGetCelestialObjectQuery,
  useSearchStarmapQuery,
} = injectedRtkApi
