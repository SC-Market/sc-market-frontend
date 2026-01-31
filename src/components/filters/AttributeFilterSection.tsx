import React from "react"
import {
  Box,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Autocomplete,
  Chip,
} from "@mui/material"
import { useTranslation } from "react-i18next"

export interface AttributeFilterSectionProps {
  attributeName: string
  displayName: string
  attributeType: "select" | "multiselect" | "range" | "text"
  allowedValues: string[] | null
  selectedValues: string[]
  onChange: (values: string[]) => void
}

export function AttributeFilterSection({
  attributeName,
  displayName,
  attributeType,
  allowedValues,
  selectedValues,
  onChange,
}: AttributeFilterSectionProps) {
  const { t } = useTranslation()

  // Render single-select dropdown
  if (attributeType === "select") {
    return (
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          fullWidth
          size="small"
          color="secondary"
          label={displayName}
          value={selectedValues[0] || ""}
          onChange={(e) => {
            const value = e.target.value
            onChange(value ? [value] : [])
          }}
          aria-label={`${displayName} filter`}
        >
          <MenuItem value="">
            <em>{t("filters.none", "None")}</em>
          </MenuItem>
          {allowedValues?.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    )
  }

  // Render multi-select with checkboxes or autocomplete
  if (attributeType === "multiselect") {
    // Use Autocomplete for better UX with many options
    if (allowedValues && allowedValues.length > 5) {
      return (
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            size="small"
            options={allowedValues}
            value={selectedValues}
            onChange={(event, newValue) => {
              onChange(newValue)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={displayName}
                placeholder={
                  selectedValues.length === 0
                    ? t("filters.selectMultiple", "Select...")
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
                      label={option}
                      {...tagProps}
                      size="small"
                      variant="outlined"
                    />
                  )
                })}
              </Box>
            )}
            aria-label={`${displayName} filter`}
          />
        </Box>
      )
    }

    // Use checkboxes for fewer options
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {displayName}
        </Typography>
        <FormGroup>
          {allowedValues?.map((value) => (
            <FormControlLabel
              key={value}
              control={
                <Checkbox
                  checked={selectedValues.includes(value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, value])
                    } else {
                      onChange(selectedValues.filter((v) => v !== value))
                    }
                  }}
                  size="small"
                  color="secondary"
                />
              }
              label={value}
            />
          ))}
        </FormGroup>
      </Box>
    )
  }

  // Render range inputs for numeric attributes
  if (attributeType === "range") {
    const minValue = selectedValues[0] || ""
    const maxValue = selectedValues[1] || ""

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {displayName}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            color="secondary"
            type="number"
            label={t("filters.min", "Min")}
            value={minValue}
            onChange={(e) => {
              const newMin = e.target.value
              onChange([newMin, maxValue].filter(Boolean))
            }}
            inputProps={{
              "aria-label": `${displayName} minimum`,
            }}
            sx={{ flex: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
          <TextField
            size="small"
            color="secondary"
            type="number"
            label={t("filters.max", "Max")}
            value={maxValue}
            onChange={(e) => {
              const newMax = e.target.value
              onChange([minValue, newMax].filter(Boolean))
            }}
            inputProps={{
              "aria-label": `${displayName} maximum`,
            }}
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>
    )
  }

  // Render text input for text attributes
  if (attributeType === "text") {
    return (
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          color="secondary"
          label={displayName}
          value={selectedValues[0] || ""}
          onChange={(e) => {
            const value = e.target.value
            onChange(value ? [value] : [])
          }}
          aria-label={`${displayName} filter`}
        />
      </Box>
    )
  }

  return null
}
