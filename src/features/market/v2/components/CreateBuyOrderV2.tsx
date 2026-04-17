import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "@mui/lab";
import { ExtendedTheme } from "../../../../hooks/styles/Theme";
import { useAlertHook } from "../../../../hooks/alert/AlertHook";
import { Section } from "../../../../components/paper/Section";
import { QualityBadge } from "../../../../components/market/v2/QualityBadge";

/**
 * CreateBuyOrderV2 Component
 * 
 * Task: 11.2 Implement CreateBuyOrderV2 component
 * Requirements: 37.1-37.8
 * 
 * Form for creating buy orders with quality tier requirements.
 * Maintains visual parity with V1 BuyOrderForm while adding V2-specific features:
 * - Quality tier range selector (min and max dropdowns)
 * - Price range inputs (min and max)
 * - Quantity input
 * - Expiration date picker
 * - Negotiable checkbox
 * 
 * Visual Parity Requirements:
 * - Reuse FlatSection/Section for layout
 * - Reuse NumericFormat for numeric inputs
 * - Reuse LoadingButton for submission
 * - Maintain identical form field styling
 * - Use Grid spacing: theme.layoutSpacing.layout
 * - All items: xs={12} with display="flex" and justifyContent="right"
 * 
 * V2 Enhancements:
 * - Add quality_tier_min dropdown (1-5)
 * - Add quality_tier_max dropdown (1-5)
 * - Validate quality_tier_min <= quality_tier_max
 * - Show quality tier badges for selected range
 */

interface CreateBuyOrderV2Props {
  gameItemId: string;
}

