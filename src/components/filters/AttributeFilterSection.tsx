import React from "react"
import { useTranslation } from "react-i18next"
import { useState, useEffect, useMemo } from "react"
import { useLazySearchAttributeValuesQuery } from "../../store/api/attributes"
import { debounce } from "lodash-es"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';

export interface AttributeFilterSectionProps {
  attributeName: string
  displayName: string
  attributeType: "select" | "multiselect" | "range" | "text"
  allowedValues: string[] | null
  selectedValues: string[]
  onChange: (values: string[]) => void
  itemType?: string // For fetching valid text values
}

export function AttributeFilterSection({
  attributeName,
  displayName,
  attributeType,
  allowedValues,
  selectedValues,
  onChange,
  itemType,
}: AttributeFilterSectionProps) {
  const { t } = useTranslation()
  const [searchTrigger] = useLazySearchAttributeValuesQuery()
  const [textOptions, setTextOptions] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")

  // Try to translate the display name, fall back to the raw value
  const translatedDisplayName = t(`attributes.${attributeName}`, displayName)

  // Debounced search for text attributes
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (attributeType === "text" && query.length > 0) {
          const result = await searchTrigger({
            attributeName,
            query,
            itemType,
            limit: 20,
          })
          if (result.data) {
            setTextOptions(result.data)
          }
        }
      }, 300),
    [attributeName, attributeType, itemType, searchTrigger],
  )

  useEffect(() => {
    debouncedSearch(inputValue)
  }, [inputValue, debouncedSearch])

  // Render single-select dropdown
  if (attributeType === "select") {
    return (
      <Box sx={{ mb: 1 }}>
        <TextField
          select
          fullWidth
          size="small"
          color="secondary"
          label={translatedDisplayName}
          value={selectedValues[0] || ""}
          onChange={(e) => {
            const value = e.target.value
            onChange(value ? [value] : [])
          }}
          aria-label={`${translatedDisplayName} filter`}
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

  // Render multi-select with Autocomplete
  if (attributeType === "multiselect") {
    const options = allowedValues ?? []
    return (
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          multiple
          size="small"
          options={options}
          value={selectedValues}
          onChange={(event, newValue) => {
            onChange(newValue)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={translatedDisplayName}
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
          aria-label={`${translatedDisplayName} filter`}
        />
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
          {translatedDisplayName}
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
              "aria-label": `${translatedDisplayName} minimum`,
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
              "aria-label": `${translatedDisplayName} maximum`,
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
        <Autocomplete
          freeSolo
          size="small"
          options={textOptions}
          value={selectedValues[0] || ""}
          inputValue={inputValue}
          onChange={(event, newValue) => {
            onChange(newValue ? [newValue] : [])
          }}
          onInputChange={(event, newValue) => {
            setInputValue(newValue)
            if (!newValue) {
              onChange([])
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={translatedDisplayName}
              size="small"
              color="secondary"
            />
          )}
          aria-label={`${translatedDisplayName} filter`}
        />
      </Box>
    )
  }

  return null
}
