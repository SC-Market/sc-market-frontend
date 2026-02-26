import { MarketSidebar } from "./MarketSidebar"
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  useMediaQuery,
} from "@mui/material"
import { HideOnScroll, MarketNavArea } from "./MarketNavArea"
import { ItemListings } from "../views/ItemListings"
import React, { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function ItemMarketView() {
  const theme = useTheme<ExtendedTheme>()
  const location = useLocation()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))
  const showViewModeSelector = useMemo(() => {
    if (location.pathname.startsWith("/market/services")) return false
    if (location.pathname.startsWith("/market")) return true
    if (location.pathname.startsWith("/bulk")) return true
    if (location.pathname.startsWith("/buyorders")) return true
    return false
  }, [location.pathname])

  return (
    <>
      {/* Mobile/Tablet: Use bottom sheet – controlled by MarketPage's FAB via MarketSidebarContext */}
      {showMobileSidebar && <MarketSidebar showViewModeSelector={showViewModeSelector} />}

      <Container maxWidth={"xxxl"} sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <ItemListings />
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              {/* Desktop: Persistent sidebar */}
              <Paper
                sx={{
                  position: "sticky",
                  top: "calc(64px + 16px)",
                  maxHeight: "calc(100vh - 64px - 32px)",
                  height: "fit-content",
                  width: 300,
                  flexShrink: 0,
                  overflowY: "auto",
                }}
              >
                <MarketSidebar showViewModeSelector={showViewModeSelector} />
              </Paper>

              {/* Main content area – minWidth: 0 so flex child can shrink and grid gets full width */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ItemListings />
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}
