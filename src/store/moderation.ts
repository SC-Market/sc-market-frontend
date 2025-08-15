import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"
import { unwrapResponse } from "./orders"
import { MinimalUser } from "../datatypes/User"

const baseUrl = `${BACKEND_URL}/api/moderation`

// Define moderation-related types based on the actual OpenAPI spec
export interface ContentReport {
  report_id: string
  reporter: MinimalUser
  reported_url: string
  report_reason:
    | "inappropriate_content"
    | "spam"
    | "harassment"
    | "fake_listing"
    | "scam"
    | "copyright_violation"
    | "other"
  report_details?: string
  status: string
  created_at: string
  handled_at?: string
  handled_by?: MinimalUser
  notes?: string
}

export interface CreateReportRequest {
  reported_url: string
  report_reason:
    | "inappropriate_content"
    | "spam"
    | "harassment"
    | "fake_listing"
    | "scam"
    | "copyright_violation"
    | "other"
  report_details?: string
}

export interface CreateReportResponse {
  result: string
  report_id: string
}

export interface UserReportsResponse {
  reports: ContentReport[]
}

export interface PaginationParams {
  page?: number
  page_size?: number
  status?: "pending" | "in_progress" | "resolved" | "dismissed"
  reporter_id?: string
}

export interface AdminReportsResponse {
  reports: ContentReport[]
  pagination: {
    page: number
    page_size: number
    total_reports: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Define a service using a base URL and expected endpoints
export const moderationApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Report content for moderation
    reportContent: builder.mutation<CreateReportResponse, CreateReportRequest>({
      query: (body) => ({
        url: `${baseUrl}/report`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "ModerationReports" as const,
        { type: "ModerationReports" as const },
      ],
      transformResponse: unwrapResponse,
    }),

    // Get user's own content reports
    getUserReports: builder.query<UserReportsResponse, void>({
      query: () => `${baseUrl}/reports`,
      providesTags: (result, error, arg) => [
        "ModerationReports" as const,
        { type: "ModerationReports" as const },
      ],
      transformResponse: unwrapResponse,
    }),

    // Get all reports for admin with pagination and filtering
    getAdminReports: builder.query<AdminReportsResponse, PaginationParams>({
      query: (params) => ({
        url: `${baseUrl}/admin/reports`,
        method: "GET",
        params: {
          page: params.page || 1,
          page_size: params.page_size || 20,
          ...(params.status && { status: params.status }),
          ...(params.reporter_id && { reporter_id: params.reporter_id }),
        },
      }),
      providesTags: (result, error, arg) => [
        "ModerationReports" as const,
        { type: "ModerationReports" as const },
      ],
      transformResponse: unwrapResponse,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useReportContentMutation,
  useGetUserReportsQuery,
  useGetAdminReportsQuery,
} = moderationApi
