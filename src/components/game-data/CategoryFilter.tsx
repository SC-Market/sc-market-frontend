/**
 * CategoryFilter - Multi-select category filter
 * 
 * Provides checkbox-based category filtering for items, blueprints, etc.
 * Follows Market V2 filter patterns.
 * 
 * Requirements: 48.1-48.10
 */

import React from "react"
import {
  Box,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  useTheme,
} from "@mui/material"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

interface CategoryOption {
  value: string
  label: string
  count?: number
}

interface CategoryFilterProps {
  /** Filter label */
  label: string
  /** Available categories */
  categories: CategoryOption[]
  /** Selected category values */
  selectedCategories: string[]
  /** Change handler */
  onChange: (selected: string[]) => void
  /** Show item counts */
  showCounts?: boolean
}

/**
 * CategoryFilter Component
 * 
 * Features:
 * - Multi-select checkboxes (48.1)
 * - Optional item counts (48.2)
 * - Consistent styling with Market V2 (48.9)
 * - Accessible form controls (48.10)
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  label,
  categories,
  selectedCategories,
  onChange,
  showCounts = false,
}) => {
  const theme = useTheme<ExtendedTheme>()

  const handleToggle = (value: string) => {
    const currentIndex = selectedCategories.indexOf(value)
    const newSelected = [...selectedCategories]

    if (currentIndex === -1) {
      newSelected.push(value)
    } else {
      newSelected.splice(currentIndex, 1)
    }

    onChange(newSelected)
  }

  return (
    <Box>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{ mb: theme.layoutSpacing?.text ?? 1 }}
          >
            {label}
          </Typography>
        </FormLabel>
        <FormGroup>
          {categories.map((category) => (
            <FormControlLabel
              key={category.value}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => handleToggle(category.value)}
                  size="small"
                  color="secondary"
                />
              }
              label={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography variant="body2">{category.label}</Typography>
                  {showCounts && category.count !== undefined && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({category.count})
                    </Typography>
                  )}
                </Box>
              }
              sx={{
                "& .MuiFormControlLabel-label": {
                  width: "100%",
                },
              }}
            />
          ))}
        </FormGroup>
      </FormControl>
    </Box>
  )
}
