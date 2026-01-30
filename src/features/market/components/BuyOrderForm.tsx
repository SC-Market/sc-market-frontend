import React, { useCallback, useEffect, useState } from "react"
import { FlatSection } from "../../../components/paper/Section"
import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  useTheme,
} from "@mui/material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import LoadingButton from "@mui/lab/LoadingButton"
import { MarketAggregate } from "../domain/types"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { DateTimePicker } from "@mui/x-date-pickers"
import moment from "moment/moment"
import { useCreateBuyOrderMutation } from "../api/marketApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"

export function BuyOrderForm(props: { aggregate: MarketAggregate }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { aggregate } = props
  const [state, setState] = useState({
    game_item_id: aggregate.details.game_item_id,
    price: 0,
    quantity: 1,
    expiry: moment().add(3, "days").endOf("day"),
    negotiable: false,
  })

  useEffect(() => {
    setState((s) => ({ ...s, game_item_id: aggregate.details.game_item_id }))
  }, [aggregate])

  const [createBuyOrder, { isLoading }] = useCreateBuyOrderMutation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const callback = useCallback(async () => {
    createBuyOrder({
      game_item_id: state.game_item_id,
      quantity: state.quantity,
      expiry: state.expiry,
      negotiable: state.negotiable,
      price: state.negotiable
        ? (state.price >= 1 ? state.price : undefined)
        : state.price,
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
      <HeaderTitle>{aggregate.details.title}</HeaderTitle>
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
            // component="img"
            style={{
              display: "block",
              maxHeight: "100%",
              maxWidth: "100%",
              margin: "auto",
            }}
            loading="lazy"
            src={
              aggregate.photos[0] ||
              "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
            }
            alt={aggregate.details.title}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src =
                "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
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
                label={t("buyorder.negotiable", "Negotiable (no fixed price)")}
              />
            </Grid>
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={async (values, sourceInfo) => {
                  setState({
                    ...state,
                    price: values.floatValue ?? 0,
                  })
                }}
                fullWidth
                label={
                  state.negotiable
                    ? t("buyorder.suggested_price_optional", "Suggested price (optional)")
                    : t("buyorder.price_per_unit")
                }
                id="price-per-unit"
                color={"secondary"}
                value={state.price || ""}
                placeholder={state.negotiable ? t("buyorder.optional", "Optional") : undefined}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">{`aUEC`}</InputAdornment>
                  ),
                  inputMode: "numeric",
                }}
                type={"tel"}
                aria-required={!state.negotiable}
                aria-describedby="price-per-unit-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.pricePerUnitInput",
                    "Enter price per unit",
                  ),
                  pattern: "[0-9]*",
                }}
              />
              <div id="price-per-unit-help" className="sr-only">
                {state.negotiable
                  ? t(
                      "accessibility.suggestedPriceHelp",
                      "Optional suggested price per unit in aUEC when negotiable",
                    )
                  : t(
                      "accessibility.pricePerUnitHelp",
                      "Enter the price you are willing to pay per unit in aUEC",
                    )}
              </div>
            </Grid>
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
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                fullWidth
                label={t("buyorder.total_price")}
                id="total-price"
                color={"secondary"}
                variant={"standard"}
                value={state.negotiable && !state.price ? "" : Math.ceil(state.price * state.quantity)}
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
                  "Total price is automatically calculated based on price per unit and quantity",
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} display={"flex"} justifyContent={"right"}>
              <DateTimePicker
                label={t("buyorder.expiration", {
                  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })}
                value={state.expiry}
                onChange={(newValue) =>
                  setState({
                    ...state,
                    expiry: newValue || moment().add(3, "days").endOf("day"),
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
                    "Submit your buy order with the specified price and quantity",
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
