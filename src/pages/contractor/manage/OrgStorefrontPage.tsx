import React from "react"
import { Stack } from "@mui/material"
import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"
import { BrandingStatusCard } from "../../../features/storefront/components/BrandingStatusCard"

/** Org settings › Storefront: the branded storefront status. */
export function OrgStorefrontPage() {
  const { data } = usePageOrgManage()
  const spectrumId = data?.contractor?.spectrum_id
  if (!spectrumId) return null
  return (
    <Stack spacing={2}>
      <BrandingStatusCard spectrumId={spectrumId} />
    </Stack>
  )
}
