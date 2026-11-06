import React, { useState, useEffect } from "react"
import { Box, Grid, Typography, Alert } from "@mui/material"
import { FlatSection } from "../../components/paper/Section"
import { LanguageSelector } from "../../components/settings/LanguageSelector"
import { useProfileGetLanguagesQuery } from "../../features/profile/api/profileApi"
import { useSaveProfileLanguages } from "../../features/profile/hooks/useAccountSettingsActions"
import { useTranslation } from "react-i18next"
import LoadingButton from "@mui/lab/LoadingButton"

export function LanguageSettings() {
  const { t } = useTranslation()
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const { save, saving } = useSaveProfileLanguages()

  const {
    data: languagesData,
    isLoading,
    error,
  } = useProfileGetLanguagesQuery()

  // Update local state when data loads
  useEffect(() => {
    if (languagesData?.languages) {
      setSelectedLanguages(languagesData.languages.map((lang) => lang.code))
    }
  }, [languagesData])

  const handleSave = () => save(selectedLanguages)

  return (
    <FlatSection title={t("settings.languages.title", "Supported Languages")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t(
            "settings.languages.section.description",
            "Select the languages you can communicate in.",
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

      {/* While the languages load, the same selector and button render
          disabled, so the card has its loaded size (no spinner stage). */}
      <Grid item xs={12}>
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onChange={setSelectedLanguages}
          label={t("settings.languages.label", "Supported Languages")}
          helperText={t(
            "settings.languages.field.helperText",
            "Select the languages you can communicate in",
          )}
          disabled={isLoading}
        />
      </Grid>

      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <LoadingButton
            variant="outlined"
            onClick={handleSave}
            loading={saving}
            disabled={isLoading}
            color="primary"
          >
            {t("settings.languages.save", "Save Languages")}
          </LoadingButton>
        </Box>
      </Grid>
    </FlatSection>
  )
}
