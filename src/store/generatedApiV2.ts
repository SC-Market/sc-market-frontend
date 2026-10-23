/**
 * Base API slice for V2 OpenAPI-generated endpoints.
 * All V2 endpoints are prefixed with /api/v2 via the baseUrl.
 */
import { BACKEND_URL } from "../util/constants"
import { createApi } from "@reduxjs/toolkit/query/react"
import { createBaseQuery } from "./baseQuery"

export const generatedApiV2 = createApi({
  baseQuery: createBaseQuery({ baseUrl: `${BACKEND_URL}/api/v2`, retry: true }),
  endpoints: () => ({}),
  reducerPath: "generatedApiV2",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [],
})
