import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  useMediaQuery,
} from "@mui/material"
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
      <Container maxWidth={"xxl"} sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {xs ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <Grid
                  container
                  spacing={theme.layoutSpacing.layout}
                  justifyContent={"center"}
                >
                  <ServiceListings />
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxl" }}
            >
              <Paper
                sx={{
                  position: "sticky",
                  top: "calc(64px + 16px)",
                  maxHeight: "calc(100vh - 64px - 32px)",
                  width: 300,
                  flexShrink: 0,
                  overflowY: "auto",
                }}
              >
                <ServiceSearchArea />
              </Paper>

              <Box sx={{ flex: 1 }}>
                <Grid
                  container
                  spacing={theme.layoutSpacing.layout}
                  justifyContent={"center"}
                >
                  <ServiceListings />
                </Grid>
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}
