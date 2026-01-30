/**
 * Base API slice for OpenAPI-generated endpoints (src/store/api/*).
 * Codegen injects endpoints here; hand-written feature APIs use serviceApi.
 */
import { BACKEND_URL } from "../util/constants"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const generatedApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}`,
    credentials: "include",
  }),
  endpoints: () => ({}),
  reducerPath: "generatedApi",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [], // Generated slices add their own via enhanceEndpoints
})
