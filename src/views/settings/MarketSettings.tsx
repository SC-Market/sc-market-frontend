import { Grid } from "@mui/material"
import React from "react"
import { MarketEditTemplate } from "../market/MarketEditTemplate"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function MarketSettings() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid container spacing={theme.layoutSpacing.compact} alignItems={"flex-start"}>
      <MarketEditTemplate />
    </Grid>
  )
}
