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
import { useCreateStandingBuyOrderMutation, useSearchResourcesQuery, type GameItemSearchResult } from "../../../../store/api/v2/market";
import { useNavigate } from "react-router-dom";

import { getQualityMode, type QualityMode } from "../../../../util/qualityMode";
import { QualityBandSelect } from "../../../../components/game-data/QualityBandSelect";

/**
 * CreateBuyOrderV2 Component
 * Form for creating buy orders with conditional quality inputs based on item type.
 */

interface CreateBuyOrderV2Props {
  gameItem: GameItemSearchResult;
}

export function CreateBuyOrderV2({ gameItem }: CreateBuyOrderV2Props) {
  const { id: gameItemId, name: gameItemName, type: gameItemType } = gameItem;
  const { t } = useTranslation();
  const theme = useTheme<ExtendedTheme>();
  const issueAlert = useAlertHook();
  const [createStandingBuyOrder, { isLoading: isSubmitting }] = useCreateStandingBuyOrderMutation();
  const navigate = useNavigate();

  // Form state
  const [negotiable, setNegotiable] = useState(false);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [qualityTierMin, setQualityTierMin] = useState<number | null>(null);
  const [qualityTierMax, setQualityTierMax] = useState<number | null>(null);
  const [qualityValueMin, setQualityValueMin] = useState<number | null>(null);
  const [qualityValueMax, setQualityValueMax] = useState<number | null>(null);
  const qualityMode = getQualityMode(gameItemType);
  const { data: resourceData } = useSearchResourcesQuery(
    { text: gameItemName || undefined, pageSize: 1 },
    { skip: qualityMode !== "value" || !gameItemName },
  )
  const qualityBands = resourceData?.resources?.[0]?.quality_bands

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

    try {
      const result = await createStandingBuyOrder({
        createStandingBuyOrderRequest: {
          game_item_id: gameItemId,
          quantity,
          price_per_unit: priceMax || priceMin || 0,
          quality_tier_min: qualityMode === "tier" ? (qualityTierMin ?? undefined) : undefined,
          quality_tier_max: qualityMode === "tier" ? (qualityTierMax ?? undefined) : undefined,
          quality_value_min: qualityMode === "value" ? (qualityValueMin ?? undefined) : undefined,
          quality_value_max: qualityMode === "value" ? (qualityValueMax ?? undefined) : undefined,
          negotiable,
        },
      }).unwrap();

      issueAlert({
        message: t("buyorder.created", "Buy order created successfully"),
        severity: "success",
      });

      navigate("/buyorders");

      // Reset form
      setNegotiable(false);
      setPriceMin(0);
      setPriceMax(0);
      setQuantity(1);
      setQualityTierMin(null);
      setQualityTierMax(null);
    } catch (error: any) {
      const message = error?.data?.message || error?.data?.error || error?.message || "Failed to create buy order"
      issueAlert({
        message,
        severity: "error",
      });
    }
  }, [
    isValid,
    gameItemId,
    quantity,
    priceMin,
    priceMax,
    qualityTierMin,
    qualityTierMax,
    negotiable,
    createStandingBuyOrder,
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
        {/* Quality — conditional based on item type */}
        {qualityMode === "tier" && (<>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth color="secondary" size="small"
              label={t("market.qualityTierMin", "Min Quality Tier")}
              value={qualityTierMin ?? ""}
              onChange={(e) => setQualityTierMin(e.target.value === "" ? null : Number(e.target.value))}
              SelectProps={{ native: true }}>
              <option value="">Any</option>
              {[1,2,3,4,5].map(t => <option key={t} value={t}>Tier {t}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth color="secondary" size="small"
              label={t("market.qualityTierMax", "Max Quality Tier")}
              value={qualityTierMax ?? ""}
              onChange={(e) => setQualityTierMax(e.target.value === "" ? null : Number(e.target.value))}
              SelectProps={{ native: true }}>
              <option value="">Any</option>
              {[1,2,3,4,5].map(t => <option key={t} value={t}>Tier {t}</option>)}
            </TextField>
          </Grid>
        </>)}

        {qualityMode === "value" && (<>
          <Grid item xs={12} sm={6}>
            {qualityBands && qualityBands.length > 0 ? (
              <QualityBandSelect
                bands={qualityBands}
                value={qualityValueMin}
                onChange={setQualityValueMin}
                label="Min Quality"
              />
            ) : (
              <NumericFormat decimalScale={0} allowNegative={false} customInput={TextField}
                size="small" fullWidth color="secondary"
                isAllowed={({ floatValue }) => !floatValue || floatValue <= 1000}
                label="Min Quality (0-1000)"
                value={qualityValueMin ?? ""}
                onValueChange={(v) => setQualityValueMin(v.floatValue ?? null)} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {qualityBands && qualityBands.length > 0 ? (
              <QualityBandSelect
                bands={qualityBands}
                value={qualityValueMax}
                onChange={setQualityValueMax}
                label="Max Quality"
              />
            ) : (
              <NumericFormat decimalScale={0} allowNegative={false} customInput={TextField}
                size="small" fullWidth color="secondary"
                isAllowed={({ floatValue }) => !floatValue || floatValue <= 1000}
                label="Max Quality (0-1000)"
                value={qualityValueMax ?? ""}
                onValueChange={(v) => setQualityValueMax(v.floatValue ?? null)} />
            )}
          </Grid>
        </>)}

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
            autoFocus
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
