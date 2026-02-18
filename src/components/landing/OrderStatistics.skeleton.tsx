import React from "react"
import { Grid, Skeleton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function OrderStatisticsSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  
  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout}
      justifyContent={"center"}
    >
      {[1, 2, 3, 4].map((i) => (
        <Grid item key={i}>
          <Skeleton variant="rectangular" width={200} height={100} />
        </Grid>
      ))}
    </Grid>
  )
}
