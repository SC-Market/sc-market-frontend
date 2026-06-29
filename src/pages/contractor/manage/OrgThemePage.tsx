import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"
import { ThemeEditor } from "../../../components/theme-editor/ThemeEditor"
import { WhiteLabelSettings } from "../../../views/contractor/WhiteLabelSettings"
import {
  useGetOrgThemeQuery,
  useUpdateOrgThemeMutation,
  useDeleteOrgThemeMutation,
} from "../../../store/api/contractors"
import { clearCachedOrgTheme } from "../../../hooks/styles/themeCache"

export function OrgThemePage() {
  const { data } = usePageOrgManage()
  const contractor = data?.contractor
  const spectrumId = contractor?.spectrum_id
  const hasWhiteLabel = contractor?.premium_tier === "white_label"

  const { data: orgTheme } = useGetOrgThemeQuery(spectrumId!, {
    skip: !hasWhiteLabel || !spectrumId,
  })
  const [updateOrgTheme, { isLoading: isThemeSaving }] = useUpdateOrgThemeMutation()
  const [deleteOrgTheme] = useDeleteOrgThemeMutation()

  if (!hasWhiteLabel || !spectrumId) return null

  return (
    <>
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
      <WhiteLabelSettings />
    </>
  )
}
