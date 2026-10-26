import React, { useState } from "react"
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
import {
  MARKET_FILTER_PANEL_SX,
  MarketPageLayout,
} from "../../components/layout/MarketPageLayout"
import { Page } from "../../components/metadata/Page"
// Static, not lazy: a one-button header that otherwise popped in late and
// shifted the header row (on phones it is a full-width row of its own).
import { ContractActions } from "../../views/contracts/ContractActions"

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
            headerActions={<ContractActions />}
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
                      <Paper sx={MARKET_FILTER_PANEL_SX}>
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
