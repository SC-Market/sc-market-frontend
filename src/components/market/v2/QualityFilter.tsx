import React from "react"
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  Stack,
  Chip,
} from "@mui/material"
import { useTranslation } from "react-i18next"

/**
 * QualityFilterProps - Props for QualityFilter component
 */
export interface QualityFilterProps {
  /** Minimum quality tier (1-5) */
  minTier: number | ""
  /** Maximum quality tier (1-5) */
  maxTier: number | ""
  /** Callback when minimum tier changes */
  onMinChange: (tier: number | "") => void
  /** Callback when maximum tier changes */
  onMaxChange: (tier: number | "") => void
  /** Optional label for the filter section */
  label?: string
  /** Whether to show visual tier indicators */
  showIndicators?: boolean
}

/**
 * QualityFilter - Reusable quality tier filter component
 * 
 * Provides dual dropdown selectors for quality tier range filtering.
 * Validates that min <= max and provides visual tier indicators.
 * 
 * Requirements: 6.6, 17.5
 * 
 * @example
 * ```tsx
 * <QualityFilter
 *   minTier={1}
 *   maxTier={5}
 *   onMinChange={(tier) => setMinTier(tier)}
 *   onMaxChange={(tier) => setMaxTier(tier)}
 * />
 * ```
 */
export function QualityFilter({
  minTier,
  maxTier,
  onMinChange,
  onMaxChange,
  label,
  showIndicators = true,
}: QualityFilterProps) {
  const { t } = useTranslation()

  // Handle min tier change with validation
  const handleMinChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value
    const newMin = value === "" ? "" : Number(value)
    
    // Validate: if max is set and new min > max, adjust max
    if (newMin !== "" && maxTier !== "" && newMin > maxTier) {
      onMaxChange(newMin)
    }
    
    onMinChange(newMin)
  }

  // Handle max tier change with validation
  const handleMaxChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value
    const newMax = value === "" ? "" : Number(value)
    
    // Validate: if min is set and new max < min, adjust min
    if (newMax !== "" && minTier !== "" && newMax < minTier) {
      onMinChange(newMax)
    }
    
    onMaxChange(newMax)
  }

  // Get tier label with translation
  const getTierLabel = (tier: number): string => {
    return t(`market.v2.quality.tier${tier}`, `Tier ${tier}`)
  }

  // Get tier color for visual indicators
  // Tier 1 (lowest) -> default/gray
  // Tier 2 -> primary/blue
  // Tier 3 -> secondary/purple
  // Tier 4 -> warning/orange
  // Tier 5 (highest) -> success/green
  const getTierColor = (tier: number): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
    switch (tier) {
      case 1:
        return "default"
      case 2:
        return "primary"
      case 3:
        return "secondary"
      case 4:
        return "warning"
      case 5:
        return "success"
      default:
        return "default"
    }
  }

  // Get tier icon/symbol for visual distinction
  const getTierIcon = (tier: number): string => {
    switch (tier) {
      case 1:
        return "★"
      case 2:
        return "★★"
      case 3:
        return "★★★"
      case 4:
        return "★★★★"
      case 5:
        return "★★★★★"
      default:
        return ""
    }
  }

  return (
    <Box>
      {/* Section Label */}
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}

      {/* Tier Range Selectors */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Min Tier Dropdown */}
        <FormControl fullWidth>
          <InputLabel>
            {t("market.v2.quality.minTier", "Min Tier")}
          </InputLabel>
          <Select
            value={minTier}
            label={t("market.v2.quality.minTier", "Min Tier")}
            onChange={handleMinChange}
          >
            <MenuItem value="">
              <em>{t("market.v2.search.any", "Any")}</em>
            </MenuItem>
            <MenuItem value={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(1)}</span>
                <span>{getTierLabel(1)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(2)}</span>
                <span>{getTierLabel(2)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(3)}</span>
                <span>{getTierLabel(3)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(4)}</span>
                <span>{getTierLabel(4)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(5)}</span>
                <span>{getTierLabel(5)}</span>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Separator */}
        <Typography variant="body2" color="text.secondary">
          {t("market.v2.quality.to", "to")}
        </Typography>

        {/* Max Tier Dropdown */}
        <FormControl fullWidth>
          <InputLabel>
            {t("market.v2.quality.maxTier", "Max Tier")}
          </InputLabel>
          <Select
            value={maxTier}
            label={t("market.v2.quality.maxTier", "Max Tier")}
            onChange={handleMaxChange}
          >
            <MenuItem value="">
              <em>{t("market.v2.search.any", "Any")}</em>
            </MenuItem>
            <MenuItem value={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(1)}</span>
                <span>{getTierLabel(1)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(2)}</span>
                <span>{getTierLabel(2)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(3)}</span>
                <span>{getTierLabel(3)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(4)}</span>
                <span>{getTierLabel(4)}</span>
              </Stack>
            </MenuItem>
            <MenuItem value={5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{getTierIcon(5)}</span>
                <span>{getTierLabel(5)}</span>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Visual Tier Indicators */}
      {showIndicators && (minTier !== "" || maxTier !== "") && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {minTier !== "" && (
            <Chip
              label={`${t("market.v2.quality.min", "Min")}: ${getTierLabel(minTier)}`}
              color={getTierColor(minTier)}
              size="small"
              variant="outlined"
            />
          )}
          {maxTier !== "" && (
            <Chip
              label={`${t("market.v2.quality.max", "Max")}: ${getTierLabel(maxTier)}`}
              color={getTierColor(maxTier)}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      )}
    </Box>
  )
}
