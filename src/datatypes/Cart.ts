export interface CartItem {
  listing_id: string
  quantity: number
  price?: number
  aggregate_id?: number | string
  type: string
  variant_id?: string
}

export interface CartSeller {
  shop_id: string
  items: CartItem[]
  note?: string
}

export type Cart = CartSeller[]
