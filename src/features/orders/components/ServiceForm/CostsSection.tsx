import React from "react"
import { Button, Grid, InputAdornment, MenuItem, TextField, Typography } from "@mui/material"
import { Section } from "../../../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { PAYMENT_TYPES } from "../../../../util/constants"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useServiceFormContext } from "./ServiceFormContext"

export function CostsSection({ isEditing }: { isEditing: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { state, setState, isUploadingPhotos, submitService } = useServiceFormContext()

  return (
    <>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" align="left" color="text.secondary" sx={{ fontWeight: "bold" }}>
            {t("CreateServiceForm.costs")}
          </Typography>
        </Grid>
        <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <NumericFormat
              decimalScale={0} allowNegative={false} customInput={TextField} thousandSeparator
              onValueChange={(values) => setState({ ...state, collateral: values.floatValue || 0 })}
              fullWidth label={t("CreateServiceForm.collateralOptional")} id="collateral"
              color="secondary" value={state.collateral} type="tel"
              helperText={t("CreateServiceForm.collateralHelper")}
              InputProps={{ endAdornment: <InputAdornment position="start">aUEC</InputAdornment>, inputMode: "numeric" }}
            />
          </Grid>
          <Grid item xs={12}>
            <NumericFormat
              decimalScale={0} allowNegative={false} customInput={TextField} thousandSeparator
              onValueChange={(values) => setState({ ...state, offer: values.floatValue || 0 })}
              fullWidth label={t("CreateServiceForm.cost")} id="offer"
              color="secondary" value={state.offer} type="tel"
              helperText={t("CreateServiceForm.costHelper")}
              InputProps={{ endAdornment: <InputAdornment position="start">aUEC</InputAdornment>, inputMode: "numeric" }}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select label={t("CreateServiceForm.paymentType")} value={state.payment_type}
              onChange={(e: any) => setState({ ...state, payment_type: e.target.value })}
              fullWidth aria-required="true"
              SelectProps={{ IconComponent: KeyboardArrowDownRoundedIcon }}
            >
              {PAYMENT_TYPES.map((pt) => <MenuItem key={pt.value} value={pt.value}>{t(pt.translationKey)}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Section>
      <Grid item xs={12} container justifyContent="right">
        <Button
          size="large" variant="contained" color="secondary" type="submit"
          disabled={isUploadingPhotos} onClick={submitService}
        >
          {isUploadingPhotos ? t("CreateServiceForm.uploadingPhotos") : isEditing ? t("CreateServiceForm.update") : t("CreateServiceForm.submit")}
        </Button>
      </Grid>
    </>
  )
}
