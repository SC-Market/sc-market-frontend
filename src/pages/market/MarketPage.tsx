import React, { useEffect, useMemo, useState, Suspense } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import {
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
} from "@mui/material"
import { ListingSkeleton } from "../../components/skeletons"
import { useMarketSidebarExp } from "../../hooks/market/MarketSidebar"
// Removed static imports - now using dynamic imports
import {
  ContainerGrid,
  OpenLayout,
} from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MarketSidebarContext } from "../../hooks/market/MarketSidebar"
import { ServiceSidebarContext } from "../../hooks/contract/ServiceSidebar"
import { Page } from "../../components/metadata/Page"
import {
  BuyOrderActions,
  MarketActions,
} from "../../components/button/MarketActions"
import {
  HideOnScroll,
  MarketNavArea,
} from "../../components/navbar/MarketNavArea"
import { useMarketSearch } from "../../hooks/market/MarketSearch"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"

// Dynamic imports for heavy components
const ItemMarketView = React.lazy(() =>
  import("../../views/market/ItemMarketView").then((module) => ({
    default: module.ItemMarketView,
  })),
)
const ServiceMarketView = React.lazy(() =>
  import("../../views/services/ServiceMarketView").then((module) => ({
    default: module.ServiceMarketView,
  })),
)
const ServiceActions = React.lazy(() =>
  import("../../views/services/ServiceActions").then((module) => ({
    default: module.ServiceActions,
  })),
)
const BulkListingsRefactor = React.lazy(() =>
  import("../../views/market/ItemListings").then((module) => ({
    default: module.BulkListingsRefactor,
  })),
)
const BuyOrders = React.lazy(() =>
  import("../../views/market/ItemListings").then((module) => ({
    default: module.BuyOrders,
  })),
)

// Loading component for market tabs - minimal placeholder since components handle their own loading
function MarketTabLoader() {
  return null // Components (ItemMarketView, ServiceMarketView) handle their own loading states
}

export function MarketPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)
  const pages = ["/market/services", "/market"]
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
              maxWidth={"lg"}
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
                {/* Title - full width on mobile, auto on large */}
                <Grid item xs={12} sm="auto">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Market sidebar toggle - only show on mobile */}
                    {xs && tabPage === 1 && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<FilterListIcon />}
                        aria-label={t("market.toggleSidebar")}
                        onClick={() => {
                          setMarketSidebarOpen((prev) => !prev)
                        }}
                        sx={{
                          [theme.breakpoints.up("md")]: {
                            display: "none",
                          },
                          borderRadius: 2,
                          textTransform: "none",
                        }}
                      >
                        {t("market.filters", "Filters")}
                      </Button>
                    )}
                    {/* Services sidebar toggle - only show on mobile */}
                    {xs && tabPage === 0 && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<FilterListIcon />}
                        aria-label={t("service_market.toggle_sidebar")}
                        onClick={() => {
                          setServiceSidebarOpen((prev) => !prev)
                        }}
                        sx={{
                          [theme.breakpoints.up("md")]: {
                            display: "none",
                          },
                          borderRadius: 2,
                          textTransform: "none",
                        }}
                      >
                        {t("service_market.filters", "Filters")}
                      </Button>
                    )}
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
                {/* Tabs - full width on mobile, auto on large */}
                <Grid item xs={12} sm="auto">
                  <Tabs
                    value={tabPage}
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
                      component={Link}
                      {...a11yProps(0)}
                      to={"/market"}
                    />
                    <Tab
                      label={t("market.servicesTab")}
                      value={0}
                      component={Link}
                      {...a11yProps(1)}
                      to={"/market/services"}
                    />
                  </Tabs>
                </Grid>
                {/* Action buttons - full width on mobile, auto on large */}
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
          </OpenLayout>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}

export function BulkItems() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()

  const [marketSearch, setMarketSearch] = useMarketSearch()
  useEffect(() => {
    setMarketSearch({
      ...marketSearch,
      quantityAvailable: marketSearch.quantityAvailable || 1,
      sort: marketSearch.sort || "activity",
    })
  }, [])

  return (
    <Page title={t("market.bulkItems")}>
      <IconButton
        color="secondary"
        aria-label={t("toggle_market_sidebar")}
        sx={{
          position: "absolute",
          zIndex: 50,
          [theme.breakpoints.up("sm")]: {
            left: (drawerOpen ? sidebarDrawerWidth : 0) + 16,
          },
          [theme.breakpoints.down("sm")]: {
            left: (drawerOpen ? sidebarDrawerWidth : 0) + 16,
          },
          [theme.breakpoints.up("md")]: {
            display: "none",
          },
          top: 64 + 24,
        }}
        onClick={() => {
          setOpen(true)
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
      <MarketSidebarContext.Provider value={[open, setOpen]}>
        {/*<MarketSidebar/>*/}
        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
          <Grid item xs={12}>
            <Grid
              container
              justifyContent={"space-between"}
              spacing={theme.layoutSpacing.compact}
            >
              <HeaderTitle lg={7} xl={7}>
                {t("market.bulkListings")}
              </HeaderTitle>

              <MarketActions />

              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <Suspense fallback={<MarketTabLoader />}>
              <BulkListingsRefactor />
            </Suspense>
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}

export function BuyOrderItems() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()

  const [marketSearch, setMarketSearch] = useMarketSearch()
  useEffect(() => {
    setMarketSearch({
      ...marketSearch,
      quantityAvailable: 0,
      sort: marketSearch.sort || "activity",
    })
  }, [])

  return (
    <Page title={t("market.bulkItems")}>
      <IconButton
        color="secondary"
        aria-label={t("toggle_market_sidebar")}
        sx={{
          position: "absolute",
          zIndex: 50,
          [theme.breakpoints.up("sm")]: {
            left: (drawerOpen ? sidebarDrawerWidth : 0) + 16,
          },
          [theme.breakpoints.down("sm")]: {
            left: (drawerOpen ? sidebarDrawerWidth : 0) + 16,
          },
          [theme.breakpoints.up("md")]: {
            display: "none",
          },
          top: 64 + 24,
        }}
        onClick={() => {
          setOpen(true)
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
      <MarketSidebarContext.Provider value={[open, setOpen]}>
        {/*<MarketSidebar/>*/}
        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
          <Grid item xs={12}>
            <Grid
              container
              justifyContent={"space-between"}
              spacing={theme.layoutSpacing.compact}
            >
              <HeaderTitle lg={7} xl={7}>
                {t("market.buyOrders")}
              </HeaderTitle>

              <BuyOrderActions />

              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            container
            xs={12}
            lg={12}
            spacing={theme.layoutSpacing.component}
            sx={{ transition: "0.3s" }}
          >
            <Suspense fallback={<MarketTabLoader />}>
              <BuyOrders />
            </Suspense>
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
