/**
 * Centralized URL path constants.
 * All navigation links should use these functions instead of hardcoding paths.
 */

import { formatShortSlug } from "../features/market/domain/urls"

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
  manageAbout: (spectrumId: string) => `/org/${spectrumId}/manage/about`,
  manageRoles: (spectrumId: string) => `/org/${spectrumId}/manage/roles`,
  manageInvites: (spectrumId: string) => `/org/${spectrumId}/manage/invites`,
  manageDiscord: (spectrumId: string) => `/org/${spectrumId}/manage/discord`,
  manageMarket: (spectrumId: string) => `/org/${spectrumId}/manage/market`,
  manageSettings: (spectrumId: string) => `/org/${spectrumId}/manage/settings`,
  manageBlocklist: (spectrumId: string) => `/org/${spectrumId}/manage/blocklist`,
  manageAudit: (spectrumId: string) => `/org/${spectrumId}/manage/audit`,
  manageCustomers: (spectrumId: string) => `/org/${spectrumId}/manage/customers`,
  manageTheme: (spectrumId: string) => `/org/${spectrumId}/manage/theme`,
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
  listing: (id: string, title?: string) =>
    title ? `/market/${formatShortSlug(id, title)}` : `/market/${id}`,
  aggregate: (gameItemId: string, name?: string) =>
    name ? `/market/aggregate/${formatShortSlug(gameItemId, name)}` : `/market/aggregate/${gameItemId}`,
  shops: "/shops",
  shopProfile: (slug: string) => `/shops/${slug}`,
} as const

export const WIKI_PATHS = {
  item: (id: string, name?: string) =>
    name ? `/wiki/items/${formatShortSlug(id, name)}` : `/wiki/items/${id}`,
  ship: (id: string, name?: string) =>
    name ? `/wiki/ships/${formatShortSlug(id, name)}` : `/wiki/ships/${id}`,
  commodity: (id: string, name?: string) =>
    name ? `/wiki/commodities/${formatShortSlug(id, name)}` : `/wiki/commodities/${id}`,
  manufacturer: (code: string) => `/wiki/manufacturers/${code}`,
} as const
