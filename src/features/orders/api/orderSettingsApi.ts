import type {
  OrderSetting,
  CreateOrderSettingRequest,
  UpdateOrderSettingRequest,
  OrderLimits,
} from "../domain/types"
import { serviceApi } from "../../../store/service"

export const orderSettingsApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    // User order settings
    getUserOrderSettings: builder.query<OrderSetting[], void>({
      query: () => "/api/orders/settings",
      transformResponse: (response: { data: { settings: OrderSetting[] } }) =>
        response.data.settings,
      providesTags: ["OrderSettings"],
    }),
    createUserOrderSetting: builder.mutation<
      { setting: OrderSetting },
      CreateOrderSettingRequest
    >({
      query: (setting) => ({
        url: "/api/orders/settings",
        method: "POST",
        body: setting,
      }),
      transformResponse: (response: { data: { setting: OrderSetting } }) =>
        response.data,
      invalidatesTags: ["OrderSettings"],
    }),
    updateUserOrderSetting: builder.mutation<
      { setting: OrderSetting },
      { id: string } & UpdateOrderSettingRequest
    >({
      query: ({ id, ...updates }) => ({
        url: `/api/orders/settings/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: { data: { setting: OrderSetting } }) =>
        response.data,
      invalidatesTags: ["OrderSettings"],
    }),
    deleteUserOrderSetting: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/orders/settings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrderSettings"],
    }),

    // Contractor order settings
    getContractorOrderSettings: builder.query<OrderSetting[], string>({
      query: (contractorId) =>
        `/api/orders/contractors/${contractorId}/settings`,
      transformResponse: (response: { data: { settings: OrderSetting[] } }) =>
        response.data.settings,
      providesTags: (_result, _error, contractorId) => [
        { type: "OrderSettings", id: contractorId },
      ],
    }),
    createContractorOrderSetting: builder.mutation<
      { setting: OrderSetting },
      { contractorId: string } & CreateOrderSettingRequest
    >({
      query: ({ contractorId, ...setting }) => ({
        url: `/api/orders/contractors/${contractorId}/settings`,
        method: "POST",
        body: setting,
      }),
      transformResponse: (response: { data: { setting: OrderSetting } }) =>
        response.data,
      invalidatesTags: (_result, _error, { contractorId }) => [
        { type: "OrderSettings", id: contractorId },
      ],
    }),
    updateContractorOrderSetting: builder.mutation<
      { setting: OrderSetting },
      { contractorId: string; id: string } & UpdateOrderSettingRequest
    >({
      query: ({ contractorId, id, ...updates }) => ({
        url: `/api/orders/contractors/${contractorId}/settings/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: { data: { setting: OrderSetting } }) =>
        response.data,
      invalidatesTags: (_result, _error, { contractorId }) => [
        { type: "OrderSettings", id: contractorId },
      ],
    }),
    deleteContractorOrderSetting: builder.mutation<
      void,
      { contractorId: string; id: string }
    >({
      query: ({ contractorId, id }) => ({
        url: `/api/orders/contractors/${contractorId}/settings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { contractorId }) => [
        { type: "OrderSettings", id: contractorId },
      ],
    }),

    // Availability requirement checks
    checkContractorAvailabilityRequirement: builder.query<
      { required: boolean; hasAvailability: boolean },
      string
    >({
      query: (spectrumId) => ({
        url: `/api/orders/availability/contractor/${spectrumId}/check`,
      }),
      transformResponse: (response: {
        data: { required: boolean; hasAvailability: boolean }
      }) => response.data,
      providesTags: (_result, _error, spectrumId) => [
        { type: "AvailabilityRequirement" as const, id: `contractor:${spectrumId}` },
      ],
    }),
    checkUserAvailabilityRequirement: builder.query<
      { required: boolean; hasAvailability: boolean },
      string
    >({
      query: (username) => ({
        url: `/api/orders/availability/user/${username}/check`,
      }),
      transformResponse: (response: {
        data: { required: boolean; hasAvailability: boolean }
      }) => response.data,
      providesTags: (_result, _error, username) => [
        { type: "AvailabilityRequirement" as const, id: `user:${username}` },
      ],
    }),

    // Order limits checks
    checkContractorOrderLimits: builder.query<OrderLimits, string>({
      query: (spectrumId) => ({
        url: `/api/orders/limits/contractor/${spectrumId}/check`,
      }),
      transformResponse: (response: { data: { limits: OrderLimits } }) =>
        response.data.limits,
      providesTags: (_result, _error, spectrumId) => [
        { type: "OrderLimits" as const, id: `contractor:${spectrumId}` },
      ],
    }),
    checkUserOrderLimits: builder.query<OrderLimits, string>({
      query: (username) => ({
        url: `/api/orders/limits/user/${username}/check`,
      }),
      transformResponse: (response: { data: { limits: OrderLimits } }) =>
        response.data.limits,
      providesTags: (_result, _error, username) => [
        { type: "OrderLimits" as const, id: `user:${username}` },
      ],
    }),
  }),
})

export const {
  useGetUserOrderSettingsQuery,
  useCreateUserOrderSettingMutation,
  useUpdateUserOrderSettingMutation,
  useDeleteUserOrderSettingMutation,
  useGetContractorOrderSettingsQuery,
  useCreateContractorOrderSettingMutation,
  useUpdateContractorOrderSettingMutation,
  useDeleteContractorOrderSettingMutation,
  useCheckContractorAvailabilityRequirementQuery,
  useCheckUserAvailabilityRequirementQuery,
  useCheckContractorOrderLimitsQuery,
  useCheckUserOrderLimitsQuery,
} = orderSettingsApi
