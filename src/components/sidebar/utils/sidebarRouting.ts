import { SidebarItemProps } from "../types"

/**
 * Resolve org-specific and shop-specific routes for sidebar items
 */
export function resolveOrgRoute(
  item: SidebarItemProps,
  currentOrgId: string | null | undefined,
  effectiveOrgId: string | null | undefined,
  shopSlug?: string | null,
): SidebarItemProps {
  let resolved = item

  if (item.toOrgPublic && currentOrgId) {
    resolved = {
      ...item,
      to: `/contractor/${currentOrgId}`,
    }
  } else if (item.shopRouteRest && shopSlug) {
    resolved = {
      ...item,
      to: `/shop/${shopSlug}/${item.shopRouteRest}`,
    }
  } else if (item.orgRouteRest && effectiveOrgId) {
    resolved = {
      ...item,
      to: `/org/${effectiveOrgId}/${item.orgRouteRest}`,
    }
  }

  // Resolve children routes
  if (resolved.children?.length) {
    resolved = {
      ...resolved,
      children: resolved.children.map((child) => {
        if (child.shopRouteRest && shopSlug) {
          return {
            ...child,
            to: `/shop/${shopSlug}/${child.shopRouteRest}`,
          }
        }
        if (child.orgRouteRest && effectiveOrgId) {
          return {
            ...child,
            to: `/org/${effectiveOrgId}/${child.orgRouteRest}`,
          }
        }
        return child
      }),
    }
  }

  return resolved
}
