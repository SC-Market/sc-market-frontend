export type AdminAlertChannel = "in_app" | "push" | "email" | "discord_dm"

export interface AdminAlert {
  alert_id: string
  title: string
  content: string
  link?: string | null
  target_type:
    | "all_users"
    | "org_members"
    | "org_owners"
    | "admins_only"
    | "specific_org"
  target_spectrum_id?: string | null
  created_by: string
  created_at: string
  active: boolean
  /** Channels the alert was sent on. */
  channels?: AdminAlertChannel[]
}

export interface AdminAlertCreate {
  title: string
  content: string
  link?: string | null
  target_type:
    | "all_users"
    | "org_members"
    | "org_owners"
    | "admins_only"
    | "specific_org"
  target_spectrum_id?: string | null
  /** In-app is always added. Default: in-app and push. */
  channels?: AdminAlertChannel[]
  /** Required when email goes to all users. */
  confirm_email_all_users?: boolean
}

export interface AdminAlertUpdate {
  title?: string
  content?: string
  link?: string | null
  target_type?:
    | "all_users"
    | "org_members"
    | "org_owners"
    | "admins_only"
    | "specific_org"
  target_spectrum_id?: string | null
  active?: boolean
}

export interface AdminAlertsResponse {
  alerts: AdminAlert[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface AdminAlertsQuery {
  page?: number
  pageSize?: number
  target_type?:
    | "all_users"
    | "org_members"
    | "org_owners"
    | "admins_only"
    | "specific_org"
  active?: boolean
}
