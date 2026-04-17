import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid,
  useTheme,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import type { ExtendedTheme } from "../../../hooks/styles/theme";

interface QualityFilterProps {
  minTier: number | null;
  maxTier: number | null;
  onMinTierChange: (tier: number | null) => void;
  onMaxTierChange: (tier: number | null) => void;
}

/**
 * QualityFilter - Tier range selector for filtering listings
 * 
 * Provides dropdowns for selecting minimum and maximum quality tiers (1-5).
 * Maintains visual consistency with V1 filter styling.
 * 
 * Used in MarketSidebar for search filtering.
 */
export const QualityFilter: React.FC<QualityFilterProps> = ({
  minTier,
  maxTier,
  onMinTierChange,
  onMaxTierChange,
}) => {
  const theme = useTheme<ExtendedTheme>();

  const tierOptions = [
    { value: null, label: "Any" },
    { value: 1, label: "Tier 1 (Bronze)" },
    { value: 2, label: "Tier 2 (Silver)" },
    { value: 3, label: "Tier 3 (Gold)" },
    { value: 4, label: "Tier 4 (Platinum)" },
    { value: 5, label: "Tier 5 (Diamond)" },
  ];

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: theme.layoutSpacing?.text ?? 1 }}
      >
        Quality Tier
      </Typography>
      <Grid container spacing={theme.layoutSpacing?.layout ?? 1}>
        <Grid item xs={6}>
          <TextField
            select
            fullWidth
            size="small"
            color="secondary"
            label="Min Tier"
            value={minTier ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              onMinTierChange(value === "" ? null : Number(value));
            }}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            {tierOptions.map((option) => (
              <MenuItem
                key={option.value ?? "any"}
                value={option.value ?? ""}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <TextField
            select
            fullWidth
            size="small"
            color="secondary"
            label="Max Tier"
            value={maxTier ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              onMaxTierChange(value === "" ? null : Number(value));
            }}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            {tierOptions.map((option) => (
              <MenuItem
                key={option.value ?? "any"}
                value={option.value ?? ""}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};
