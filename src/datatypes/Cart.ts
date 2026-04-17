export interface CartItem {
  listing_id: string
  quantity: number
  price?: number
  aggregate_id?: number | string
  type: string
  variant_id?: string // V2: variant selection for quality tiers
}

export interface CartSeller {
  user_seller_id?: string | null
  contractor_seller_id?: string | null
  items: CartItem[]
  note?: string
}

export type Cart = CartSeller[]
