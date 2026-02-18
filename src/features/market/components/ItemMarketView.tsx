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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {xs ? (
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
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "flex-start",
                  }}
                >
                  <ItemListings />
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: '100%', maxWidth: 'xxl' }}
            >
              {/* Desktop: Persistent sidebar */}
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

              {/* Main content area */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "flex-start",
                }}
              >
                <ItemListings />
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}
