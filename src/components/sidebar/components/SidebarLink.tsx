import React, { useCallback } from "react"
import { NavLink } from "react-router-dom"
import { SidebarLinkBody } from "./SidebarLinkBody"
import { SidebarLinkProps } from "../types"
import { prefetchModule } from "../../../util/prefetch"

// Route prefetch map for sidebar links
const routePrefetchMap: Record<
  string,
  { importFn: () => Promise<any>; key: string }
> = {
  "/market": {
    importFn: () => import("../../../features/market"),
    key: "MarketPage",
  },
  "/contracts": {
    importFn: () => import("../../../pages/contracting/Contracts"),
    key: "Contracts",
  },
  "/people": {
    importFn: () => import("../../../pages/people/People"),
    key: "People",
  },
  "/recruiting": {
    importFn: () => import("../../../pages/recruiting/Recruiting"),
    key: "Recruiting",
  },
  "/contractor": {
    importFn: () => import("../../../pages/contractor/Contractors"),
    key: "Contractors",
  },
  "/messages": {
    importFn: () => import("../../../pages/messaging/Messages"),
    key: "Messages",
  },
  "/fleet": {
    importFn: () => import("../../../pages/fleet/Fleet"),
    key: "Fleet",
  },
}

/**
 * Sidebar link wrapper with prefetching
 */
export function SidebarLink(props: SidebarLinkProps) {
  const handleMouseEnter = useCallback(() => {
    const matchingRoute = Object.keys(routePrefetchMap).find((route) =>
      props.to.startsWith(route),
    )

    if (matchingRoute) {
      const { importFn, key } = routePrefetchMap[matchingRoute]
      prefetchModule(importFn, key)
    }
  }, [props.to])

  return props.external ? (
    <a
      href={props.to}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={handleMouseEnter}
    >
      <SidebarLinkBody {...props} />
    </a>
  ) : (
    <NavLink
      to={props.to + (props.params ? "?" + props.params : "")}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={handleMouseEnter}
    >
      <SidebarLinkBody {...props} />
    </NavLink>
  )
}
