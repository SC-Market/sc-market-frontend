import React from "react"
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material"
import { useTranslation } from "react-i18next"

interface Variant {
  variant_id: string
  display_name: string
  short_name: string
  attributes: Record<string, any>
  quantity: number
  price: number
  locations?: string[]
}

interface VariantBreakdownProps {
  variants: Variant[]
  onSelectVariant: (variantId: string) => void
}

/**
 * VariantBreakdown Component
 * 
 * Displays a table of available variants with:
 * - Quality tier information
 * - Quantity available
 * - Price per variant
 * - Select button for purchase
 * 
 * CRITICAL: Matches V1 table styling and interaction patterns
 * 
 * Requirements: 15.4, 15.5, 15.6
 */
export function VariantBreakdown({
  variants,
  onSelectVariant,
}: VariantBreakdownProps) {
  const { t } = useTranslation()

  if (!variants || variants.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t("MarketListingView.noVariants", "No variants available")}
        </Typography>
      </Box>
    )
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} aUEC`
  }

  const getQualityTierColor = (tier: number): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
    if (tier >= 5) return "success"
    if (tier >= 4) return "primary"
    if (tier >= 3) return "secondary"
    if (tier >= 2) return "warning"
    return "default"
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("MarketListingView.quality", "Quality")}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2" fontWeight="bold">
                {t("MarketListingView.quantity", "Quantity")}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2" fontWeight="bold">
                {t("MarketListingView.price", "Price")}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="subtitle2" fontWeight="bold">
                {t("MarketListingView.action", "Action")}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {variants.map((variant) => {
            const qualityTier = variant.attributes.quality_tier || 1
            const qualityValue = variant.attributes.quality_value
            const craftedSource = variant.attributes.crafted_source

            return (
              <TableRow
                key={variant.variant_id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={`Tier ${qualityTier}`}
                      size="small"
                      color={getQualityTierColor(qualityTier)}
                      sx={{ minWidth: 60 }}
                    />
                    {qualityValue !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        ({qualityValue.toFixed(1)}%)
                      </Typography>
                    )}
                    {craftedSource && craftedSource !== "unknown" && (
                      <Chip
                        label={craftedSource}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    )}
                  </Box>
                  {variant.locations && variant.locations.length > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {variant.locations.join(", ")}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {variant.quantity.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatPrice(variant.price)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onSelectVariant(variant.variant_id)}
                    disabled={variant.quantity === 0}
                  >
                    {t("MarketListingView.select", "Select")}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
