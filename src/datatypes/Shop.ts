export interface ShopListing {
  shop_id: string
  owner_name: string
  shop_name: string
  description: string
  rating: number
  total_sales: number
  created_at: number
  last_updated: number
  status: 'active' | 'inactive'
  banner_image?: string
  avatar_image?: string
} 