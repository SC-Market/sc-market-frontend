import {
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import React from "react"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { PAYMENT_TYPES } from "../../util/constants"
import type { PaymentType } from "../../features/orders/domain/types"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import type { WorkRequestState } from "../../features/orders/hooks/useCreateOrderForm"

/** Collateral, offer and payment type for a new service order. */
export function CreateOrderCostsSection({
  state,
  setState,
}: {
  state: WorkRequestState
  setState: React.Dispatch<React.SetStateAction<WorkRequestState>>
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <Section xs={12}>
      <Grid item xs={12} lg={4}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("CreateOrderForm.costs")}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values) => {
              setState({
                ...state,
                collateral: +(values.floatValue || 0),
              })
            }}
            fullWidth={true}
            label={t("CreateOrderForm.collateralOptional")}
            id="collateral"
            value={state.collateral}
            type={"tel"}
            helperText={t("CreateOrderForm.collateralHelper")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
              inputMode: "numeric",
            }}
            aria-describedby="collateral-help"
            inputProps={{
              "aria-label": t(
                "accessibility.collateralInput",
                "Enter collateral amount",
              ),
              pattern: "[0-9]*",
            }}
          />
          <div id="collateral-help" className="sr-only">
            {t(
              "accessibility.collateralHelp",
              "Enter the collateral amount in aUEC (optional)",
            )}
          </div>
        </Grid>

        <Grid item xs={12}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values) => {
              console.log(values)
              setState({
                ...state,
                offer: values.floatValue || 0,
              })
            }}
            fullWidth={true}
            label={t("CreateOrderForm.aUECOffer")}
            id="offer"
            value={state.offer}
            type={"tel"}
            helperText={t("CreateOrderForm.aUECOfferHelper")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
              inputMode: "numeric",
            }}
            aria-required="true"
            aria-describedby="offer-help"
            inputProps={{
              "aria-label": t("accessibility.offerInput", "Enter offer amount"),
              pattern: "[0-9]*",
            }}
          />
          <div id="offer-help" className="sr-only">
            {t(
              "accessibility.offerHelp",
              "Enter your offer amount in aUEC (required)",
            )}
          </div>
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            label={t("CreateOrderForm.paymentType")}
            value={state.payment_type}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setState({
                ...state,
                payment_type: event.target.value as PaymentType,
              })
            }}
            fullWidth
            aria-required="true"
            aria-describedby="payment-type-help"
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
              "aria-label": t(
                "accessibility.selectPaymentType",
                "Select payment type",
              ),
              MenuProps: {
                disablePortal: false,
                slotProps: {
                  paper: { sx: { zIndex: 1300 } },
                },
              },
            }}
          >
            {PAYMENT_TYPES.map((paymentType) => (
              <MenuItem key={paymentType.value} value={paymentType.value}>
                {t(paymentType.translationKey)}
              </MenuItem>
            ))}
          </TextField>
          <div id="payment-type-help" className="sr-only">
            {t(
              "accessibility.order.paymentTypeHelp",
              "Select how you want to handle payment for this order (required)",
            )}
          </div>
        </Grid>
      </Grid>
    </Section>
  )
}
