import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { ContractListings } from "../../views/contracts/ContractListings"
import { ContractSidebar } from "../../views/contracts/ContractSidebar"
import { ContractSidebarContext } from "../../hooks/contract/ContractSidebar"
import {
  ContractSearchContext,
  ContractSearchState,
} from "../../hooks/contract/ContractSearch"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../features/market"
import FilterListIcon from "@mui/icons-material/FilterList"
import { Button, Grid, Box, useMediaQuery } from "@mui/material"
import { Page } from "../../components/metadata/Page"
import { Link } from "react-router-dom"
import { CreateRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function Contracts() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  // Start closed on mobile (BottomSheet), open on desktop (Drawer)
  const [open, setOpen] = useState(!isMobile)
  const [drawerOpen] = useDrawerOpen()

  return (
    <Page title={t("contracts.contractsTitle")}>
      <ContractSearchContext.Provider
        value={useState<ContractSearchState>({ query: "", sort: "date-old" })}
      >
        <ContractSidebarContext.Provider value={[open, setOpen]}>
          <ContractSidebar />
          <ContainerGrid
            maxWidth={"lg"}
            sidebarOpen={open}
            sidebarWidth={marketDrawerWidth}
          >
            <Grid item xs={12}>
              <Grid
                container
                justifyContent={"space-between"}
                alignItems={"center"}
                spacing={theme.layoutSpacing.layout}
              >
                <Grid item xs={12} sm="auto">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Filter button - always show on mobile */}
                    {isMobile && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<FilterListIcon />}
                        aria-label={t("contracts.toggleSidebar")}
                        onClick={() => {
                          setOpen(!open)
                        }}
                        sx={{
                          [theme.breakpoints.up("md")]: {
                            display: "none",
                          },
                          borderRadius: 2,
                          textTransform: "none",
                        }}
                      >
                        {t("contracts.filters", "Filters")}
                      </Button>
                    )}
                    <HeaderTitle lg={8} xl={8}>
                      {t("contracts.activeContracts")}
                    </HeaderTitle>
                  </Box>
                </Grid>

                <Grid item>
                  <Link
                    to={"/orders"}
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
                </Grid>
              </Grid>
            </Grid>

            <ContractListings />
          </ContainerGrid>
        </ContractSidebarContext.Provider>
      </ContractSearchContext.Provider>
    </Page>
  )
}
