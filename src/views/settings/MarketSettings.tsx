import { Divider, Grid, Typography } from "@mui/material"
import React from "react"
import { MarketEditTemplate } from "../../features/market"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ImportFromUex } from "../../features/market/v2/ImportFromUex"

export function MarketSettings() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid
      container
      spacing={theme.layoutSpacing.compact}
      alignItems={"flex-start"}
    >
      <MarketEditTemplate />
      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Import from UEX
        </Typography>
        <ImportFromUex />
      </Grid>
    </Grid>
  )
}
