/**
 * API Token
 */
export interface ApiToken {
  id: string
  name: string
  description?: string
  scopes: string[]
  contractor_spectrum_ids: string[]
  expires_at?: string
  last_used_at?: string
  created_at: string
  updated_at: string
}

/**
 * Create token request
 */
export interface CreateTokenRequest {
  name: string
  description?: string
  scopes: string[]
  contractor_spectrum_ids?: string[]
  expires_at?: string
}

/**
 * Update token request
 */
export interface UpdateTokenRequest {
  name?: string
  description?: string
  scopes?: string[]
  contractor_spectrum_ids?: string[]
  expires_at?: string
}

/**
 * Token statistics
 */
export interface TokenStats {
  id: string
  name: string
  created_at: string
  last_used_at?: string
  expires_at?: string
  is_expired: boolean
  days_until_expiry?: number
  usage_count?: number
}

/**
 * Extend token request
 */
export interface ExtendTokenRequest {
  expires_at: string
}
