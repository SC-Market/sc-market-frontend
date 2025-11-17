import { ContractorKindIconKey } from "../views/contractor/ContractorList"
import { MinimalUser } from "./User"

export interface AuditLogEntry {
  audit_log_id: string
  action: string
  actor_id: string | null
  actor: MinimalUser | null
  subject_type: string
  subject_id: string
  metadata: Record<string, unknown>
  created_at: string
  contractor?: {
    contractor_id: string
    name: string
    spectrum_id: string
  } | null
}

export interface AuditLogsResponse {
  items: AuditLogEntry[]
  total: number
  page: number
  page_size: number
}

export interface DiscordSettings {
  guild_avatar: string
  guild_name: string
  channel_name: string
  official_server_id: string
  discord_thread_channel_id: string
}

export interface Rating {
  avg_rating: number
  rating_count: number
  total_rating: number
  streak: number
  total_orders: number
  response_rate: number
  total_assignments: number
}

export interface Contractor {
  kind: "independent" | "organization"
  avatar: string
  banner: string
  site_url?: string
  rating: Rating
  size: number
  name: string
  description: string
  fields: ContractorKindIconKey[]
  spectrum_id: string
  roles?: ContractorRole[]
  default_role?: string
  owner_role?: string
  balance?: number
  official_server_id: string | null
  discord_thread_channel_id: string | null
  market_order_template: string
  locale?: string
  archived?: boolean
}

export interface MinimalContractor {
  avatar: string
  name: string
  spectrum_id: string
  rating: Rating
  role?: string
  role_id?: string
}

export interface UserContractorState {
  kind: "independent" | "organization"
  avatar: string
  site_url?: string
  rating: Rating
  size: string
  name: string
  description: string
  fields: ContractorKindIconKey[]
  spectrum_id: string
  balance: number
  roles?: ContractorRole[]
  locale?: string
  archived?: boolean
}

export interface OrderWebhook {
  webhook_id: string
  name: string
  webhook_url: string
  actions: string[]
}

export interface ContractorInviteCode {
  invite_id: string
  max_uses: number
  times_used: number
}

export interface ContractorInvite {
  spectrum_id: string
  message: string
}

export interface ContractorRole {
  contractor_id: string
  name: string
  position: number
  role_id: string
  manage_roles: boolean
  manage_orders: boolean
  kick_members: boolean
  manage_invites: boolean
  manage_org_details: boolean
  manage_stock: boolean
  manage_market: boolean
  manage_recruiting: boolean
  manage_webhooks: boolean
  manage_blocklist: boolean
}

export interface ContractorMember extends MinimalUser {
  roles: string[]
}
