import React, { ReactNode } from "react"
import {
  Box,
  Container,
  Divider,
  Grid,
  Typography,
  useTheme,
} from "@mui/material"
import { OpenLayout } from "./ContainerGrid"
import { ExtendedTheme } from "../../hooks/styles/Theme"

/**
 * The desktop filter panel beside the results on the MarketPageLayout pages
 * (market, buy orders, services, contracts) and in their skeletons.
 */
export const MARKET_FILTER_PANEL_SX = {
  position: "sticky",
  top: "calc(64px + 16px)",
  maxHeight: "calc(100vh - 64px - 32px)",
  height: "fit-content",
  width: 300,
  flexShrink: 0,
  overflowY: "auto",
} as const

export interface MarketPageLayoutProps {
  /** Page title in the header (names the current page, e.g. "Market", "Services") */
  title: string
  /** Actions shown on the right of the header (e.g. Create Listing) */
  headerActions: ReactNode
  /** Page content */
  children: ReactNode
  /** Optional FAB to show on mobile (e.g. filter toggle) */
  fab?: ReactNode
  /** Leave out the footer (the page's skeleton does) */
  noFooter?: boolean
}

/**
 * Shared layout for /market, /market/services, /buyorders and /contracts:
 * OpenLayout + header (title, actions) + divider + page content.
 * Use the same structure so padding and behaviour match across all of them.
 */
export function MarketPageLayout({
  title,
  headerActions,
  children,
  fab,
  noFooter,
}: MarketPageLayoutProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      <OpenLayout sidebarOpen={true} noMobilePadding={true} noFooter={noFooter}>
        <Container
          maxWidth="xxl"
          sx={{
            paddingTop: { xs: 2, sm: 8 },
            paddingX: { xs: theme.spacing(1), sm: theme.spacing(3) },
            marginX: "auto",
          }}
        >
          <Grid
            container
            spacing={{
              xs: theme.layoutSpacing?.component ?? 1,
              sm: theme.layoutSpacing?.layout ?? 2,
            }}
            sx={{ marginBottom: { xs: 2, sm: 4 } }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item xs={12} sm="auto">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2.125rem" },
                  }}
                  color="text.secondary"
                >
                  {title}
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm="auto"
              sx={{
                display: "flex",
                justifyContent: { xs: "stretch", sm: "flex-end" },
              }}
            >
              {headerActions}
            </Grid>
          </Grid>

          <Divider light sx={{ mt: 2, mb: 2 }} />
        </Container>

        {children}
      </OpenLayout>
      {fab}
    </>
  )
}
