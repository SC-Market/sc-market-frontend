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
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
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
  "PublicContracts",
  "Public Contracts",
  "Offers",
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createPublicContract: build.mutation<
        CreatePublicContractApiResponse,
        CreatePublicContractApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contracts`,
          method: "POST",
          body: queryArg.publicContractBody,
        }),
        invalidatesTags: ["PublicContracts", "Public Contracts"],
      }),
      getPublicContracts: build.query<
        GetPublicContractsApiResponse,
        GetPublicContractsApiArg
      >({
        query: () => ({ url: `/api/contracts` }),
        providesTags: ["PublicContracts", "Public Contracts"],
      }),
      createContractOffer: build.mutation<
        CreateContractOfferApiResponse,
        CreateContractOfferApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contracts/${queryArg.contractId}/offers`,
          method: "POST",
          body: queryArg.publicContractOfferBody,
        }),
        invalidatesTags: ["PublicContracts", "Public Contracts", "Offers"],
      }),
      getPublicContract: build.query<
        GetPublicContractApiResponse,
        GetPublicContractApiArg
      >({
        query: (queryArg) => ({ url: `/api/contracts/${queryArg.contractId}` }),
        providesTags: ["PublicContracts", "Public Contracts"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as contractsApi }
export type CreatePublicContractApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {
      contract_id?: string
    }
  }
export type CreatePublicContractApiArg = {
  publicContractBody: PublicContractBody
}
export type GetPublicContractsApiResponse =
  /** status 200 OK - Successful request with response body */ PublicContractBody2[]
export type GetPublicContractsApiArg = void
export type CreateContractOfferApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {
      session_id?: string
    }
  }
export type CreateContractOfferApiArg = {
  contractId: string
  publicContractOfferBody: PublicContractOfferBody
}
export type GetPublicContractApiResponse =
  /** status 200 OK - Successful request with response body */ PublicContractBody2
export type GetPublicContractApiArg = {
  contractId: string
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
export type PublicContractBody = {
  title: string
  description: string
  kind:
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
  departure?: string | null
  destination?: string | null
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
}
export type Rating = {
  avg_rating: number
  rating_count: number
  streak: number
  total_orders: number
}
export type MinimalUser = {
  username: string
  display_name: string
  avatar: string
  rating: Rating
  discord_profile?: {
    id: string
    discriminator: string
    username: string
  } | null
}
export type PublicContractBody2 = {
  title: string
  description: string
  kind:
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
  customer: MinimalUser
}
export type NotFound = {
  message: "Not Found"
}
export type PublicContractOfferBody = {
  title?: string
  description?: string
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
  collateral?: number
  departure?: string | null
  destination?: string | null
  cost?: number
  payment_type?:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  /** The contractor to apply on behalf of */
  contractor?: string
}
export const {
  useCreatePublicContractMutation,
  useGetPublicContractsQuery,
  useCreateContractOfferMutation,
  useGetPublicContractQuery,
} = injectedRtkApi
