/**
 * Chat participant types
 */
export interface UserParticipant {
  type: "user"
  username: string
  avatar: string
}

export interface ContractorParticipant {
  type: "contractor"
  name: string
  avatar: string
  spectrum_id: string
}

/**
 * Chat message
 */
export interface Message {
  author: string | null
  content: string
  timestamp: number
  chat_id: string
}

/**
 * Chat
 */
export interface Chat {
  chat_id: string
  participants: (UserParticipant | ContractorParticipant)[]
  messages: Message[]
  order_id: string | null
  session_id?: string | null
  title?: string | null
}
