export interface StockRow {
  title: string
  quantity_available: number
  listing_id: string
  price: number
  status: string
  image_url: string
  expiration: string
  order_count: number
  offer_count: number
}

export interface NewListingRow {
  id: string
  item_type: string
  item_name: string | null
  price: number
  quantity_available: number
  status: "active" | "inactive"
  isNew: boolean
}
