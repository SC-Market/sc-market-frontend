import {
  Container,
  Grid,
  IconButton,
  Paper,
  useMediaQuery,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { ServiceSidebar } from "../contracts/ServiceSidebar"
import { ServiceListings } from "../contracts/ServiceListings"
import { ServiceSidebarContext } from "../../hooks/contract/ServiceSidebar"
import React, { useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ServiceSearchArea } from "./ServiceSearchArea"
import { useTranslation } from "react-i18next"

export function ServiceMarketView() {
  const [open, setOpen] = useState(false)
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  return (
    <ServiceSidebarContext.Provider value={[open, setOpen]}>
      {xs && (
        <IconButton
          color="secondary"
          aria-label={t("service_market.toggle_sidebar")}
          sx={{
            position: "absolute",
            zIndex: 50,
            left: 16,
            [theme.breakpoints.up("md")]: {
              display: "none",
            },
            top: 64 + 24,
            transition: "0.3s",
          }}
          onClick={() => {
            setOpen((prev) => !prev)
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}
      {xs && <ServiceSidebar />}
      <Container maxWidth={"xl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          {/* Hide search area on mobile - it's in the sidebar */}
          <Grid item xs={0} md={3} sx={{ display: { xs: "none", md: "block" } }}>
            <Paper>
              <ServiceSearchArea />
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
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
    </ServiceSidebarContext.Provider>
  )
}
