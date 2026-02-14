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
            <Grid item xs={12} md={2.25}>
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
          <Grid item xs={12} md={xs ? 12 : 9.75}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 2, sm: 3 },
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
