import React, { useMemo } from "react"
import {
  Grid,
  Typography,
  Autocomplete,
  TextField,
  Box,
  Divider,
} from "@mui/material"
import { Section } from "../../components/paper/Section"
import { useTranslation } from "react-i18next"
import { languages } from "../../util/i18n"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useUpdateContractorMutation } from "../../store/contractor"
import { OrgLanguageSettings } from "./OrgLanguageSettings"

export function OrgSettings() {
  const { t } = useTranslation()
  const [contractor, setContractor] = useCurrentOrg()
  const [updateContractor] = useUpdateContractorMutation()

  const currentLocale = contractor?.locale || "en"
  const languagesWithExonyms = useMemo(
    () =>
      languages.map((lang) => ({
        ...lang,
        exonym: t(`languages.${lang.code}`),
      })),
    [t],
  )

  const handleOrgLanguageChange = async (language: string) => {
    if (!contractor) return
    try {
      await updateContractor({
        contractor: contractor.spectrum_id,
        body: { locale: language as any },
      }).unwrap()
      setContractor({ ...contractor, locale: language })
    } catch (_err) {
      // ignore for now
    }
  }

  return (
    <Grid container spacing={2}>
      <Section title={t("org.settingsTab") as string} xs={12}>
        <Grid item xs={12}>
          <Autocomplete
            value={
              languagesWithExonyms.find(
                (lang) => lang.code === currentLocale,
              ) || null
            }
            onChange={(event, newValue) => {
              if (newValue) handleOrgLanguageChange(newValue.code)
            }}
            options={languagesWithExonyms}
            getOptionLabel={(option) => `${option.endonym} (${option.exonym})`}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("preferences.language")}
                size="small"
                placeholder={t("org.settings.locale.select")}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {option.endonym}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.exonym}
                  </Typography>
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option.code === value.code}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>
      </Section>
      <OrgLanguageSettings />
    </Grid>
  )
}
