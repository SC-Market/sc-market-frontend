/**
 * Manage Stock Page
 *
 * Interface for managing stock lots and allocations
 */

import React from "react"
import { Box, Grid } from "@mui/material"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { AllStockLotsGrid } from "./stock/AllStockLotsGrid"
import { AllAllocatedLotsGrid } from "./stock/AllAllocatedLotsGrid"

export function ManageStockPage() {
  return (
    <ContainerGrid maxWidth="xl" sidebarOpen={true}>
      <Grid item xs={12} />

      <Grid item xs={12}>
        <AllStockLotsGrid />
      </Grid>

      <Grid item xs={12}>
        <AllAllocatedLotsGrid />
      </Grid>
    </ContainerGrid>
  )
}
