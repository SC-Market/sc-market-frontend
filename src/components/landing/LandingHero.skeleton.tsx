import React from "react"
import { Box, Container, Skeleton, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function LandingHeroSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        paddingBottom: theme.spacing(8),
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing(4),
        }}
      >
        <Stack
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{
            width: "100%",
            textAlign: "center",
            flex: { xs: "1 1 auto", md: "0 1 auto" },
          }}
          spacing={2}
        >
          <Skeleton
            variant="circular"
            sx={{
              [theme.breakpoints.up("lg")]: {
                width: theme.spacing(32),
                height: theme.spacing(32),
              },
              [theme.breakpoints.down("lg")]: {
                width: theme.spacing(24),
                height: theme.spacing(24),
              },
            }}
          />
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={400} height={40} />
        </Stack>
      </Container>
    </Box>
  )
}
