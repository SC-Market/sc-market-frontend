import { useTranslation } from "react-i18next"
import React from "react";
import { formatCraftedSource } from "../../../util/variantDisplay";
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
  Chip,
  Stack,
} from "@mui/material";
import { useBreakpointDown } from "../../../hooks/layout/useBreakpoint";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { LocationOnRounded } from "@mui/icons-material";
import type { ExtendedTheme } from "../../../hooks/styles/Theme";
import { QualityBadge } from "./QualityBadge";
import { formatExactPrice, formatPrice } from "../../../util/formatPrice";

interface Variant {
  variant_id: string;
  display_name: string;
  short_name?: string;
  attributes: {
    quality_tier?: number;
    quality_value?: number;
    crafted_source?: string;
    blueprint_tier?: number;
    [key: string]: string | number | undefined;
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

const SOURCE_COLORS: Record<string, "default" | "success" | "warning" | "error" | "info" | "primary"> = {
  crafted: "success",
  store: "info",
  looted: "warning",
  duped: "error",
  unknown: "default",
};

function hasDisplayableAttributes(variant: Variant): boolean {
  const { quality_tier, quality_value, crafted_source } = variant.attributes;
  return !!(quality_tier || quality_value != null || crafted_source);
}

function VariantInfo({ variant }: { variant: Variant }) {
  const { t } = useTranslation()
  if (!hasDisplayableAttributes(variant)) return null;
  const { quality_tier, quality_value, crafted_source } = variant.attributes;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
      {quality_tier && <QualityBadge tier={quality_tier} size="small" />}
      {quality_value != null && (
        <Chip label={`${quality_value}/1000`} size="small" variant="outlined" />
      )}
      {crafted_source && (
        <Chip
          label={formatCraftedSource(crafted_source)}
          size="small"
          color={SOURCE_COLORS[crafted_source] || "default"}
          variant="outlined"
        />
      )}
    </Stack>
  );
}

/**
 * VariantBreakdown - Rich variant table with quality badges and source chips
 */
export const VariantBreakdown: React.FC<VariantBreakdownProps> = ({
  variants,
  onSelectVariant,
  showActions = true,
}) => {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>();
  const isMobile = useBreakpointDown("sm");

  if (variants.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {t("marketV2.noVariants")}
        </Typography>
      </Box>
    );
  }

  const showVariantColumn = variants.length > 1 && variants.some(hasDisplayableAttributes);

  // Mobile card layout
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {variants.map((variant) => (
          <Paper
            key={variant.variant_id}
            sx={{ p: 2, borderRadius: theme.borderRadius?.topLevel ?? 0.375 }}
          >
            <Stack spacing={1}>
              {showVariantColumn && <VariantInfo variant={variant} />}

              {variant.locations && variant.locations.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <LocationOnRounded sx={{ fontSize: 14 }} /> {variant.locations.join(", ")}
                </Typography>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {t("marketV2.qtyColon", { quantity: variant.quantity.toLocaleString() })}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold" title={formatExactPrice(variant.price)}>
                  {formatPrice(variant.price)}
                </Typography>
              </Box>

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
                  {t("marketV2.addToCart")}
                </Button>
              )}
            </Stack>
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
            {showVariantColumn && <TableCell>{t("marketV2.variant")}</TableCell>}
            <TableCell align="right">{t("marketV2.quantity")}</TableCell>
            <TableCell align="right">{t("marketV2.price")}</TableCell>
            <TableCell>{t("missionsUi.location")}</TableCell>
            {showActions && <TableCell align="center">{t("marketV2.action")}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {variants.map((variant) => (
            <TableRow
              key={variant.variant_id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {showVariantColumn && (
                <TableCell>
                  <VariantInfo variant={variant} />
                </TableCell>
              )}
              <TableCell align="right">
                <Typography variant="body2">
                  {variant.quantity.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="primary" fontWeight="bold" title={formatExactPrice(variant.price)}>
                  {formatPrice(variant.price)}
                </Typography>
              </TableCell>
              <TableCell>
                {variant.locations && variant.locations.length > 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    {variant.locations.join(", ")}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">—</Typography>
                )}
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
                      {t("marketV2.add")}
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
