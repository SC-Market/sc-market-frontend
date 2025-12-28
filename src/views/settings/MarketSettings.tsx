import { Grid } from "@mui/material"
import React from "react"
import { MarketEditTemplate } from "../market/MarketEditTemplate"

export function MarketSettings() {
  return (
    <Grid container spacing={1} alignItems={"flex-start"}>
      <MarketEditTemplate />
    </Grid>
  )
}
