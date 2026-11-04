import { useTranslation } from "react-i18next"
import { Alert, Grid } from "@mui/material"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function MarketSettings() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid
      container
      spacing={theme.layoutSpacing.compact}
      alignItems={"flex-start"}
    >
      <Grid item xs={12}>
        <Alert severity="info">{t("marketV2.settingsMoved")}</Alert>
      </Grid>
    </Grid>
  )
}
