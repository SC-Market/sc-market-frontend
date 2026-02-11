import { MinimalUser, User } from "./User"
import { Contractor, MinimalContractor } from "./Contractor"
import { ContractKindIconKey } from "../views/contracts/ServiceListings"
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded"
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded"
import FlightRoundedIcon from "@mui/icons-material/FlightRounded"
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded"
import PublicRoundedIcon from "@mui/icons-material/PublicRounded"
import MiscellaneousServicesRoundedIcon from "@mui/icons-material/MiscellaneousServicesRounded"
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded"
import React from "react"
import { AvailabilitySelection } from "../hooks/login/UserProfile"
import { OfferMarketListing } from "../store/offer"

import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export const orderIcons = {
  Support: <HandymanRoundedIcon />,
  Escort: <GppGoodRoundedIcon />,
  Transport: <FlightRoundedIcon />,
  Construction: <ConstructionRoundedIcon />,
  "Resource Acquisition": <PublicRoundedIcon />,
  Rental: <CarRentalRounded />,
  Delivery: <LocalShippingRoundedIcon />,
  Medical: <LocalHospitalRounded />,
  "Intelligence Services": <InfoRounded />,
  Misc: <MiscellaneousServicesRoundedIcon />,
  Custom: <MiscellaneousServicesRoundedIcon />,
}

export type OrderStatus =
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled"

export type OrderKind = keyof typeof orderIcons

export interface Order {
  order_id: string
  status: OrderStatus
  kind: OrderKind
  cost: number
  rush: boolean
  assigned_to: string | null
  contractor: string | null
  customer: string
  title: string
  description: string
  timestamp: string
  comments: OrderComment[]
  applicants: OrderApplicant[]
  market_listings?: OfferMarketListing[]
  customer_review?: OrderReview
  contractor_review?: OrderReview
  service_id?: string | null
  payment_type: PaymentType
  availability?: OrderAvailability
  offer_session_id: string | null
  discord_thread_id: string | null
  discord_server_id: string | null
  discord_invite: string | null
}

export interface OrderAvailability {
  customer: AvailabilitySelection[]
  assigned: AvailabilitySelection[] | null
}

export interface OrderApplicant {
  order_id: string
  user_applicant: MinimalUser | null
  org_applicant: MinimalContractor | null
  timestamp: number
  message: string
}

export interface OrderBody {
  title: string
  rush: boolean
  description: string
  kind: string
  collateral: number
  departure: string | null
  destination: string | null
  cost: number
  contractor?: string | null
  assigned_to?: string | null
  service_id?: string | null
  payment_type: PaymentType
}

export interface ServiceBody {
  service_name: string
  service_description: string
  title: string
  rush: boolean
  description: string
  kind: string
  collateral: number
  departure: string | null
  destination: string | null
  cost: number
  payment_type: PaymentType
  contractor?: string | null
  status: string
  photos: string[]
}

export type PaymentType =
  | "one-time"
  | "hourly"
  | "daily"
  | "unit"
  | "box"
  | "scu"
  | "cscu"
  | "mscu"

export interface Service {
  timestamp: string
  service_id: string
  service_name: string
  service_description: string
  title: string
  rush: boolean
  description: string
  kind: ContractKindIconKey
  collateral: number
  offer: number
  payment_type: PaymentType
  departure: string | null
  destination: string | null
  cost: number
  contractor?: Contractor | null
  user?: User | null
  status: "active" | "inactive"
  photos: string[]
  languages?: Array<{ code: string; name: string }>
}

export interface OrderComment {
  author: User
  content: string
  timestamp: number
  comment_id: string
  order_id: string
}

export interface OrderReview {
  user_author: MinimalUser | null
  contractor_author: MinimalContractor | null
  content: string
  timestamp: number
  review_id: string
  order_id: string
  rating: number
  role: "customer" | "contractor"
  revision_requested: boolean
  revision_requested_at: string | null
  last_modified_at: string
  revision_message: string | null
}

export interface OrderTrendDatapoint {
  All: number
  Fulfilled: number
  "Not Started": number
  name: string
  "In-Progress": number
}

export function makeOrderTrend(): {
  data: OrderTrendDatapoint[]
  labels: string[]
} {
  const data = [
    {
      name: "Dec 11",
      All: 8,
      Fulfilled: 1,
      "Not Started": 3,
      "In-Progress": 4,
    },
    {
      name: "Dec 12",
      All: 12,
      Fulfilled: 5,
      "Not Started": 3,
      "In-Progress": 4,
    },
    {
      name: "Dec 13",
      All: 10,
      Fulfilled: 3,
      "Not Started": 2,
      "In-Progress": 5,
    },
    {
      name: "Dec 14",
      All: 7,
      Fulfilled: 3,
      "Not Started": 2,
      "In-Progress": 2,
    },
    {
      name: "Dec 15",
      All: 15,
      Fulfilled: 5,
      "Not Started": 5,
      "In-Progress": 5,
    },
  ]

  return {
    data: data,
    labels: ["All", "Fulfilled", "Not Started", "In-Progress"],
  }
}

export interface OrderStub {
  order_id: string
  contractor: MinimalContractor | null
  assigned_to: MinimalUser | null
  customer: MinimalUser
  status: OrderStatus
  timestamp: string
  service_name: string | null
  cost: string
  title: string
  payment_type: string
  count: number
  kind: string
}

export type OrderSearchSortMethod =
  | "title"
  | "customer_name"
  | "status"
  | "timestamp"
  | "contractor_name"

export type OrderSearchStatus =
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled"
  | "active"
  | "past"

export interface OrderSearchQuery {
  sort_method?: OrderSearchSortMethod
  status?:
    | "fulfilled"
    | "in-progress"
    | "not-started"
    | "cancelled"
    | "active"
    | "past"
  assigned?: string
  contractor?: string
  customer?: string
  index?: number
  page_size?: number
  reverse_sort?: boolean
  buyer_username?: string
  seller_username?: string
  has_market_listings?: boolean
  has_service?: boolean
  cost_min?: number
  cost_max?: number
  date_from?: string
  date_to?: string
}

export interface OrderAnalytics {
  daily_totals: Array<{
    date: string
    total: number
    in_progress: number
    fulfilled: number
    cancelled: number
    not_started: number
  }>
  weekly_totals: Array<{
    date: string
    total: number
    in_progress: number
    fulfilled: number
    cancelled: number
    not_started: number
  }>
  monthly_totals: Array<{
    date: string
    total: number
    in_progress: number
    fulfilled: number
    cancelled: number
    not_started: number
    average_fulfilled_value?: number
  }>
  top_contractors: Array<{
    name: string
    fulfilled_orders: number
    total_orders: number
  }>
  top_users: Array<{
    username: string
    fulfilled_orders: number
    total_orders: number
  }>
  summary: {
    total_orders: number
    active_orders: number
    completed_orders: number
    total_value: number
  }
}
