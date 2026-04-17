import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
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
  locations?: string[];
}

interface VariantBreakdownProps {
  variants: Variant[];
  onSelectVariant?: (variantId: string) => void;
  showActions?: boolean;
}

/**
 * VariantBreakdown - Quality tier table display for listing variants
 * 
 * Displays all variants in a table with columns:
 * - Quality tier badge
 * - Display name
 * - Quantity available
 * - Price
 * - Action button (optional)
 * 
 * Responsive: switches to card layout on mobile.
 * Maintains visual consistency with V1 table styling.
 */
export const VariantBreakdown: React.FC<VariantBreakdownProps> = ({
  variants,
  onSelectVariant,
  showActions = true,
}) => {
  const theme = useTheme<ExtendedTheme>();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (variants.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No variants available
        </Typography>
      </Box>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {variants.map((variant) => (
          <Paper
            key={variant.variant_id}
            sx={{
              p: 2,
              borderRadius: theme.borderRadius?.topLevel ?? 0.375,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {variant.attributes.quality_tier && (
                  <QualityBadge
                    tier={variant.attributes.quality_tier}
                    size="small"
                  />
                )}
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  {variant.display_name}
                </Typography>
              </Box>

              {variant.attributes.crafted_source && (
                <Chip
                  label={variant.attributes.crafted_source}
                  size="small"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                />
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Qty: {variant.quantity}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {variant.price.toLocaleString()} aUEC
                </Typography>
              </Box>

              {variant.locations && variant.locations.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Locations: {variant.locations.join(", ")}
                </Typography>
              )}

              {showActions && onSelectVariant && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => onSelectVariant(variant.variant_id)}
                  disabled={variant.quantity === 0}
                  fullWidth
                >
                  Add to Cart
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  // Desktop table layout
  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: theme.borderRadius?.topLevel ?? 0.375 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Quality</TableCell>
            <TableCell>Variant</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
            {showActions && <TableCell align="center">Action</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {variants.map((variant) => (
            <TableRow
              key={variant.variant_id}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell>
                {variant.attributes.quality_tier && (
                  <QualityBadge
                    tier={variant.attributes.quality_tier}
                    size="small"
                  />
                )}
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {variant.display_name}
                  </Typography>
                  {variant.attributes.crafted_source && (
                    <Chip
                      label={variant.attributes.crafted_source}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                  {variant.locations && variant.locations.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {variant.locations.join(", ")}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{variant.quantity}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="primary" fontWeight="bold">
                  {variant.price.toLocaleString()} aUEC
                </Typography>
              </TableCell>
              {showActions && (
                <TableCell align="center">
                  {onSelectVariant && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => onSelectVariant(variant.variant_id)}
                      disabled={variant.quantity === 0}
                    >
                      Add
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
