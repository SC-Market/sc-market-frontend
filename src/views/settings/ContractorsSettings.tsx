import { Grid } from "@mui/material"
import React from "react"
import { SettingsManageContractors } from "../contractor/SettingsManageContractors"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ContractorsSettings() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid container spacing={theme.layoutSpacing.layout * 4}>
      <SettingsManageContractors />
    </Grid>
  )
}
