import React from "react";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import type { ExtendedTheme } from "../../../hooks/styles/Theme";
import { QualityBadge } from "./QualityBadge";

interface Variant {
  variant_id: string;
  display_name: string;
  short_name?: string;
  attributes: {
    quality_tier?: number;
    quality_value?: number;
    crafted_source?: string;
    [key: string]: any;
  };
  quantity: number;
  price: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * VariantSelector - Dropdown for selecting specific variant from listing
 * 
 * Displays variants with quality tier badge, display name, quantity, and price.
 * Maintains visual consistency with V1 dropdown styling.
 * 
 * Used in cart, order placement, and listing detail pages.
 */
export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  label = "Select Variant",
  disabled = false,
}) => {
  const theme = useTheme<ExtendedTheme>();

  if (variants.length === 0) {
    return null;
  }

  // If only one variant, show it as read-only
  if (variants.length === 1) {
    const variant = variants[0];
    return (
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            border: 1,
            borderColor: theme.palette.divider,
            borderRadius: theme.borderRadius?.input ?? 0.5,
          }}
        >
          {variant.attributes.quality_tier && (
            <QualityBadge tier={variant.attributes.quality_tier} size="small" />
          )}
          <Typography variant="body2" sx={{ flex: 1 }}>
            {variant.display_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Qty: {variant.quantity}
          </Typography>
          <Typography variant="body2" color="primary" fontWeight="bold">
            {variant.price.toLocaleString()} aUEC
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <TextField
      select
      fullWidth
      size="small"
      color="secondary"
      label={label}
      value={selectedVariantId ?? ""}
      onChange={(e) => onVariantChange(e.target.value)}
      disabled={disabled}
      SelectProps={{
        IconComponent: KeyboardArrowDownRoundedIcon,
      }}
    >
      {variants.map((variant) => (
        <MenuItem key={variant.variant_id} value={variant.variant_id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            {variant.attributes.quality_tier && (
              <QualityBadge
                tier={variant.attributes.quality_tier}
                size="small"
              />
            )}
            <Typography variant="body2" sx={{ flex: 1 }}>
              {variant.display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Qty: {variant.quantity}
            </Typography>
            <Typography variant="body2" color="primary" fontWeight="bold">
              {variant.price.toLocaleString()} aUEC
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </TextField>
  );
};
