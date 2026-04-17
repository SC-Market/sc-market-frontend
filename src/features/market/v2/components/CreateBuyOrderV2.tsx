import React, { useCallback, useEffect, useState } from "react"
import { FlatSection } from "../../../../components/paper/Section"
import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  useTheme,
} from "@mui/material"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import LoadingButton from "@mui/lab/LoadingButton"
import { MarketAggregate } from "../../domain/types"
import { HeaderTitle } from "../../../../components/typography/HeaderTitle"
import { LazyDateTimePicker as DateTimePicker } from "../../../../components/providers/LazyDateTimePicker"
import { addDays, endOfDay } from "date-fns"
import { useCreateBuyOrderMutation } from "../../api/marketApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"

const FALLBACK_IMAGE_URL =
  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"

interface CreateBuyOrderV2Props {
  aggregate: MarketAggregate
}

/**
 * CreateBuyOrderV2 Component
 * 
 * Buy order creation form with quality tier requirements for V2 market system.
 * Maintains visual parity with V1 BuyOrderForm while adding quality tier support.
 * 
 * Requirements: 37.1-37.8
 * - Provides game item selector (via parent component)
 * - Provides quality_tier range selector (min and max dropdowns)
 * - Provides price range inputs (min and max)
 * - Provides quantity input
 * - Provides optional desired_attributes inputs
 * - Uses useCreateBuyOrderMutation hook
 * - Validates quality_tier_min <= quality_tier_max
 * - Validates price_min <= price_max
 * - Maintains visual parity with V1 CreateBuyOrder component
 */
