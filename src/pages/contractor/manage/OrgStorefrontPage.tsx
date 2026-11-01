import React from "react"
import { Stack } from "@mui/material"
import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"
import { BrandingStatusCard } from "../../../features/storefront/components/BrandingStatusCard"
import { EmbedCodeCard } from "../../../features/storefront/components/EmbedCodeCard"

/** Org settings › Storefront: the branded storefront status and the embed code. */
export function OrgStorefrontPage() {
  const { data } = usePageOrgManage()
  const spectrumId = data?.contractor?.spectrum_id
  if (!spectrumId || !data) return null
  return (
    <Stack spacing={2}>
      <BrandingStatusCard spectrumId={spectrumId} />
      <EmbedCodeCard spectrumId={spectrumId} name={data.contractor.name} />
    </Stack>
  )
}
