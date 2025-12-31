import { MarketSidebar } from "./MarketSidebar"
import {
  Container,
  Divider,
  Grid,
  useMediaQuery,
} from "@mui/material"
import {
  HideOnScroll,
  MarketNavArea,
} from "../../components/navbar/MarketNavArea"
import { ItemListings } from "./ItemListings"
import { useMarketSidebar } from "../../hooks/market/MarketSidebar"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ItemMarketView() {
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [open] = useMarketSidebar()

  return (
    <>
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

          <Grid
            item
            container
            xs={12}
            lg={12}
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
