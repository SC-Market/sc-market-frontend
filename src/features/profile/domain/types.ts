import type { Rating } from "../../contractor/domain/types"

export interface SerializedError {
  error?: string
}

export interface BlocklistEntry {
  id: string
  blocked_username: string | null
  created_at: string
  reason: string
  blocked_user: {
    username: string
    display_name: string
    avatar: string
    rating: Rating
  } | null
}
