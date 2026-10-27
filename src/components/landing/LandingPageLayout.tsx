import React, { ReactNode } from "react"
import { Box, Container, Stack } from "@mui/material"

interface LandingPageLayoutProps {
  hero: ReactNode
  wantedNow: ReactNode
  topShops: ReactNode
  startSelling: ReactNode
  gameData: ReactNode
  trust: ReactNode
  faq: ReactNode
  footer: ReactNode
}

/**
 * The homepage's section order and spacing, shared by LandingPage and its
 * route skeleton so loading and loaded states have the same structure.
 * Layout is CSS only (sx breakpoints), so the markup doesn't depend on the
 * viewport.
 */
export function LandingPageLayout(props: LandingPageLayoutProps) {
  return (
    <Stack direction="column" sx={{ maxWidth: "100%", pt: 2, pb: 4 }}>
      {props.hero}

      <Container maxWidth="lg">
        <Stack spacing={{ xs: 5, md: 6 }} sx={{ pt: { xs: 3, md: 3 } }}>
          {props.wantedNow}
          {props.topShops}
          {props.startSelling}
          {props.gameData}
          {/* Trust + supporters beside the FAQ from lg, stacked below. */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gap: { xs: 5, lg: 3 },
              alignItems: "start",
            }}
          >
            {props.trust}
            {props.faq}
          </Box>
        </Stack>
      </Container>

      {props.footer}
    </Stack>
  )
}
