/**
 * Resolves the shared-dashboard owner + edit permission for an org route.
 *
 * Org dashboards are owned by the org (owner_id = spectrum_id). A viewer may edit
 * when they hold `manage_org_details` — the same permission the backend enforces
 * on PUT /v2/dashboard/layout for org owners (see dashboard.service.ts §7).
 */

import { useMemo } from "react"
import { useGetContractorBySpectrumIDQuery } from "../contractor/api/contractorApi"
import { useGetUserProfileQuery } from "../profile/api/profileApi"
import { has_permission } from "../../views/contractor/OrgRoles"
import type { DashboardOwnerRef } from "./types"

export interface OrgDashboardOwner {
  owner: DashboardOwnerRef
  canEdit: boolean
  orgName: string
}

export function useOrgDashboardOwner(spectrumId: string): OrgDashboardOwner {
  const { data: contractor } = useGetContractorBySpectrumIDQuery(spectrumId, {
    skip: !spectrumId,
  })
  const { data: profile } = useGetUserProfileQuery()

  return useMemo<OrgDashboardOwner>(() => {
    const canEdit = has_permission(
      contractor ?? null,
      profile ?? null,
      "manage_org_details",
      profile?.contractors,
    )
    return {
      owner: { ownerType: "org", ownerId: spectrumId },
      canEdit,
      orgName: contractor?.name || spectrumId,
    }
  }, [contractor, profile, spectrumId])
}
