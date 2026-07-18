import { ReactNode } from "react"

export interface SidebarItemProps {
  to?: string
  params?: string
  text: string
  icon?: ReactNode
  chip?: ReactNode
  children?: SidebarItemProps[]
  hidden?: boolean
  logged_in?: boolean
  org?: boolean
  org_admin?: boolean
  site_admin?: boolean
  custom?: boolean
  external?: boolean
  toOrgPublic?: boolean
  orgRouteRest?: string
  shopRouteRest?: string // Resolved to /shop/:slug/<shopRouteRest>
  requiresShop?: boolean // Hide item if no shop is selected
  tab_key?: string // Used for org sidebar config filtering
  feature_flag?: string // Only show when this flag is enabled (e.g. "wiki")
}

export interface SidebarSectionProps {
  title: string
  items: SidebarItemProps[]
}

export interface SidebarLinkProps extends SidebarItemProps {
  to: string
  isStarred?: boolean
  onToggleStar?: (path: string) => void
}

export interface SidebarItemWithStarProps extends SidebarItemProps {
  isStarred?: boolean
  onToggleStar?: (path: string) => void
  starredItems?: string[]
}
