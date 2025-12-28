import React, { useMemo } from "react"
import { Autocomplete, TextField, Chip, Box, Typography } from "@mui/material"
import { SUPPORTED_LANGUAGES, Language } from "../../constants/languages"
import { useTranslation } from "react-i18next"

interface LanguageFilterProps {
  selectedLanguages: string[]
  onChange: (languageCodes: string[]) => void
  label?: string
  helperText?: string
  disabled?: boolean
}

interface LanguageWithExonym extends Language {
  endonym: string
  exonym: string
}

export function LanguageFilter({
  selectedLanguages,
  onChange,
  label,
  helperText,
  disabled = false,
}: LanguageFilterProps) {
  const { t } = useTranslation()

  // Map languages to include endonym and exonym (like in LanguageSelector)
  const languagesWithExonyms = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((lang) => ({
        ...lang,
        endonym: lang.name, // The native name (hardcoded from constants)
        exonym: t(`languages.${lang.code}`), // Translated name (from locale files)
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
          label={label || t("search.languageFilter.label", "Filter by Languages")}
          helperText={
            helperText ||
            t(
              "search.languageFilter.helperText",
              "Show results from sellers who support any of these languages",
            )
          }
          placeholder={
            selectedLanguages.length === 0
              ? t("search.languageFilter.placeholder", "Select languages...")
              : ""
          }
          size="small"
          color="secondary"
        />
      )}
      renderTags={(value, getTagProps) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            return (
              <Chip
                key={key}
                label={`${option.endonym} (${option.exonym})`}
                {...tagProps}
                size="small"
                variant="outlined"
              />
            )
          })}
        </Box>
      )}
      renderOption={(props, option) => {
        const isSelected = selectedLanguages.includes(option.code)
        return (
          <Box component="li" {...props}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? "bold" : "normal",
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
