import { generatedApi as api } from "../generatedApi"

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';
import NoteAddRounded from '@mui/icons-material/NoteAddRounded';

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
  show_in_filters: boolean
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
  show_in_filters?: boolean
}

export interface UpdateAttributeDefinitionPayload {
  display_name?: string
  attribute_type?: "select" | "multiselect" | "range" | "text"
  allowed_values?: string[] | null
  applicable_item_types?: string[] | null
  display_order?: number
  show_in_filters?: boolean
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
        { applicable_item_types?: string[]; include_hidden?: boolean } | void
      >({
        query: (args) => ({
          url: `/api/attributes/definitions`,
          params: args
            ? {
                ...(args.applicable_item_types
                  ? { applicable_item_types: args.applicable_item_types }
                  : {}),
                ...(args.include_hidden ? { include_hidden: "true" } : {}),
              }
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

      // Search attribute values
      searchAttributeValues: build.query<
        string[],
        {
          attributeName: string
          query: string
          itemType?: string
          limit?: number
        }
      >({
        query: ({ attributeName, query, itemType, limit }) => ({
          url: "/api/attributes/values/search",
          params: {
            attribute_name: attributeName,
            q: query,
            item_type: itemType,
            limit,
          },
        }),
        transformResponse: (response: { data: { values: string[] } }) =>
          response.data.values,
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
  useLazySearchAttributeValuesQuery,
} = injectedRtkApi
