import { serviceApi } from "./service"
import { Service, ServiceBody } from "../datatypes/Order"
import { unwrapResponse } from "./orders"

// Define the photo upload response type based on OpenAPI spec
interface PhotoUploadResponse {
  result: string
  photos: Array<{
    resource_id: string
    url: string
  }>
}

const servicesApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getServices: builder.query<Service[], string>({
      query: (username) => `/api/services/user/${username}`,
      providesTags: (result, error, order_id) => ["Service" as const],
      transformResponse: unwrapResponse,
    }),
    getPublicServices: builder.query<Service[], void>({
      query: () => `/api/services/public`,
      providesTags: (result, error, order_id) => ["Service" as const],
      transformResponse: unwrapResponse,
    }),
    getServiceById: builder.query<Service, string>({
      query: (service_id) => `/api/services/${service_id}`,
      providesTags: (result, error, service_id) => [
        { type: "Service" as const, id: service_id },
      ],
      transformResponse: unwrapResponse,
    }),
    getServicesContractor: builder.query<Service[], string>({
      query: (spectrum_id) => `/api/services/contractor/${spectrum_id}`,
      providesTags: (result, error, order_id) => [
        { type: "Service" as const, id: order_id },
      ],
      transformResponse: unwrapResponse,
    }),
    createService: builder.mutation<void, ServiceBody>({
      query: (body) => ({
        url: `/api/services`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Service" as const, { type: "Service" as const }],
    }),
    updateService: builder.mutation<
      void,
      {
        service_id: string
        body: ServiceBody
      }
    >({
      query: ({ service_id, body }) => ({
        url: `/api/services/${service_id}`,
        method: "PUT",
        body,
        transformResponse: unwrapResponse,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Service" as const, { type: "Service" as const }],
    }),
    uploadServicePhotos: builder.mutation<
      PhotoUploadResponse,
      {
        service_id: string
        photos: File[]
      }
    >({
      query: ({ service_id, photos }) => {
        const formData = new FormData()
        photos.forEach((photo, index) => {
          formData.append(`photos`, photo)
        })

        return {
          url: `/api/services/${service_id}/photos`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
        }
      },
      invalidatesTags: (result, error, arg) => [
        // Invalidate the specific service by ID
        { type: "Service" as const, id: arg.service_id },
        // Invalidate general service tags to ensure all service queries are refreshed
        { type: "Service" as const },
      ],
    }),
  }),
})

export const {
  useGetPublicServicesQuery,
  useGetServicesContractorQuery,
  useGetServiceByIdQuery,
  useGetServicesQuery,
  useUpdateServiceMutation,
  useCreateServiceMutation,
  useUploadServicePhotosMutation,
} = servicesApi
