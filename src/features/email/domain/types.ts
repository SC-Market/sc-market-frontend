/**
 * User email record
 */
export interface UserEmail {
  email_id: string
  email: string
  email_verified: boolean
  is_primary: boolean
}

/**
 * Email notification preference
 */
export interface EmailPreference {
  preference_id: string
  action_type_id: number
  action_name: string | null
  enabled: boolean
  frequency: "immediate" | "daily" | "weekly"
  digest_time: string | null
  created_at: string
  updated_at: string
  contractor_id?: string | null // NULL for individual preferences, UUID for org preferences
}

/**
 * Grouped email preferences response
 */
export interface GroupedEmailPreferences {
  individual: EmailPreference[]
  organizations: Array<{
    contractor_id: string
    preferences: EmailPreference[]
  }>
}

/**
 * Notification type (available notification action)
 */
export interface NotificationType {
  action_type_id: number
  action: string
  entity: string
  description: string | null
}

/**
 * Add email request
 */
export interface AddEmailRequest {
  email: string
  notificationTypeIds?: number[]
}

/**
 * Update email request
 */
export interface UpdateEmailRequest {
  email: string
}

/**
 * Update email preferences request
 */
export interface UpdateEmailPreferencesRequest {
  preferences: Array<{
    action_type_id: number
    enabled?: boolean
    frequency?: "immediate" | "daily" | "weekly"
    digest_time?: string | null
    contractor_id?: string | null // NULL for individual, UUID for org
  }>
}
