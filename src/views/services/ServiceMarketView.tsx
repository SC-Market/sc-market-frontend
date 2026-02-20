import { Container, Divider, Grid, Paper, useMediaQuery } from "@mui/material"
import { ServiceSidebar } from "../contracts/ServiceSidebar"
import { ServiceListings } from "../contracts/ServiceListings.lazy"
import { useServiceSidebar } from "../../hooks/contract/ServiceSidebar"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ServiceSearchArea } from "./ServiceSearchArea"

export function ServiceMarketView() {
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [open] = useServiceSidebar()

  return (
    <>
      {xs && <ServiceSidebar />}
      <Container maxWidth={"xxl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid item xs={12}>
            <Divider light />
          </Grid>

          {/* Desktop: Persistent sidebar */}
          {!xs && (
            <Grid item md={2.25}>
              <Paper
                sx={{
                  position: "sticky",
                  top: "calc(64px + 16px)",
                  maxHeight: "calc(100vh - 64px - 32px)",
                  overflowY: "auto",
                }}
              >
                <ServiceSearchArea />
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={xs ? 12 : 9.75}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ServiceListings />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
