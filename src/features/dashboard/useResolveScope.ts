/**
 * Resolves a WidgetScope to the concrete identifiers the existing widgets consume
 * (`spectrumId` for orgs, `shopId` for shops).
 *
 * Personal dashboards (user owner) resolve against the viewer's live memberships
 * and the current sidebar context. Shared org/shop dashboards resolve relative to
 * the OWNER instead (see docs/customizable-dashboard-plan.md §7): on an org
 * dashboard, owner-relative bindings bind to that org; on a shop dashboard, to
 * that shop. Personal bindings (`me`) are disallowed there by the scope picker,
 * but if one slips in via an imported/legacy config it resolves to the owner too.
 *
 * M2 handles the direct bindings (me, specific_org, specific_shop, current_context).
 * Aggregate bindings (all_orgs, all_shops) require multi-target fan-out and are
 * resolved by the widgets themselves in M3; here they resolve to `aggregate` so
 * the wrapper can render a placeholder rather than silently showing personal data.
 */

import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useGetMyShopsQuery } from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../profile/api/profileApi"
import { useDashboardOwner } from "./DashboardOwnerContext"
import type { WidgetScope } from "./types"

export interface ResolvedScope {
  /** Org spectrum_id, when the widget should be scoped to a single org. */
  spectrumId?: string
  /** Shop id, when the widget should be scoped to a single shop. */
  shopId?: string
  /** Set when the scope can't be resolved (left org, deleted shop, etc.). */
  unavailable?: boolean
  /** Set when the binding needs multi-target aggregation (deferred to M3). */
  aggregate?: "all_orgs" | "all_shops"
  /** Human label for the resolved target (for the widget header). */
  label: string
}

function inferContextFromPath(pathname: string): {
  shopSlug?: string
  orgId?: string
} {
  const shopMatch = pathname.match(/\/shop\/([^/]+)/)
  if (shopMatch) return { shopSlug: shopMatch[1] }
  const orgMatch = pathname.match(/\/org\/([^/]+)/)
  if (orgMatch) return { orgId: orgMatch[1] }
  return {}
}

export function useResolveScope(scope: WidgetScope): ResolvedScope {
  const { pathname } = useLocation()
  const { data: profile } = useGetUserProfileQuery()
  const { data: myShops } = useGetMyShopsQuery()
  const owner = useDashboardOwner()

  return useMemo<ResolvedScope>(() => {
    // On a shared org/shop dashboard, owner-relative bindings resolve to the
    // owner rather than the viewer. `owner_id` is the org spectrum_id / shop id.
    if (owner && owner.ownerType === "org") {
      const org = profile?.contractors?.find(
        (c) => c.spectrum_id === owner.ownerId,
      )
      const label = org?.name || owner.ownerId
      switch (scope.kind) {
        case "me":
        case "current_context":
          return { spectrumId: owner.ownerId, label }
        case "specific_shop":
          break // an explicitly-pinned shop still resolves below
        default:
          return { spectrumId: owner.ownerId, label }
      }
    }
    if (owner && owner.ownerType === "shop") {
      const shop = myShops?.find((s) => s.shop_id === owner.ownerId)
      const label = shop?.name || owner.ownerId
      switch (scope.kind) {
        case "me":
        case "current_context":
          return { shopId: owner.ownerId, label }
        case "specific_org":
          break // an explicitly-pinned org still resolves below
        default:
          return { shopId: owner.ownerId, label }
      }
    }

    switch (scope.kind) {
      case "me":
        return { label: "You" }

      case "all_orgs":
        return { aggregate: "all_orgs", label: "All organizations" }

      case "all_shops":
        return { aggregate: "all_shops", label: "All shops" }

      case "specific_org": {
        const org = profile?.contractors?.find(
          (c) => c.spectrum_id === scope.spectrumId,
        )
        if (!org) return { unavailable: true, label: "Unavailable organization" }
        return { spectrumId: org.spectrum_id, label: org.name || org.spectrum_id }
      }

      case "specific_shop": {
        const shop = myShops?.find((s) => s.shop_id === scope.shopId)
        if (!shop) return { unavailable: true, label: "Unavailable shop" }
        return { shopId: shop.shop_id, label: shop.name }
      }

      case "current_context": {
        const { shopSlug, orgId } = inferContextFromPath(pathname)
        if (shopSlug) {
          const shop = myShops?.find((s) => s.slug === shopSlug)
          if (shop) return { shopId: shop.shop_id, label: shop.name }
        }
        if (orgId) {
          const org = profile?.contractors?.find((c) => c.spectrum_id === orgId)
          if (org)
            return {
              spectrumId: org.spectrum_id,
              label: org.name || org.spectrum_id,
            }
        }
        // Browsing / no context selected -> fall back to personal.
        return { label: "Current context (you)" }
      }

      default:
        return { unavailable: true, label: "Unknown scope" }
    }
  }, [scope, pathname, profile?.contractors, myShops, owner])
}
