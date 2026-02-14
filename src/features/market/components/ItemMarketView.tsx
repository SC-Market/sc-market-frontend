import { MarketSidebar } from "./MarketSidebar"
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  useMediaQuery,
} from "@mui/material"
import { HideOnScroll, MarketNavArea } from "./MarketNavArea"
import { ItemListings } from "../views/ItemListings"
import { useMarketSidebar } from ".."
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function ItemMarketView() {
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [open] = useMarketSidebar()

  return (
    <>
      {/* Mobile: Use bottom sheet */}
      {xs && <MarketSidebar />}

      <Container maxWidth={"xxl"} sx={{ padding: 0 }}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          {xs && (
            <>
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>
            </>
          )}

          {/* Desktop: Persistent sidebar */}
          {!xs && (
            <Grid item xs={12} md="auto">
              <Paper
                sx={{
                  position: "sticky",
                  top: theme.spacing(2),
                  maxHeight: `calc(100vh - ${theme.spacing(4)})`,
                  width: 300,
                  flexShrink: 0,
                  overflowY: "auto",
                }}
              >
                <MarketSidebar />
              </Paper>
            </Grid>
          )}

          {/* Main content area */}
          <Grid item xs={12} md sx={{ transition: "all 0.3s ease" }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <ItemListings />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
