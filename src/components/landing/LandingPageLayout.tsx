import React, { ReactNode } from "react"
import { Box, Container, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface LandingPageLayoutProps {
  hero: ReactNode
  statistics: ReactNode
  recentListings: ReactNode
  features: ReactNode
  orgFeatures: ReactNode
  supporters: ReactNode
  faq: ReactNode
  footer: ReactNode
}

/**
 * Shared layout component for LandingPage and its skeleton
 * Ensures consistent structure and spacing between loading and loaded states
 */
export function LandingPageLayout(props: LandingPageLayoutProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"column"}
      sx={{
        maxWidth: "100%",
        paddingBottom: theme.spacing(4),
        paddingTop: theme.spacing(2),
      }}
    >
      {/* Hero Section */}
      {props.hero}

      <Container>
        <Stack
          spacing={theme.spacing(6)}
          alignItems={"center"}
          justifyContent={"center"}
          direction={"column"}
        >
          {/* Order Statistics */}
          {props.statistics}

          {/* Recent Listings */}
          <Box
            maxWidth={"100%"}
            sx={{
              overflowX: "scroll",
            }}
          >
            {props.recentListings}
          </Box>

          {/* Features Section */}
          {props.features}
        </Stack>
      </Container>

      <Container>
        {/* Org Features Section */}
        {props.orgFeatures}

        {/* Supporters Section */}
        {props.supporters}

        {/* FAQ Section */}
        {props.faq}
      </Container>

      {/* Footer */}
      {props.footer}
    </Stack>
  )
}
