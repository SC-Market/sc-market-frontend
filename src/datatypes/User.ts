import { Rating } from "./Contractor"

import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export interface User {
  username: string
  display_name: string
  orders: number
  spent: number
  avatar: string
  banner: string
  // [key: string]: string | number
  contractors: {
    spectrum_id: string
    roles: string[]
    name: string
    role_details?: { role_id: string; role_name: string; position: number }[]
  }[]
  profile_description: string
  rating: Rating
  badges?: {
    badge_ids: string[]
    metadata: any
  } | null
  discord_profile?: {
    id: string
    discriminator: string
    username: string
  }
  created_at?: number
  market_order_template: string
  rsi_confirmed: boolean
  languages?: Array<{ code: string; name: string }>
}

export interface MinimalUser {
  username: string
  display_name: string
  avatar: string
  rating: Rating
  badges?: {
    badge_ids: string[]
    metadata: any
  } | null
  discord_profile?: {
    id: string
    discriminator: string
    username: string
  }
}

export interface AdminUser {
  discord_id: string
  user_id: string
  display_name: string
  profile_description: string
  role: "user" | "admin"
  banned: boolean
  username: string
  avatar: string
  banner: string
  balance: string
  created_at: string
  locale: string
  rsi_confirmed: boolean
  official_server_id: string | null
  discord_thread_channel_id: string | null
  market_order_template: string
}

export interface AdminUsersResponse {
  users: AdminUser[]
  pagination: {
    page: number
    page_size: number
    total_users: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface AdminUsersQuery {
  page?: number
  page_size?: number
  role?: "user" | "admin"
  banned?: boolean
  rsi_confirmed?: boolean
}
