import React from "react"
import { Skeleton, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function SupportersSectionSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack spacing={theme.layoutSpacing.layout} sx={{ maxWidth: "100%" }}>
      <Skeleton variant="text" width={300} height={50} sx={{ mx: "auto" }} />
      <Skeleton variant="text" width={500} height={30} sx={{ mx: "auto" }} />
      <Stack
        spacing={theme.layoutSpacing.layout}
        direction={"row"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {[1, 2, 3].map((i) => (
          <Stack
            spacing={theme.layoutSpacing.text}
            direction={"column"}
            key={i}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Skeleton variant="rectangular" width={128} height={128} />
            <Skeleton variant="text" width={100} height={20} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
