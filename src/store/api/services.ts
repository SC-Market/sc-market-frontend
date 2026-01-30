import { generatedApi as api } from "../generatedApi"
export const addTagTypes = ["Services"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createService: build.mutation<
        CreateServiceApiResponse,
        CreateServiceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services`,
          method: "POST",
          body: queryArg.serviceBody,
        }),
        invalidatesTags: ["Services"],
      }),
      getServicesByUser: build.query<
        GetServicesByUserApiResponse,
        GetServicesByUserApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services/user/${queryArg.username}`,
        }),
        providesTags: ["Services"],
      }),
      getPublicServices: build.query<
        GetPublicServicesApiResponse,
        GetPublicServicesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services/public`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            search: queryArg.search,
            kind: queryArg.kind,
            minCost: queryArg.minCost,
            maxCost: queryArg.maxCost,
            paymentType: queryArg.paymentType,
            sortBy: queryArg.sortBy,
            sortOrder: queryArg.sortOrder,
          },
        }),
        providesTags: ["Services"],
      }),
      getServicesByContractor: build.query<
        GetServicesByContractorApiResponse,
        GetServicesByContractorApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services/contractor/${queryArg.spectrumId}`,
        }),
        providesTags: ["Services"],
      }),
      updateService: build.mutation<
        UpdateServiceApiResponse,
        UpdateServiceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services/${queryArg.serviceId}`,
          method: "PUT",
          body: queryArg.serviceBody,
        }),
        invalidatesTags: ["Services"],
      }),
      getServiceById: build.query<
        GetServiceByIdApiResponse,
        GetServiceByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/services/${queryArg.serviceId}` }),
        providesTags: ["Services"],
      }),
      uploadServicePhotos: build.mutation<
        UploadServicePhotosApiResponse,
        UploadServicePhotosApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services/${queryArg.serviceId}/photos`,
          method: "POST",
        }),
        invalidatesTags: ["Services"],
      }),
      trackServiceView: build.mutation<
        TrackServiceViewApiResponse,
        TrackServiceViewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services/${queryArg.serviceId}/view`,
          method: "POST",
        }),
        invalidatesTags: ["Services"],
      }),
      getServiceAnalytics: build.query<
        GetServiceAnalyticsApiResponse,
        GetServiceAnalyticsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/services/seller/analytics`,
          params: {
            period: queryArg.period,
          },
        }),
        providesTags: ["Services"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as servicesApi }
export type CreateServiceApiResponse =
  /** status 201 Created - Resource successfully created */ {}
export type CreateServiceApiArg = {
  serviceBody: ServiceBody
}
export type GetServicesByUserApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: Order[]
  }
export type GetServicesByUserApiArg = {
  /** The username of the user */
  username: string
}
export type GetPublicServicesApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: Order[]
    pagination: {
      currentPage: number
      pageSize: number
      totalItems: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
export type GetPublicServicesApiArg = {
  /** Page number (0-based) */
  page?: number
  /** Number of items per page */
  pageSize?: number
  /** Search term for service name and description */
  search?: string
  /** Filter by service kind */
  kind?: string
  /** Minimum cost filter */
  minCost?: number
  /** Maximum cost filter */
  maxCost?: number
  /** Filter by payment type */
  paymentType?:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  /** Field to sort by */
  sortBy?: "timestamp" | "cost" | "service_name"
  /** Sort order */
  sortOrder?: "asc" | "desc"
}
export type GetServicesByContractorApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: Order[]
  }
export type GetServicesByContractorApiArg = {
  /** The Spectrum ID of the contractor */
  spectrumId: string
}
export type UpdateServiceApiResponse =
  /** status 204 Updated - Resource successfully updated */ {}
export type UpdateServiceApiArg = {
  serviceId: string
  serviceBody: ServiceBody
}
export type GetServiceByIdApiResponse =
  /** status 200 OK - Successful request with response body */ Order
export type GetServiceByIdApiArg = {
  serviceId: string
}
export type UploadServicePhotosApiResponse =
  /** status 200 Photos uploaded successfully */ PhotoUploadResponse
export type UploadServicePhotosApiArg = {
  /** ID of the service to upload photos for */
  serviceId: string
}
export type TrackServiceViewApiResponse =
  /** status 200 View tracked successfully */ {
    message: string
  }
export type TrackServiceViewApiArg = {
  /** ID of the service to track view for */
  serviceId: string
}
export type GetServiceAnalyticsApiResponse =
  /** status 200 Analytics retrieved successfully */ {
    data: {
      services: number
      total_service_views: number
      time_period: string
      user_id: string
    }
  }
export type GetServiceAnalyticsApiArg = {
  /** Time period for analytics (7d, 30d, 90d) */
  period?: "7d" | "30d" | "90d"
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type Unauthorized = {
  message: "Unauthorized"
}
export type Forbidden = {
  message: "Forbidden"
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
export type ServiceBody = {
  service_name: string
  service_description: string
  title: string
  rush: boolean
  description: string
  kind?:
    | "Escort"
    | "Transport"
    | "Construction"
    | "Support"
    | "Resource Acquisition"
    | "Rental"
    | "Custom"
    | "Delivery"
    | "Medical"
    | "Intelligence Services"
  collateral: number
  departure: string | null
  destination: string | null
  cost: number
  payment_type:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  contractor?: string | null
  status: "active" | "inactive"
  photos: string[]
}
export type ServiceStatus = "active" | "inactive"
export type Order = {
  service_id?: string
  service_name?: string
  service_description?: string
  title: string
  rush: boolean
  description: string
  kind: string
  collateral?: number
  offer?: number
  payment_type: "one-time" | "daily" | "hourly"
  departure?: string | null
  destination?: string | null
  cost: number
  user?: string | null
  contractor: string | null
  status: ServiceStatus
  timestamp: string
  photos?: string[]
}
export type NotFound = {
  message: "Not Found"
}
export type PhotoUploadResponse = {
  /** Success message */
  result: string
  photos: {
    /** Unique identifier for the uploaded photo */
    resource_id: string
    /** CDN URL for the uploaded photo */
    url: string
  }[]
}
export type ServerError = {
  message: "Internal Server Error"
}
export const {
  useCreateServiceMutation,
  useGetServicesByUserQuery,
  useGetPublicServicesQuery,
  useGetServicesByContractorQuery,
  useUpdateServiceMutation,
  useGetServiceByIdQuery,
  useUploadServicePhotosMutation,
  useTrackServiceViewMutation,
  useGetServiceAnalyticsQuery,
} = injectedRtkApi
