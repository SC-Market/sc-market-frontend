import React, { useMemo, useState, Suspense } from "react"
import {
  Container,
  Grid,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
} from "@mui/material"
import { OpenLayout } from "../../../components/layout/ContainerGrid"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { MarketSidebarContext } from "../hooks/MarketSidebar"
import { ServiceSidebarContext } from "../../../hooks/contract/ServiceSidebar"
import { Page } from "../../../components/metadata/Page"
import { MarketActions } from "./MarketActions"
import { useLocation, useNavigate } from "react-router-dom"
import { a11yProps, TabPanel } from "../../../components/tabs/Tabs"
import { useTranslation } from "react-i18next"
import FilterListIcon from "@mui/icons-material/FilterList"
import { FiltersFAB } from "../../../components/mobile/FiltersFAB"
import { Button } from "@mui/material"

// Dynamic imports for heavy components
const ItemMarketView = React.lazy(() =>
  import("./ItemMarketView").then((module) => ({
    default: module.ItemMarketView,
  })),
)
const ServiceMarketView = React.lazy(() =>
  import("../../../views/services/ServiceMarketView").then((module) => ({
    default: module.ServiceMarketView,
  })),
)
const ServiceActions = React.lazy(() =>
  import("../../../views/services/ServiceActions").then((module) => ({
    default: module.ServiceActions,
  })),
)
const ContractListings = React.lazy(() =>
  import("../../../views/contracts/ContractListings").then((module) => ({
    default: module.ContractListings,
  })),
)

function MarketTabLoader() {
  return null
}

export function MarketPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)
  const pages = ["/market/services", "/market", "/contracts"]
  const tabPage = useMemo(
    () =>
      pages.indexOf(
        pages.find((p) => location.pathname.startsWith(p)) || "/market",
      ),
    [location.pathname],
  )

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <MarketSidebarContext.Provider
        value={[marketSidebarOpen, setMarketSidebarOpen]}
      >
        <ServiceSidebarContext.Provider
          value={[serviceSidebarOpen, setServiceSidebarOpen]}
        >
          <OpenLayout sidebarOpen={true} noMobilePadding={true}>
            <Container
              maxWidth={"xxl"}
              sx={{
                paddingTop: { xs: 2, sm: 8 },
                paddingX: { xs: theme.spacing(1), sm: theme.spacing(3) },
              }}
            >
              <Grid
                container
                spacing={{
                  xs: theme.layoutSpacing.component,
                  sm: theme.layoutSpacing.layout,
                }}
                sx={{ marginBottom: { xs: 2, sm: 4 } }}
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item xs={12} sm="auto">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.5rem", sm: "2.125rem" },
                      }}
                      color={"text.secondary"}
                    >
                      {t("market.market")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Tabs
                    value={tabPage}
                    onChange={(_, newValue) => {
                      if (newValue === 0) {
                        navigate("/market/services")
                      } else if (newValue === 1) {
                        navigate("/market")
                      } else if (newValue === 2) {
                        navigate("/contracts")
                      }
                    }}
                    aria-label={t("ui.aria.orgInfoArea")}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="secondary"
                    indicatorColor="secondary"
                    sx={{
                      minHeight: { xs: 48, sm: 64 },
                      "& .MuiTab-root": {
                        minHeight: { xs: 48, sm: 64 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        padding: { xs: "12px 16px", sm: "12px 24px" },
                      },
                    }}
                  >
                    <Tab
                      label={t("market.itemsTab")}
                      value={1}
                      {...a11yProps(1)}
                    />
                    <Tab
                      label={t("market.servicesTab")}
                      value={0}
                      {...a11yProps(0)}
                    />
                    <Tab
                      label={t("market.contractsTab", "Open Contracts")}
                      value={2}
                      {...a11yProps(2)}
                    />
                  </Tabs>
                </Grid>
                <Grid item xs={12} sm="auto">
                  {tabPage === 1 ? (
                    <MarketActions />
                  ) : (
                    <Suspense fallback={<CircularProgress size={24} />}>
                      <ServiceActions />
                    </Suspense>
                  )}
                </Grid>
              </Grid>
            </Container>

            <TabPanel value={tabPage} index={1}>
              <Suspense fallback={<MarketTabLoader />}>
                <ItemMarketView />
              </Suspense>
            </TabPanel>
            <TabPanel value={tabPage} index={0}>
              <Suspense fallback={<MarketTabLoader />}>
                <ServiceMarketView />
              </Suspense>
            </TabPanel>
            <TabPanel value={tabPage} index={2}>
              <Suspense fallback={<MarketTabLoader />}>
                <ContractListings />
              </Suspense>
            </TabPanel>
          </OpenLayout>
          {xs && tabPage === 1 && (
            <FiltersFAB
              onClick={() => setMarketSidebarOpen((prev) => !prev)}
              label={t("market.toggleSidebar")}
            />
          )}
          {xs && tabPage === 0 && (
            <FiltersFAB
              onClick={() => setServiceSidebarOpen((prev) => !prev)}
              label={t("service_market.toggle_sidebar")}
            />
          )}
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
