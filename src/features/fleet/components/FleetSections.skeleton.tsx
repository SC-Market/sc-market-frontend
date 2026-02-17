import React from "react"
import { Grid, Skeleton } from "@mui/material"
import { Section } from "../../../components/paper/Section"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function ShipsSkeleton() {
  return (
    <Section xs={12} md={12} lg={12} xl={5} title="" disablePadding>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Grid item xs={12} key={index}>
            <Skeleton variant="rectangular" height={53} />
          </Grid>
        ))}
      </Grid>
    </Section>
  )
}

export function ActiveDeliveriesSkeleton() {
  return (
    <Section xs={12} md={12} lg={12} xl={12} title="" disablePadding>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} key={index}>
            <Skeleton variant="rectangular" height={53} />
          </Grid>
        ))}
      </Grid>
    </Section>
  )
}

export function FleetPageSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout * 4}>
      <Grid item xs={12} xl={5}>
        <ShipsSkeleton />
      </Grid>
      <Grid item xs={12} xl={7}>
        <ActiveDeliveriesSkeleton />
      </Grid>
    </Grid>
  )
}