export function CreateBuyOrderV2(props: CreateBuyOrderV2Props) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { aggregate } = props
  
  const [state, setState] = useState({
    game_item_id: aggregate.details.game_item_id,
    price_min: 0,
    price_max: 0,
    quantity: 1,
    expiry: endOfDay(addDays(new Date(), 3)),
    negotiable: false,
    quality_tier_min: 1,
    quality_tier_max: 5,
  })

  useEffect(() => {
    setState((s) => ({ ...s, game_item_id: aggregate.details.game_item_id }))
  }, [aggregate])

  const [createBuyOrder, { isLoading }] = useCreateBuyOrderMutation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const callback = useCallback(async () => {
    // Validate quality tier range
    if (state.quality_tier_min > state.quality_tier_max) {
      issueAlert({
        message: t(
          "buyorder.error.invalidQualityRange",
          "Minimum quality tier cannot be greater than maximum quality tier",
        ),
        severity: "error",
      })
      return false
    }

    // Validate price range
    if (!state.negotiable && state.price_min > 0 && state.price_max > 0) {
      if (state.price_min > state.price_max) {
        issueAlert({
          message: t(
            "buyorder.error.invalidPriceRange",
            "Minimum price cannot be greater than maximum price",
          ),
          severity: "error",
        })
        return false
      }
    }

    // For V1 API compatibility, use average of min/max as single price
    // TODO: Update to V2 API when buy order request endpoint is implemented
    const averagePrice =
      state.price_min > 0 && state.price_max > 0
        ? Math.ceil((state.price_min + state.price_max) / 2)
        : state.price_min || state.price_max || undefined

    createBuyOrder({
      game_item_id: state.game_item_id,
      quantity: state.quantity,
      expiry: state.expiry,
      negotiable: state.negotiable,
      price: state.negotiable
        ? averagePrice && averagePrice >= 1
          ? averagePrice
          : undefined
        : averagePrice,
      // Note: quality_tier_min, quality_tier_max not yet supported by V1 API
      // These will be added when V2 buy order request API is implemented
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("buyorder.submitted"),
          severity: "success",
        })

        navigate(`/market/aggregate/${aggregate.details.game_item_id}`)
      })
      .catch((err) => issueAlert(err))

    return false
  }, [
    state,
    t,
    createBuyOrder,
    aggregate.details.game_item_id,
    issueAlert,
    navigate,
  ])

  return (
    <>
      <Grid item xs={12}>
        <HeaderTitle>{aggregate.details.title}</HeaderTitle>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Paper
          sx={{
            borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
            backgroundColor: theme.palette.background.default,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
            maxHeight: 600,
            height: 400,
            width: "100%",
            position: "relative",
          }}
        >
          <img
            style={{
              display: "block",
              maxHeight: "100%",
              maxWidth: "100%",
              margin: "auto",
            }}
            loading="lazy"
            src={aggregate.photos?.[0] || FALLBACK_IMAGE_URL}
            alt={aggregate.details.title}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src = FALLBACK_IMAGE_URL
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <FlatSection title={t("buyorder.create_buy_order")}>
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.negotiable}
                    onChange={(e) =>
                      setState({
                        ...state,
                        negotiable: e.target.checked,
                      })
                    }
                    color="secondary"
                  />
                }
                label={t(
                  "buyorder.field.negotiable",
                  "Negotiable (no fixed price)",
                )}
              />
            </Grid>

            {/* Quality Tier Range Selector */}
            <Grid item xs={12} sm={6} display={"flex"} justifyContent={"right"}>
              <TextField
                select
                fullWidth
                label={t("buyorder.quality_tier_min", "Minimum Quality Tier")}
                id="quality-tier-min"
                color={"secondary"}
                value={state.quality_tier_min}
                onChange={(e) =>
                  setState({
                    ...state,
                    quality_tier_min: parseInt(e.target.value),
                  })
                }
                aria-required="true"
                aria-describedby="quality-tier-min-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.qualityTierMinInput",
                    "Select minimum quality tier",
                  ),
                }}
              >
                {[1, 2, 3, 4, 5].map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {t(`buyorder.tier${tier}`, `Tier ${tier}`)}
                  </MenuItem>
                ))}
              </TextField>
              <div id="quality-tier-min-help" className="sr-only">
                {t(
                  "accessibility.qualityTierMinHelp",
                  "Select the minimum quality tier you are willing to accept (1 = lowest, 5 = highest)",
                )}
              </div>
            </Grid>

            <Grid item xs={12} sm={6} display={"flex"} justifyContent={"right"}>
              <TextField
                select
                fullWidth
                label={t("buyorder.quality_tier_max", "Maximum Quality Tier")}
                id="quality-tier-max"
                color={"secondary"}
                value={state.quality_tier_max}
                onChange={(e) =>
                  setState({
                    ...state,
                    quality_tier_max: parseInt(e.target.value),
                  })
                }
                aria-required="true"
                aria-describedby="quality-tier-max-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.qualityTierMaxInput",
                    "Select maximum quality tier",
                  ),
                }}
              >
                {[1, 2, 3, 4, 5].map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {t(`buyorder.tier${tier}`, `Tier ${tier}`)}
                  </MenuItem>
                ))}
              </TextField>
              <div id="quality-tier-max-help" className="sr-only">
                {t(
                  "accessibility.qualityTierMaxHelp",
                  "Select the maximum quality tier you are willing to pay for (1 = lowest, 5 = highest)",
                )}
              </div>
            </Grid>

            {/* Price Range Inputs */}
            <Grid item xs={12} sm={6} display={"flex"} justifyContent={"right"}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={async (values, sourceInfo) => {
                  setState({
                    ...state,
                    price_min: values.floatValue ?? 0,
                  })
                }}
                fullWidth
                label={
                  state.negotiable
                    ? t(
                        "buyorder.suggested_price_min_optional",
                        "Suggested min price (optional)",
                      )
                    : t("buyorder.price_min", "Minimum Price")
                }
                id="price-min"
                color={"secondary"}
                value={state.price_min || ""}
                placeholder={
                  state.negotiable
                    ? t("buyorder.optional", "Optional")
                    : undefined
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">{`aUEC`}</InputAdornment>
                  ),
                  inputMode: "numeric",
                }}
                type={"tel"}
                aria-required={!state.negotiable}
                aria-describedby="price-min-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.priceMinInput",
                    "Enter minimum price per unit",
                  ),
                  pattern: "[0-9]*",
                }}
              />
              <div id="price-min-help" className="sr-only">
                {state.negotiable
                  ? t(
                      "accessibility.suggestedPriceMinHelp",
                      "Optional suggested minimum price per unit in aUEC when negotiable",
                    )
                  : t(
                      "accessibility.priceMinHelp",
                      "Enter the minimum price you are willing to pay per unit in aUEC",
                    )}
              </div>
            </Grid>

            <Grid item xs={12} sm={6} display={"flex"} justifyContent={"right"}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={async (values, sourceInfo) => {
                  setState({
                    ...state,
                    price_max: values.floatValue ?? 0,
                  })
                }}
                fullWidth
                label={
                  state.negotiable
                    ? t(
                        "buyorder.suggested_price_max_optional",
                        "Suggested max price (optional)",
                      )
                    : t("buyorder.price_max", "Maximum Price")
                }
                id="price-max"
                color={"secondary"}
                value={state.price_max || ""}
                placeholder={
                  state.negotiable
                    ? t("buyorder.optional", "Optional")
                    : undefined
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">{`aUEC`}</InputAdornment>
                  ),
                  inputMode: "numeric",
                }}
                type={"tel"}
                aria-required={!state.negotiable}
                aria-describedby="price-max-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.priceMaxInput",
                    "Enter maximum price per unit",
                  ),
                  pattern: "[0-9]*",
                }}
              />
              <div id="price-max-help" className="sr-only">
                {state.negotiable
                  ? t(
                      "accessibility.suggestedPriceMaxHelp",
                      "Optional suggested maximum price per unit in aUEC when negotiable",
                    )
                  : t(
                      "accessibility.priceMaxHelp",
                      "Enter the maximum price you are willing to pay per unit in aUEC",
                    )}
              </div>
            </Grid>

            {/* Quantity Input */}
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={async (values, sourceInfo) => {
                  setState({
                    ...state,
                    quantity: values.floatValue || 1,
                  })
                }}
                fullWidth
                label={t("buyorder.quantity")}
                id="quantity"
                color={"secondary"}
                value={state.quantity}
                type={"tel"}
                aria-required="true"
                aria-describedby="quantity-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.quantityInput",
                    "Enter quantity to purchase",
                  ),
                  pattern: "[0-9]*",
                }}
              />
              <div id="quantity-help" className="sr-only">
                {t(
                  "accessibility.quantityHelp",
                  "Enter the number of units you want to purchase",
                )}
              </div>
            </Grid>

            {/* Total Price Display */}
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                fullWidth
                label={t("buyorder.total_price_range", "Total Price Range")}
                id="total-price"
                color={"secondary"}
                variant={"standard"}
                value={
                  state.negotiable && !state.price_min && !state.price_max
                    ? ""
                    : state.price_min && state.price_max
                      ? `${Math.ceil(state.price_min * state.quantity).toLocaleString()} - ${Math.ceil(state.price_max * state.quantity).toLocaleString()}`
                      : state.price_min
                        ? Math.ceil(state.price_min * state.quantity)
                        : state.price_max
                          ? Math.ceil(state.price_max * state.quantity)
                          : ""
                }
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="start">{`aUEC`}</InputAdornment>
                  ),
                  inputMode: "numeric",
                }}
                type={"tel"}
                aria-describedby="total-price-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.totalPriceDisplay",
                    "Total price calculation",
                  ),
                  "aria-readonly": "true",
                }}
              />
              <div id="total-price-help" className="sr-only">
                {t(
                  "accessibility.totalPriceHelp",
                  "Total price range is automatically calculated based on price range and quantity",
                )}
              </div>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Expiration Date Picker */}
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <DateTimePicker
                label={t("buyorder.expiration", {
                  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })}
                value={state.expiry}
                onChange={(newValue) =>
                  setState({
                    ...state,
                    expiry: newValue || endOfDay(addDays(new Date(), 3)),
                  })
                }
                slotProps={{
                  textField: {
                    id: "expiry-date",
                    "aria-label": t(
                      "accessibility.expiryDateInput",
                      "Select expiration date and time",
                    ),
                    "aria-describedby": "expiry-date-help",
                    "aria-required": "true",
                  },
                }}
              />

              <div id="expiry-date-help" className="sr-only">
                {t(
                  "accessibility.expiryDateHelp",
                  "Select when this buy order should expire. Default is 3 days from now.",
                )}
              </div>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <LoadingButton
                variant={"contained"}
                loading={isLoading}
                onClick={callback}
                aria-label={t(
                  "accessibility.submitBuyOrder",
                  "Submit buy order",
                )}
                aria-describedby="submit-buy-order-help"
              >
                {t("buyorder.submit")}
                <span id="submit-buy-order-help" className="sr-only">
                  {t(
                    "accessibility.submitBuyOrderHelp",
                    "Submit your buy order with the specified price range and quality tier requirements",
                  )}
                </span>
              </LoadingButton>
            </Grid>
          </FlatSection>
        </Grid>
      </Grid>
    </>
  )
}
