/**
 * Centralized URL path constants.
 * All navigation links should use these functions instead of hardcoding paths.
 */

export const SHOP_PATHS = {
  root: (slug: string) => `/shop/${slug}`,
  listings: (slug: string) => `/shop/${slug}/listings`,
  create: (slug: string) => `/shop/${slug}/listings/create`,
  stock: (slug: string) => `/shop/${slug}/stock`,
  orders: (slug: string) => `/shop/${slug}/orders`,
  services: (slug: string) => `/shop/${slug}/services`,
  settings: (slug: string) => `/shop/${slug}/settings`,
  analytics: (slug: string) => `/shop/${slug}/analytics`,
  /** Public shop profile */
  profile: (slug: string) => `/shops/${slug}`,
  profileTab: (slug: string, tab: string) => `/shops/${slug}/${tab}`,
} as const

export const ORG_PATHS = {
  root: (spectrumId: string) => `/org/${spectrumId}`,
  manage: (spectrumId: string) => `/org/${spectrumId}/manage`,
  members: (spectrumId: string) => `/org/${spectrumId}/members`,
  orders: (spectrumId: string) => `/org/${spectrumId}/orders`,
  money: (spectrumId: string) => `/org/${spectrumId}/money`,
  fleet: (spectrumId: string) => `/org/${spectrumId}/fleet`,
  send: (spectrumId: string) => `/org/${spectrumId}/send`,
  dashboard: (spectrumId: string) => `/org/${spectrumId}/dashboard`,
  /** Public org profile */
  profile: (spectrumId: string) => `/contractor/${spectrumId}`,
  profileTab: (spectrumId: string, tab: string) => `/contractor/${spectrumId}/${tab}`,
} as const

export const USER_PATHS = {
  profile: (username: string) => `/user/${username}`,
  profileTab: (username: string, tab: string) => `/user/${username}/${tab}`,
} as const

export const MARKET_PATHS = {
  search: "/market",
  listing: (listingId: string) => `/market/${listingId}`,
  shops: "/shops",
  shopProfile: (slug: string) => `/shops/${slug}`,
} as const
