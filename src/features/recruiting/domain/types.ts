import type { MinimalUser } from "../../../datatypes/User"
import type { Contractor } from "../../contractor/domain/types"

export interface Comment {
  comment_id: string
  author: MinimalUser | null
  content: string
  replies: Comment[]
  timestamp: number
  upvotes: number
  downvotes: number
  deleted: boolean
}

export interface RecruitingPost {
  post_id: string
  contractor: Contractor
  title: string
  body: string
  timestamp: number
  upvotes: number
  downvotes: number
}
