import React, { useMemo } from "react"
import { Autocomplete, TextField, Chip, Box, Typography } from "@mui/material"
import { SUPPORTED_LANGUAGES, Language } from "../../constants/languages"
import { useTranslation } from "react-i18next"

interface LanguageSelectorProps {
  selectedLanguages: string[]
  onChange: (languageCodes: string[]) => void
  label?: string
  helperText?: string
  disabled?: boolean
  error?: boolean
}

interface LanguageWithExonym extends Language {
  endonym: string
  exonym: string
}

export function LanguageSelector({
  selectedLanguages,
  onChange,
  label,
  helperText,
  disabled = false,
  error = false,
}: LanguageSelectorProps) {
  const { t } = useTranslation()

  // Map languages to include endonym and exonym (like in PreferencesButton)
  // Endonym = hardcoded native name, Exonym = translated name from locale files
  const languagesWithExonyms = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((lang) => ({
        ...lang,
        endonym: lang.name, // The native name (hardcoded from constants)
        exonym: t(`languages.${lang.code}`), // Translated name (from locale files, same as PreferencesButton)
      })),
    [t],
  )

  // Convert language codes to LanguageWithExonym objects for Autocomplete
  const selectedLanguageObjects = selectedLanguages
    .map((code) => languagesWithExonyms.find((lang) => lang.code === code))
    .filter((lang): lang is LanguageWithExonym => lang !== undefined)

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: LanguageWithExonym[],
  ) => {
    // Allow any selection, including removing English
    const codes = newValue.map((lang) => lang.code)
    onChange(codes)
  }

  return (
    <Autocomplete
      multiple
      disabled={disabled}
      options={languagesWithExonyms}
      value={selectedLanguageObjects}
      onChange={handleChange}
      getOptionLabel={(option) => `${option.endonym} (${option.exonym})`}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("settings.languages.label", "Supported Languages")}
          helperText={
            helperText ||
            t(
              "settings.languages.helperText",
              "Select the languages you can communicate in",
            )
          }
          error={error}
          placeholder={
            selectedLanguages.length === 0
              ? t("settings.languages.placeholder", "Select languages...")
              : ""
          }
        />
      )}
      renderTags={(value, getTagProps) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            const isEnglish = option.code === "en"
            return (
              <Chip
                key={key}
                label={`${option.endonym} (${option.exonym})`}
                {...tagProps}
                color={isEnglish ? "primary" : "default"}
                size="small"
              />
            )
          })}
        </Box>
      )}
      renderOption={(props, option) => {
        const isSelected = selectedLanguages.includes(option.code)
        const isEnglish = option.code === "en"
        return (
          <Box component="li" {...props}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? "bold" : "normal",
                  color: isEnglish ? "primary.main" : "text.primary",
                }}
              >
                {option.endonym}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.exonym}
              </Typography>
            </Box>
          </Box>
        )
      }}
    />
  )
}
