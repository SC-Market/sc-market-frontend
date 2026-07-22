/**
 * Resolves an aggregate scope (all_orgs / all_shops) into the concrete list of
 * targets to fan out over (plan §1/M3). Rather than a server-side sum, aggregate
 * widgets render one instance per target — honest per-target data, and it works
 * within the rules of hooks because each target is a separately-rendered child.
 */

import { useMemo } from "react"
import { useGetMyShopsQuery } from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../profile/api/profileApi"
import type { ResolvedScope } from "./useResolveScope"

export interface AggregateTarget extends ResolvedScope {
  /** Stable key for React lists. */
  key: string
}

export function useAggregateTargets(
  aggregate: "all_orgs" | "all_shops",
): AggregateTarget[] {
  const { data: profile } = useGetUserProfileQuery()
  const { data: myShops } = useGetMyShopsQuery()

  return useMemo<AggregateTarget[]>(() => {
    if (aggregate === "all_orgs") {
      return (profile?.contractors ?? []).map((org) => ({
        key: `org:${org.spectrum_id}`,
        spectrumId: org.spectrum_id,
        label: org.name || org.spectrum_id,
      }))
    }
    return (myShops ?? []).map((shop) => ({
      key: `shop:${shop.shop_id}`,
      shopId: shop.shop_id,
      label: shop.name,
    }))
  }, [aggregate, profile?.contractors, myShops])
}
