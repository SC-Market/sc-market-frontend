import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"
import { ThemeEditor } from "../../../components/theme-editor/ThemeEditor"
import { WhiteLabelSettings } from "../../../views/contractor/WhiteLabelSettings"
import { has_permission } from "../../../features/contractor/domain/permissions"
import { HelpLink } from "../../../features/help/components/HelpLink"
import { Box } from "@mui/material"
import {
  useGetOrgThemeQuery,
  useUpdateOrgThemeMutation,
  useDeleteOrgThemeMutation,
} from "../../../store/api/contractors"
import { clearCachedOrgTheme } from "../../../hooks/styles/themeCache"
import { useBrandingUnlocked } from "../../../features/storefront/hooks/useBrandingUnlocked"
import { BrandingStatusCard } from "../../../features/storefront/components/BrandingStatusCard"

export function OrgThemePage() {
  const { data } = usePageOrgManage()
  const contractor = data?.contractor
  const profile = data?.profile
  const spectrumId = contractor?.spectrum_id
  // A staff white_label grant, or the unlock criteria (Storefront tab).
  const hasWhiteLabel = useBrandingUnlocked(contractor)
  // Each section shows for the permission its save needs: the theme editor
  // saves with Manage Theme, Site Settings and Sidebar with Manage Org Details.
  const canEditTheme = has_permission(
    contractor,
    profile,
    "manage_theme",
    profile?.contractors,
  )
  const canEditSite = has_permission(
    contractor,
    profile,
    "manage_org_details",
    profile?.contractors,
  )

  const { data: orgTheme } = useGetOrgThemeQuery(spectrumId!, {
    skip: !hasWhiteLabel || !spectrumId || !canEditTheme,
  })
  const [updateOrgTheme, { isLoading: isThemeSaving }] =
    useUpdateOrgThemeMutation()
  const [deleteOrgTheme] = useDeleteOrgThemeMutation()

  if (!spectrumId) return null
  // Opened directly while branding is locked: say what's missing.
  if (!hasWhiteLabel) return <BrandingStatusCard spectrumId={spectrumId} />

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <HelpLink guide="orgWhiteLabelTheme" />
      </Box>
      {canEditTheme && (
        <ThemeEditor
          initialThemeData={
            orgTheme?.data?.theme_data ?? {
              light: {},
              dark: {},
            }
          }
          initialFaviconUrl={orgTheme?.data?.favicon_url ?? null}
          onSave={async (data) => {
            await updateOrgTheme({
              spectrum_id: spectrumId,
              ...data,
            }).unwrap()
            clearCachedOrgTheme(spectrumId)
          }}
          onReset={async () => {
            await deleteOrgTheme(spectrumId).unwrap()
            clearCachedOrgTheme(spectrumId)
          }}
          isSaving={isThemeSaving}
        />
      )}
      {canEditSite && <WhiteLabelSettings />}
    </>
  )
}
