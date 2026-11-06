import React, { useState, useEffect } from "react"
import { Box, Grid, Typography, Alert, CircularProgress } from "@mui/material"
import { FlatSection } from "../../components/paper/Section"
import { LanguageSelector } from "../../components/settings/LanguageSelector"
import { useGetContractorLanguagesQuery } from "../../features/contractor/api/contractorApi"
import { useSaveOrgLanguages } from "../../features/contractor/hooks/useOrgSettingsActions"
import { useTranslation } from "react-i18next"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { canManageOrgDetails } from "../../features/contractor/domain/orgPermissions"
import LoadingButton from "@mui/lab/LoadingButton"

export function OrgLanguageSettings() {
  const { t } = useTranslation()
  const [contractor] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const canEditLanguages = canManageOrgDetails(contractor, profile)

  const {
    data: languagesData,
    isLoading,
    error,
  } = useGetContractorLanguagesQuery(contractor?.spectrum_id || "", {
    skip: !contractor?.spectrum_id,
  })

  const { save, saving } = useSaveOrgLanguages(contractor?.spectrum_id)

  // Update local state when data loads
  useEffect(() => {
    if (languagesData?.languages) {
      setSelectedLanguages(languagesData.languages.map((lang) => lang.code))
    }
  }, [languagesData])

  const handleSave = () => save(selectedLanguages)

  if (!canEditLanguages) {
    return (
      <FlatSection title={t("settings.languages.title", "Supported Languages")}>
        <Grid item xs={12}>
          <Alert severity="warning">
            {t(
              "settings.languages.noPermission",
              "You do not have permission to manage organization languages",
            )}
          </Alert>
        </Grid>
      </FlatSection>
    )
  }

  return (
    <FlatSection title={t("settings.languages.title", "Supported Languages")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t(
            "settings.languages.org.description",
            "Select the languages your organization can communicate in.",
          )}
        </Typography>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("settings.languages.loadError", "Failed to load languages")}
          </Alert>
        </Grid>
      )}

      {isLoading ? (
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Grid>
      ) : (
        <>
          <Grid item xs={12}>
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onChange={setSelectedLanguages}
              label={t("settings.languages.label", "Supported Languages")}
              helperText={t(
                "settings.languages.org.helperText",
                "Select the languages your organization can communicate in",
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <LoadingButton
                variant="outlined"
                onClick={handleSave}
                loading={saving}
                color="primary"
              >
                {t("settings.languages.save", "Save Languages")}
              </LoadingButton>
            </Box>
          </Grid>
        </>
      )}
    </FlatSection>
  )
}
