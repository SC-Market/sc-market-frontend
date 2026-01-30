import React, { useState } from "react"
import {
  Container,
  Grid,
  Paper,
  useMediaQuery,
  Button,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ServiceSidebarContext } from "../../hooks/contract/ServiceSidebar"
import { ServiceSidebar } from "../contracts/ServiceSidebar"
import { ServiceSearchArea } from "../services/ServiceSearchArea"
import { ServiceListings } from "../contracts/ServiceListings"

export function ProfileServicesView(props: { user: string }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ServiceSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <ServiceSidebar />}
      {xs && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FilterListIcon />}
          aria-label={t("service_market.filters", "Filters")}
          onClick={() => setSidebarOpen((prev) => !prev)}
          sx={{
            position: "fixed",
            bottom: { xs: 80, sm: 24 },
            right: 24,
            zIndex: theme.zIndex.speedDial,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: theme.shadows[4],
            backgroundColor: theme.palette.background.paper,
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          {t("service_market.filters", "Filters")}
        </Button>
      )}
      <Container maxWidth={"xl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid
            item
            xs={0}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper sx={{ padding: 1 }}>
              <ServiceSearchArea />
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ServiceListings user={user} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </ServiceSidebarContext.Provider>
  )
}

export function OrgServicesView(props: { org: string }) {
  const { org } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ServiceSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <ServiceSidebar />}
      {xs && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FilterListIcon />}
          aria-label={t("service_market.filters", "Filters")}
          onClick={() => setSidebarOpen((prev) => !prev)}
          sx={{
            position: "fixed",
            bottom: { xs: 80, sm: 24 },
            right: 24,
            zIndex: theme.zIndex.speedDial,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: theme.shadows[4],
            backgroundColor: theme.palette.background.paper,
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          {t("service_market.filters", "Filters")}
        </Button>
      )}
      <Container maxWidth={"xl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid
            item
            xs={0}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper sx={{ padding: 1 }}>
              <ServiceSearchArea />
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ServiceListings contractor={org} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </ServiceSidebarContext.Provider>
  )
}
