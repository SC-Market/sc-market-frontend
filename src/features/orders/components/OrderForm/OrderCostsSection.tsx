import React from "react"
import type { PaymentType } from "../../domain/types"
import { Grid, InputAdornment, MenuItem, TextField, Typography } from "@mui/material"
import { Section } from "../../../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { PAYMENT_TYPES } from "../../../../util/constants"
import { NumericFormat } from "react-number-format"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useOrderFormContext } from "./OrderFormContext"

export function OrderCostsSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { state, setState, isLoading, formDisabled, submitOrder } = useOrderFormContext()

  return (
    <>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" align="left" color="text.secondary" sx={{ fontWeight: "bold" }}>
            {t("CreateOrderForm.costs")}
          </Typography>
        </Grid>
        <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <NumericFormat
              decimalScale={0} allowNegative={false} customInput={TextField} thousandSeparator
              onValueChange={(values) => setState({ ...state, collateral: +(values.floatValue || 0) })}
              fullWidth label={t("CreateOrderForm.collateralOptional")} id="collateral"
              color="secondary" value={state.collateral} type="tel" disabled={!!formDisabled}
              helperText={t("CreateOrderForm.collateralHelper")}
              InputProps={{ endAdornment: <InputAdornment position="start">aUEC</InputAdornment>, inputMode: "numeric" }}
            />
          </Grid>
          <Grid item xs={12}>
            <NumericFormat
              decimalScale={0} allowNegative={false} customInput={TextField} thousandSeparator
              onValueChange={(values) => setState({ ...state, offer: values.floatValue || 0 })}
              fullWidth label={t("CreateOrderForm.aUECOffer")} id="offer"
              color="secondary" value={state.offer} type="tel" disabled={!!formDisabled}
              helperText={t("CreateOrderForm.aUECOfferHelper")}
              InputProps={{ endAdornment: <InputAdornment position="start">aUEC</InputAdornment>, inputMode: "numeric" }}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select label={t("CreateOrderForm.paymentType")} value={state.payment_type}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState({ ...state, payment_type: e.target.value as PaymentType })}
              fullWidth aria-required="true" disabled={!!formDisabled}
              SelectProps={{ IconComponent: KeyboardArrowDownRoundedIcon }}
            >
              {PAYMENT_TYPES.map((pt) => <MenuItem key={pt.value} value={pt.value}>{t(pt.translationKey)}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Section>
      <Grid item xs={12} container justifyContent="right">
        <LoadingButton
          size="large" variant="contained" color="secondary" type="submit"
          loading={isLoading} disabled={!!formDisabled}
          onClick={submitOrder}
        >
          {t("CreateOrderForm.submit")}
        </LoadingButton>
      </Grid>
    </>
  )
}
