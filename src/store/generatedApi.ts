/**
 * Base API slice for OpenAPI-generated endpoints (src/store/api/*).
 * Codegen injects endpoints here; hand-written feature APIs use serviceApi.
 */
import { BACKEND_URL } from "../util/constants"
import { createApi } from "@reduxjs/toolkit/query/react"
import { createBaseQuery } from "./baseQuery"

export const generatedApi = createApi({
  baseQuery: createBaseQuery({ baseUrl: `${BACKEND_URL}`, retry: true }),
  endpoints: () => ({}),
  reducerPath: "generatedApi",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [],
})
