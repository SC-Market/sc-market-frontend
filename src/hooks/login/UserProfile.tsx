import {
  Contractor,
  ContractorInvite,
  MinimalContractor,
} from "../../datatypes/Contractor"
import { Order, OrderComment, OrderReview } from "../../datatypes/Order"
import { MarketBid, MarketListing } from "../../datatypes/MarketListing"
import { MinimalUser } from "../../datatypes/User"
import { OfferSession } from "../../store/offer"

export interface Notification {
  read: boolean
  notification_id: string
  action: string
  entity_type: string
  entity:
    | ContractorInvite
    | Order
    | Contractor
    | MarketListing
    | MarketBid
    | OrderReview
    | OrderComment
    | OfferSession
  timestamp: string
  actors: MinimalUser[]
}

export interface AccountSettings {
  discord_order_share: boolean
  discord_public: boolean
}

export interface AccountSettingsBody {
  discord_order_share?: boolean
  discord_public?: boolean
}

export interface AvailabilitySelection {
  start: number
  finish: number
}

export interface AccountAvailabilityBody {
  contractor: string | null
  selections: AvailabilitySelection[]
}

export interface AccountAvailability {
  contractor: string | null
  selections: AvailabilitySelection[]
}

export interface UserProfileState {
  username: string
  display_name: string
  discord_username: string
  avatar: string
  role: "user" | "admin"
  contractors: (MinimalContractor & { roles: string[]; role: string })[]
  balance: number
  rsi_confirmed?: boolean
  profile_description: string
  // notifications: Notification[],
  settings: AccountSettings
  // TODO: Factor this out of user and move it to shop
  market_order_template: string
  locale: string
}
