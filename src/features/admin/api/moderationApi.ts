import { BACKEND_URL } from "../../../util/constants"
import { serviceApi } from "../../../store/service"
import { unwrapResponse } from "../../../store/api-utils"
import { MinimalUser } from "../../../datatypes/User"

const baseUrl = `${BACKEND_URL}/api/moderation`

// Reporting content (v1 /api/moderation). Admin report handling is v2
// (generated: useListContentReportsQuery, useUpdateContentReportMutation).
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
      providesTags: () => [
        "ModerationReports" as const,
        { type: "ModerationReports" as const },
      ],
      transformResponse: unwrapResponse,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useReportContentMutation, useGetUserReportsQuery } =
  moderationApi
