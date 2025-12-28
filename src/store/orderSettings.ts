import { serviceApi } from "./service"

export interface OrderSetting {
  id: string
  entity_type: "user" | "contractor"
  entity_id: string
  setting_type:
    | "offer_message"
    | "order_message"
    | "require_availability"
    | "stock_subtraction_timing"
    | "min_order_size"
    | "max_order_size"
    | "min_order_value"
    | "max_order_value"
  message_content: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface CreateOrderSettingRequest {
  setting_type:
    | "offer_message"
    | "order_message"
    | "require_availability"
    | "stock_subtraction_timing"
    | "min_order_size"
    | "max_order_size"
    | "min_order_value"
    | "max_order_value"
  message_content?: string // Optional for require_availability and stock_subtraction_timing
  enabled?: boolean
}

export interface OrderLimits {
  min_order_size?: string
  max_order_size?: string
  min_order_value?: string
  max_order_value?: string
}

export interface UpdateOrderSettingRequest {
  message_content?: string
  enabled?: boolean
}

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
      providesTags: (result, error, contractorId) => [
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
      invalidatesTags: (result, error, { contractorId }) => [
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
      invalidatesTags: (result, error, { contractorId }) => [
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
      invalidatesTags: (result, error, { contractorId }) => [
        { type: "OrderSettings", id: contractorId },
      ],
    }),

    // Check availability requirement for contractor
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
      providesTags: (result, error, spectrumId) => [
        {
          type: "AvailabilityRequirement" as const,
          id: `contractor:${spectrumId}`,
        },
      ],
    }),

    // Check availability requirement for user
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
      providesTags: (result, error, username) => [
        { type: "AvailabilityRequirement" as const, id: `user:${username}` },
      ],
    }),

    // Check order limits for contractor
    checkContractorOrderLimits: builder.query<OrderLimits, string>({
      query: (spectrumId) => ({
        url: `/api/orders/limits/contractor/${spectrumId}/check`,
      }),
      transformResponse: (response: { data: { limits: OrderLimits } }) =>
        response.data.limits,
      providesTags: (result, error, spectrumId) => [
        {
          type: "OrderLimits" as const,
          id: `contractor:${spectrumId}`,
        },
      ],
    }),

    // Check order limits for user
    checkUserOrderLimits: builder.query<OrderLimits, string>({
      query: (username) => ({
        url: `/api/orders/limits/user/${username}/check`,
      }),
      transformResponse: (response: { data: { limits: OrderLimits } }) =>
        response.data.limits,
      providesTags: (result, error, username) => [
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
