import { generatedApi as api } from "../generatedApi"

export const addTagTypes = [
  "AttributeDefinitions",
  "GameItemAttributes",
] as const

export interface AttributeDefinition {
  attribute_name: string
  display_name: string
  attribute_type: "select" | "multiselect" | "range" | "text"
  allowed_values: string[] | null
  applicable_item_types: string[] | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreateAttributeDefinitionPayload {
  attribute_name: string
  display_name: string
  attribute_type: "select" | "multiselect" | "range" | "text"
  allowed_values?: string[] | null
  applicable_item_types?: string[] | null
  display_order?: number
}

export interface UpdateAttributeDefinitionPayload {
  display_name?: string
  attribute_type?: "select" | "multiselect" | "range" | "text"
  allowed_values?: string[] | null
  applicable_item_types?: string[] | null
  display_order?: number
}

export interface GameItemAttribute {
  game_item_id: string
  attribute_name: string
  attribute_value: string
  created_at: string
  updated_at: string
  display_name?: string
  attribute_type?: string
}

export interface UpsertGameItemAttributePayload {
  attribute_name: string
  attribute_value: string
}

export interface ImportResult {
  gameItemId: string
  success: boolean
  attributesImported: number
  errors: string[]
  message: string
}

const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // Attribute Definitions
      getAttributeDefinitions: build.query<
        { definitions: AttributeDefinition[] },
        { applicable_item_types?: string[] } | void
      >({
        query: (args) => ({
          url: `/api/attributes/definitions`,
          params: args?.applicable_item_types
            ? { applicable_item_types: args.applicable_item_types }
            : undefined,
        }),
        transformResponse: (response: {
          data: { definitions: AttributeDefinition[] }
        }) => response.data,
        providesTags: ["AttributeDefinitions"],
      }),

      createAttributeDefinition: build.mutation<
        { definition: AttributeDefinition },
        CreateAttributeDefinitionPayload
      >({
        query: (payload) => ({
          url: `/api/attributes/definitions`,
          method: "POST",
          body: payload,
        }),
        transformResponse: (response: {
          data: { definition: AttributeDefinition }
        }) => response.data,
        invalidatesTags: ["AttributeDefinitions"],
      }),

      updateAttributeDefinition: build.mutation<
        { definition: AttributeDefinition },
        { name: string; data: UpdateAttributeDefinitionPayload }
      >({
        query: ({ name, data }) => ({
          url: `/api/attributes/definitions/${encodeURIComponent(name)}`,
          method: "PUT",
          body: data,
        }),
        transformResponse: (response: {
          data: { definition: AttributeDefinition }
        }) => response.data,
        invalidatesTags: ["AttributeDefinitions"],
      }),

      deleteAttributeDefinition: build.mutation<
        { message: string; cascade: boolean },
        { name: string; cascade?: boolean }
      >({
        query: ({ name, cascade }) => ({
          url: `/api/attributes/definitions/${encodeURIComponent(name)}`,
          method: "DELETE",
          params: cascade ? { cascade: "true" } : undefined,
        }),
        transformResponse: (response: {
          data: { message: string; cascade: boolean }
        }) => response.data,
        invalidatesTags: ["AttributeDefinitions", "GameItemAttributes"],
      }),

      // Game Item Attributes
      getGameItemAttributes: build.query<
        { attributes: GameItemAttribute[] },
        string
      >({
        query: (gameItemId) => ({
          url: `/api/attributes/game-items/${gameItemId}`,
        }),
        transformResponse: (response: {
          data: { attributes: GameItemAttribute[] }
        }) => response.data,
        providesTags: (result, error, gameItemId) => [
          { type: "GameItemAttributes", id: gameItemId },
        ],
      }),

      upsertGameItemAttribute: build.mutation<
        { attribute: GameItemAttribute },
        { gameItemId: string; data: UpsertGameItemAttributePayload }
      >({
        query: ({ gameItemId, data }) => ({
          url: `/api/attributes/game-items/${gameItemId}`,
          method: "PUT",
          body: data,
        }),
        transformResponse: (response: {
          data: { attribute: GameItemAttribute }
        }) => response.data,
        invalidatesTags: (result, error, { gameItemId }) => [
          { type: "GameItemAttributes", id: gameItemId },
        ],
      }),

      deleteGameItemAttribute: build.mutation<
        { message: string },
        { gameItemId: string; attributeName: string }
      >({
        query: ({ gameItemId, attributeName }) => ({
          url: `/api/attributes/game-items/${gameItemId}/${encodeURIComponent(attributeName)}`,
          method: "DELETE",
        }),
        transformResponse: (response: { data: { message: string } }) =>
          response.data,
        invalidatesTags: (result, error, { gameItemId }) => [
          { type: "GameItemAttributes", id: gameItemId },
        ],
      }),

      // Import
      importGameItemAttributes: build.mutation<ImportResult, string>({
        query: (gameItemId) => ({
          url: `/api/attributes/import/${gameItemId}`,
          method: "POST",
        }),
        transformResponse: (response: { data: ImportResult }) => response.data,
        invalidatesTags: (result, error, gameItemId) => [
          { type: "GameItemAttributes", id: gameItemId },
        ],
      }),
    }),
    overrideExisting: false,
  })

export { injectedRtkApi as attributesApi }

export const {
  useGetAttributeDefinitionsQuery,
  useCreateAttributeDefinitionMutation,
  useUpdateAttributeDefinitionMutation,
  useDeleteAttributeDefinitionMutation,
  useGetGameItemAttributesQuery,
  useUpsertGameItemAttributeMutation,
  useDeleteGameItemAttributeMutation,
  useImportGameItemAttributesMutation,
} = injectedRtkApi
