import { MarketSidebar } from "./MarketSidebar"
import { Container, Divider, Grid, Paper, useMediaQuery } from "@mui/material"
import { HideOnScroll, MarketNavArea } from "./MarketNavArea"
import { ItemListings } from "../../../views/market/ItemListings"
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

      <Container maxWidth={"lg"} sx={{ padding: 0 }}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid item xs={12}>
            <HideOnScroll>
              <MarketNavArea />
            </HideOnScroll>
          </Grid>

          <Grid item xs={12}>
            <Divider light />
          </Grid>

          {/* Desktop: Persistent sidebar */}
          {!xs && (
            <Grid item md={3}>
              <Paper
                sx={{
                  position: "sticky",
                  top: theme.spacing(2),
                  maxHeight: `calc(100vh - ${theme.spacing(4)})`,
                  overflowY: "auto",
                }}
              >
                <MarketSidebar />
              </Paper>
            </Grid>
          )}

          {/* Main content area */}
          <Grid
            item
            container
            xs={12}
            md={xs ? 12 : 9}
            spacing={theme.layoutSpacing.layout}
            sx={{ transition: "0.3s" }}
          >
            <ItemListings />
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
