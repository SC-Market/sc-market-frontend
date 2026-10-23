import React, { useMemo } from "react"
import { NavLink } from "react-router-dom"
import { SidebarLinkBody } from "./SidebarLinkBody"
import { SidebarLinkProps } from "../types"
import { routeRegistry } from "../../../router/routeRegistry"
import { useHoverPrefetch } from "../../../hooks/prefetch/useHoverPrefetch"

// Registry keys sorted longest-first so the most specific match wins when a
// link's target (which may carry params/query) is matched via startsWith.
// The root "/" key is excluded from startsWith matching (it prefixes every
// path); it is only reachable via the exact-match check below.
const registryKeysByLength = Object.keys(routeRegistry)
  .filter((key) => key !== "/")
  .sort((a, b) => b.length - a.length)

/**
 * Resolve a link's `to` (which may include params/query) to the best matching
 * registry key: exact match first, else the longest registry key that the path
 * starts with. Mirrors the previous startsWith behavior.
 */
function resolveRegistryKey(to: string): string | undefined {
  // Strip any query string before matching.
  const path = to.split("?")[0]

  if (path in routeRegistry) {
    return path
  }

  return registryKeysByLength.find((key) => path.startsWith(key))
}

/**
 * Sidebar link wrapper with hover prefetching: the route chunk, plus the
 * page's data for internal links (see router/dataPrefetchRegistry.ts)
 */
export function SidebarLink(props: SidebarLinkProps) {
  const registryKey = useMemo(() => resolveRegistryKey(props.to), [props.to])
  const { onMouseEnter, onMouseLeave } = useHoverPrefetch(
    registryKey,
    props.external ? undefined : props.to,
  )

  return props.external ? (
    <a
      href={props.to}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <SidebarLinkBody {...props} />
    </NavLink>
  )
}
