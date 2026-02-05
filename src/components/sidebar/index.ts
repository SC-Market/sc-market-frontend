// Re-export all sidebar components, hooks, and utilities
export * from "./types"
export * from "./hooks/useSidebarStarring"
export * from "./hooks/useSidebarSearch"
export * from "./hooks/useSidebarItems"
export * from "./utils/pathMatching"
export * from "./utils/sidebarRouting"
export * from "./utils/sidebarFilters"
export * from "./components/SidebarItem"
export * from "./components/SidebarDropdown"
export * from "./components/SidebarLink"
export * from "./components/SidebarLinkBody"
export * from "./components/SidebarHeader"
export * from "./components/SidebarSection"
export * from "./components/StarredSection"

// Re-export main Sidebar component
export { Sidebar } from "./Sidebar"

// Re-export ORG_ROUTE_REST_TO_CANONICAL for backward compatibility
export { ORG_ROUTE_REST_TO_CANONICAL } from "./components/SidebarLinkBody"
