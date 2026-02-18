import React from "react"
import { Grid2, Skeleton, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function LandingFeaturesSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid2
      container
      justifyContent={"center"}
      spacing={theme.layoutSpacing.layout * 4}
    >
      {[1, 2, 3].map((i) => (
        <Grid2 size={{ xs: 12, md: 4 }} key={i}>
          <Stack direction={"column"} spacing={2}>
            <Skeleton variant="text" width="100%" height={40} />
            <Skeleton variant="text" width="100%" height={80} />
          </Stack>
        </Grid2>
      ))}
    </Grid2>
  )
}
