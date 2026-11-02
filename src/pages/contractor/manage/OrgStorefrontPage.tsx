import React from "react"
import { Stack } from "@mui/material"
import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"
import { has_permission } from "../../../features/contractor/domain/permissions"
import { BrandingStatusCard } from "../../../features/storefront/components/BrandingStatusCard"
import { EmbedCodeCard } from "../../../features/storefront/components/EmbedCodeCard"
import { OnboardingChecklist } from "../../../features/storefront/components/OnboardingChecklist"
import { StorefrontDirectoryCard } from "../../../features/storefront/components/StorefrontDirectoryCard"
import { StorefrontEnquiryCard } from "../../../features/storefront/components/StorefrontEnquiryCard"
import { FirstUseHint } from "../../../features/help/components/FirstUseHint"
import { useTranslation } from "react-i18next"
import {
  useGetOrgStorefrontStatusQuery,
  useSetOrgStorefrontDirectoryMutation,
} from "../../../store/api/v2/market"

/** The org's "Show in the public storefront directory" setting (Manage Org Details). */
function OrgDirectorySetting(props: { spectrumId: string }) {
  const { data } = useGetOrgStorefrontStatusQuery({ spectrumId: props.spectrumId })
  const [setDirectory, state] = useSetOrgStorefrontDirectoryMutation()
  if (!data) return null
  return (
    <StorefrontDirectoryCard
      kind="org"
      status={data.directory}
      saving={state.isLoading}
      error={state.error}
      onChange={(show) =>
        void setDirectory({
          spectrumId: props.spectrumId,
          storefrontDirectoryRequest: { show_in_directory: show },
        })
      }
    />
  )
}

/**
 * Org settings › Storefront: the setup checklist, the branded storefront
 * status, the enquiry form and the directory setting (Manage Org Details),
 * and the embed code.
 */
export function OrgStorefrontPage() {
  const { t } = useTranslation()
  const { data } = usePageOrgManage()
  const spectrumId = data?.contractor?.spectrum_id
  if (!spectrumId || !data) return null
  const canManageDetails = has_permission(
    data.contractor,
    data.profile,
    "manage_org_details",
    data.profile.contractors,
  )
  return (
    <Stack spacing={2}>
      <FirstUseHint hint="whiteLabel" title={t("hints.whiteLabel.title")}>
        {t("hints.whiteLabel.body")}
      </FirstUseHint>
      <OnboardingChecklist spectrumId={spectrumId} />
      <BrandingStatusCard spectrumId={spectrumId} />
      {canManageDetails && (
        <>
          <StorefrontEnquiryCard targetType="org" targetId={spectrumId} handle={spectrumId} />
          <OrgDirectorySetting spectrumId={spectrumId} />
        </>
      )}
      <EmbedCodeCard spectrumId={spectrumId} name={data.contractor.name} />
    </Stack>
  )
}
