import React, { useState, Suspense, useMemo } from "react"
import { ContractListings } from "../../views/contracts/ContractListings"
import { ContractSidebar } from "../../views/contracts/ContractSidebar"
import { ContractSidebarContext } from "../../hooks/contract/ContractSidebar"
import {
  ContractSearchContext,
  ContractSearchState,
} from "../../hooks/contract/ContractSearch"
import { marketDrawerWidth } from "../../features/market"
import FilterListIcon from "@mui/icons-material/FilterList"
import {
  Button,
  Grid,
  Box,
  useMediaQuery,
  Container,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
} from "@mui/material"
import { Page } from "../../components/metadata/Page"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { CreateRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { OpenLayout } from "../../components/layout/ContainerGrid"
import { MarketSidebarContext } from "../../features/market/hooks/MarketSidebar"
import { ServiceSidebarContext } from "../../hooks/contract/ServiceSidebar"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"

const ItemMarketView = React.lazy(() =>
  import("../../features/market/components/ItemMarketView").then((module) => ({
    default: module.ItemMarketView,
  })),
)
const ServiceMarketView = React.lazy(() =>
  import("../../views/services/ServiceMarketView").then((module) => ({
    default: module.ServiceMarketView,
  })),
)
const MarketActions = React.lazy(() =>
  import("../../features/market/components/MarketActions").then((module) => ({
    default: module.MarketActions,
  })),
)
const ServiceActions = React.lazy(() =>
  import("../../views/services/ServiceActions").then((module) => ({
    default: module.ServiceActions,
  })),
)

export function Contracts() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const location = useLocation()
  const navigate = useNavigate()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)
  const [contractSidebarOpen, setContractSidebarOpen] = useState(!xs)

  const pages = ["/market/services", "/market", "/contracts"]
  const tabPage = useMemo(
    () =>
      pages.indexOf(
        pages.find((p) => location.pathname.startsWith(p)) || "/contracts",
      ),
    [location.pathname],
  )

  return (
    <Page title={t("contracts.contractsTitle")} dontUseDefaultCanonUrl={true}>
      <MarketSidebarContext.Provider
        value={[marketSidebarOpen, setMarketSidebarOpen]}
      >
        <ServiceSidebarContext.Provider
          value={[serviceSidebarOpen, setServiceSidebarOpen]}
        >
          <ContractSearchContext.Provider
            value={useState<ContractSearchState>({ query: "", sort: "date-old" })}
          >
            <ContractSidebarContext.Provider
              value={[contractSidebarOpen, setContractSidebarOpen]}
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
                        {xs && tabPage === 1 && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<FilterListIcon />}
                            aria-label={t("market.toggleSidebar")}
                            onClick={() => setMarketSidebarOpen((prev) => !prev)}
                            sx={{
                              [theme.breakpoints.up("md")]: { display: "none" },
                              borderRadius: 2,
                              textTransform: "none",
                            }}
                          >
                            {t("market.filters", "Filters")}
                          </Button>
                        )}
                        {xs && tabPage === 0 && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<FilterListIcon />}
                            aria-label={t("service_market.toggle_sidebar")}
                            onClick={() => setServiceSidebarOpen((prev) => !prev)}
                            sx={{
                              [theme.breakpoints.up("md")]: { display: "none" },
                              borderRadius: 2,
                              textTransform: "none",
                            }}
                          >
                            {t("service_market.filters", "Filters")}
                          </Button>
                        )}
                        {xs && tabPage === 2 && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<FilterListIcon />}
                            aria-label={t("contracts.toggleSidebar")}
                            onClick={() => setContractSidebarOpen((prev) => !prev)}
                            sx={{
                              [theme.breakpoints.up("md")]: { display: "none" },
                              borderRadius: 2,
                              textTransform: "none",
                            }}
                          >
                            {t("contracts.filters", "Filters")}
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
                        <Suspense fallback={<CircularProgress size={24} />}>
                          <MarketActions />
                        </Suspense>
                      ) : tabPage === 0 ? (
                        <Suspense fallback={<CircularProgress size={24} />}>
                          <ServiceActions />
                        </Suspense>
                      ) : (
                        <Link
                          to={"/contracts/create"}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          <Button
                            color={"secondary"}
                            startIcon={<CreateRounded />}
                            variant={"contained"}
                            size={"large"}
                          >
                            {t("contracts.createOpenContract")}
                          </Button>
                        </Link>
                      )}
                    </Grid>
                  </Grid>
                </Container>

                <TabPanel value={tabPage} index={1}>
                  <Suspense fallback={null}>
                    <ItemMarketView />
                  </Suspense>
                </TabPanel>
                <TabPanel value={tabPage} index={0}>
                  <Suspense fallback={null}>
                    <ServiceMarketView />
                  </Suspense>
                </TabPanel>
                <TabPanel value={tabPage} index={2}>
                  <ContractSidebar />
                  <ContractListings />
                </TabPanel>
              </OpenLayout>
            </ContractSidebarContext.Provider>
          </ContractSearchContext.Provider>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
