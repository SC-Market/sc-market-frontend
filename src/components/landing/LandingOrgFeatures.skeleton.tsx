import React from "react"
import { Grid2, Skeleton, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function LandingOrgFeaturesSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"column"}
      spacing={theme.spacing(8)}
      sx={{
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(13),
      }}
    >
      <Stack justifyContent={"center"} alignItems={"center"} spacing={2}>
        <Skeleton variant="text" width={200} height={50} />
        <Skeleton variant="text" width={300} height={40} />
      </Stack>

      <Grid2
        container
        justifyContent={"center"}
        spacing={theme.layoutSpacing.layout * 2}
      >
        {[1, 2, 3].map((i) => (
          <Grid2 size={{ xs: 12, md: 4 }} key={i}>
            <Stack
              direction={"column"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={2}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                sx={{ aspectRatio: "1/1" }}
              />
              <Skeleton variant="text" width="80%" height={30} />
            </Stack>
          </Grid2>
        ))}
      </Grid2>

      <Stack
        direction={"column"}
        spacing={theme.spacing(8)}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Skeleton variant="text" width={400} height={30} />
        <Skeleton variant="rectangular" width={150} height={40} />
      </Stack>
    </Stack>
  )
}
