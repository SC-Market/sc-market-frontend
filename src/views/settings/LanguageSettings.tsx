import React, { useState, useEffect } from "react"
import { FlatSection } from "../../components/paper/Section"
import { LanguageSelector } from "../../components/settings/LanguageSelector"
import {
  useProfileGetLanguagesQuery,
  useProfileSetLanguagesMutation,
} from "../../store/profile"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import LoadingButton from "@mui/lab/LoadingButton"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import CreateRounded from '@mui/icons-material/CreateRounded';

export function LanguageSettings() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const {
    data: languagesData,
    isLoading,
    error,
  } = useProfileGetLanguagesQuery()

  const [setLanguages] = useProfileSetLanguagesMutation()

  // Update local state when data loads
  useEffect(() => {
    if (languagesData?.languages) {
      setSelectedLanguages(languagesData.languages.map((lang) => lang.code))
    }
  }, [languagesData])

  const handleSave = async () => {
    setSaving(true)

    try {
      await setLanguages({ language_codes: selectedLanguages }).unwrap()
      issueAlert({
        message: t(
          "settings.languages.saveSuccess",
          "Languages updated successfully",
        ),
        severity: "success",
      })
    } catch (err: any) {
      issueAlert({
        message:
          err?.data?.error?.message ||
          t("settings.languages.saveError", "Failed to update languages"),
        severity: "error",
      })
    } finally {
      setSaving(false)
    }
  }

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
                "settings.languages.field.helperText",
                "Select the languages you can communicate in",
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