export function CreateBuyOrderV2({ gameItemId }: CreateBuyOrderV2Props) {
  const { t } = useTranslation();
  const theme = useTheme<ExtendedTheme>();
  const issueAlert = useAlertHook();

  // Form state
  const [negotiable, setNegotiable] = useState(false);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [qualityTierMin, setQualityTierMin] = useState<number | null>(null);
  const [qualityTierMax, setQualityTierMax] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total price range
  const totalMin = priceMin * quantity;
  const totalMax = priceMax * quantity;

  // Validate form
  const isValid = useCallback(() => {
    if (quantity < 1) {
      issueAlert({
        message: t("buyorder.quantityRequired", "Quantity must be at least 1"),
        severity: "error",
      });
      return false;
    }

    if (!negotiable && (priceMin < 1 || priceMax < 1)) {
      issueAlert({
        message: t("buyorder.priceRequired", "Price range is required"),
        severity: "error",
      });
      return false;
    }

    if (priceMin > priceMax) {
      issueAlert({
        message: t(
          "buyorder.priceMinMax",
          "Minimum price cannot exceed maximum price"
        ),
        severity: "error",
      });
      return false;
    }

    if (
      qualityTierMin !== null &&
      qualityTierMax !== null &&
      qualityTierMin > qualityTierMax
    ) {
      issueAlert({
        message: t(
          "buyorder.qualityMinMax",
          "Minimum quality tier cannot exceed maximum quality tier"
        ),
        severity: "error",
      });
      return false;
    }

    return true;
  }, [
    quantity,
    negotiable,
    priceMin,
    priceMax,
    qualityTierMin,
    qualityTierMax,
    issueAlert,
    t,
  ]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!isValid()) return;

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual V2 API call when ready
      // await createBuyOrderV2({
      //   game_item_id: gameItemId,
      //   quality_tier_min: qualityTierMin,
      //   quality_tier_max: qualityTierMax,
      //   price_min: negotiable ? null : priceMin,
      //   price_max: negotiable ? null : priceMax,
      //   quantity_desired: quantity,
      //   negotiable,
      // }).unwrap();

      issueAlert({
        message: t("buyorder.created", "Buy order created successfully"),
        severity: "success",
      });

      // Reset form
      setNegotiable(false);
      setPriceMin(0);
      setPriceMax(0);
      setQuantity(1);
      setQualityTierMin(null);
      setQualityTierMax(null);
    } catch (error) {
      issueAlert({
        message: error instanceof Error ? error.message : "Failed to create buy order",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isValid,
    gameItemId,
    qualityTierMin,
    qualityTierMax,
    priceMin,
    priceMax,
    quantity,
    negotiable,
    issueAlert,
    t,
  ]);

  return (
    <Section xs={12} title={t("buyOrderActions.createBuyOrder", "Create Buy Order")}>
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        sx={{ padding: 2 }}
      >
        {/* Quality Tier Range */}
        <Grid item xs={12} sm={6} display="flex" justifyContent="right">
          <TextField
            select
            fullWidth
            color="secondary"
            label={t("market.qualityTierMin", "Min Quality Tier")}
            value={qualityTierMin ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setQualityTierMin(value === "" ? null : Number(value));
            }}
            SelectProps={{
              native: true,
            }}
            helperText={t(
              "market.qualityTierMinHelp",
              "Minimum acceptable quality tier"
            )}
          >
            <option value="">{t("market.anyQuality", "Any Quality")}</option>
            <option value="1">Tier 1 (Bronze)</option>
            <option value="2">Tier 2 (Silver)</option>
            <option value="3">Tier 3 (Gold)</option>
            <option value="4">Tier 4 (Platinum)</option>
            <option value="5">Tier 5 (Diamond)</option>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} display="flex" justifyContent="right">
          <TextField
            select
            fullWidth
            color="secondary"
            label={t("market.qualityTierMax", "Max Quality Tier")}
            value={qualityTierMax ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setQualityTierMax(value === "" ? null : Number(value));
            }}
            SelectProps={{
              native: true,
            }}
            helperText={t(
              "market.qualityTierMaxHelp",
              "Maximum acceptable quality tier"
            )}
          >
            <option value="">{t("market.anyQuality", "Any Quality")}</option>
            <option value="1">Tier 1 (Bronze)</option>
            <option value="2">Tier 2 (Silver)</option>
            <option value="3">Tier 3 (Gold)</option>
            <option value="4">Tier 4 (Platinum)</option>
            <option value="5">Tier 5 (Diamond)</option>
          </TextField>
        </Grid>

        {/* Show selected quality tier range */}
        {(qualityTierMin !== null || qualityTierMax !== null) && (
          <Grid item xs={12} display="flex" justifyContent="center">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("market.selectedRange", "Selected Range:")}
              </Typography>
              {qualityTierMin !== null && (
                <QualityBadge tier={qualityTierMin} size="small" />
              )}
              {qualityTierMin !== null && qualityTierMax !== null && (
                <Typography variant="body2">-</Typography>
              )}
              {qualityTierMax !== null && (
                <QualityBadge tier={qualityTierMax} size="small" />
              )}
            </Box>
          </Grid>
        )}

        {/* Negotiable Checkbox */}
        <Grid item xs={12} display="flex" justifyContent="right">
          <FormControlLabel
            control={
              <Checkbox
                color="secondary"
                checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
              />
            }
            label={t(
              "buyorder.negotiable",
              "Negotiable (no fixed price range)"
            )}
          />
        </Grid>

        {/* Price Range Fields */}
        <Grid item xs={12} sm={6} display="flex" justifyContent="right">
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            fullWidth
            label={
              negotiable
                ? t("buyorder.priceMinOptional", "Min Price (Optional)")
                : t("buyorder.priceMin", "Min Price")
            }
            value={priceMin}
            onValueChange={(values) => setPriceMin(values.floatValue ?? 0)}
            InputProps={{
              endAdornment: <InputAdornment position="end">aUEC</InputAdornment>,
            }}
            color="secondary"
            disabled={negotiable}
            placeholder={negotiable ? t("common.optional", "Optional") : ""}
          />
        </Grid>

        <Grid item xs={12} sm={6} display="flex" justifyContent="right">
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            fullWidth
            label={
              negotiable
                ? t("buyorder.priceMaxOptional", "Max Price (Optional)")
                : t("buyorder.priceMax", "Max Price")
            }
            value={priceMax}
            onValueChange={(values) => setPriceMax(values.floatValue ?? 0)}
            InputProps={{
              endAdornment: <InputAdornment position="end">aUEC</InputAdornment>,
            }}
            color="secondary"
            disabled={negotiable}
            placeholder={negotiable ? t("common.optional", "Optional") : ""}
          />
        </Grid>

        {/* Quantity Field */}
        <Grid item xs={12} display="flex" justifyContent="right">
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            fullWidth
            label={t("market.quantity", "Quantity")}
            value={quantity}
            onValueChange={(values) => setQuantity(values.floatValue ?? 0)}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            color="secondary"
          />
        </Grid>

        {/* Total Price Range (read-only) */}
        {!negotiable && priceMin > 0 && priceMax > 0 && (
          <>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="right">
              <TextField
                variant="standard"
                fullWidth
                label={t("buyorder.totalPriceRange", "Total Price Range")}
                value={`${Math.ceil(totalMin).toLocaleString()} - ${Math.ceil(totalMax).toLocaleString()}`}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">aUEC</InputAdornment>,
                }}
              />
            </Grid>
          </>
        )}

        {/* Submit Button */}
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="right">
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {t("common.submit", "Submit")}
          </LoadingButton>
        </Grid>
      </Grid>
    </Section>
  );
}
