import { SidebarItemProps } from "../types"

/**
 * Resolve org-specific routes for sidebar items
 */
export function resolveOrgRoute(
  item: SidebarItemProps,
  currentOrgId: string | null | undefined,
  effectiveOrgId: string | null | undefined,
): SidebarItemProps {
  let resolved = item

  if (item.toOrgPublic && currentOrgId) {
    resolved = {
      ...item,
      to: `/contractor/${currentOrgId}`,
    }
  } else if (item.orgRouteRest && effectiveOrgId) {
    resolved = {
      ...item,
      to: `/org/${effectiveOrgId}/${item.orgRouteRest}`,
    }
  }

  // Resolve children routes
  if (resolved.children?.length && effectiveOrgId) {
    resolved = {
      ...resolved,
      children: resolved.children.map((child) =>
        child.orgRouteRest
          ? {
              ...child,
              to: `/org/${effectiveOrgId}/${child.orgRouteRest}`,
            }
          : child,
      ),
    }
  }

  return resolved
}
