import React, { useState, lazy } from "react"
import { ContractListings } from "../../views/contracts/ContractListings"
import { ContractSidebar } from "../../views/contracts/ContractSidebar"
import { ContractSidebarContext } from "../../features/contracting/hooks/ContractSidebar"
import {
  ContractSearchContext,
  ContractSearchState,
} from "../../features/contracting/hooks/ContractSearch"
import { FiltersFAB } from "../../components/mobile/FiltersFAB"
import { Divider, Grid, Box, Stack, Container, Paper } from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { useHydratedInitialState } from "../../hooks/ssr/useHydratedInitialState"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MarketPageLayout } from "../../components/layout/MarketPageLayout"
import { Page } from "../../components/metadata/Page"
import { LazySection } from "../../components/layout/LazySection"

const ContractActions = lazy(() =>
  import("../../views/contracts/ContractActions").then((module) => ({
    default: module.ContractActions,
  })),
)

export function Contracts() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useBreakpointDown("lg")
  const [contractSearchState, setContractSearchState] =
    useState<ContractSearchState>({ query: "", sort: "date-old" })
  const [contractSidebarOpen, setContractSidebarOpen] =
    useHydratedInitialState(!showMobileSidebar)

  return (
    <Page title={t("contracts.contractsTitle")}>
      <ContractSearchContext.Provider
        value={[contractSearchState, setContractSearchState]}
      >
        <ContractSidebarContext.Provider
          value={[contractSidebarOpen, setContractSidebarOpen]}
        >
          <MarketPageLayout
            title={t("nav.contracts", "Contracts")}
            headerActions={
              <LazySection component={ContractActions} skeleton={() => null} />
            }
            fab={
              showMobileSidebar ? (
                <FiltersFAB
                  onClick={() => setContractSidebarOpen((prev) => !prev)}
                  label={t("contracts.toggleSidebar")}
                />
              ) : undefined
            }
          >
            <Container maxWidth="xxxl" sx={{ padding: 0 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                {showMobileSidebar ? (
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    <Grid item xs={12}>
                      <Divider light />
                    </Grid>
                    <Grid item xs={12}>
                      <ContractSidebar />
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={theme.layoutSpacing.layout}>
                        <ContractListings />
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={theme.layoutSpacing.layout}
                    sx={{ width: "100%", maxWidth: "xxxl" }}
                  >
                    {contractSidebarOpen && (
                      <Paper
                        sx={{
                          position: "sticky",
                          top: "calc(64px + 16px)",
                          maxHeight: "calc(100vh - 64px - 32px)",
                          height: "fit-content",
                          width: 300,
                          flexShrink: 0,
                          overflowY: "auto",
                        }}
                      >
                        <ContractSidebar />
                      </Paper>
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Grid container spacing={theme.layoutSpacing.layout}>
                        <ContractListings />
                      </Grid>
                    </Box>
                  </Stack>
                )}
              </Box>
            </Container>
          </MarketPageLayout>
        </ContractSidebarContext.Provider>
      </ContractSearchContext.Provider>
    </Page>
  )
}
