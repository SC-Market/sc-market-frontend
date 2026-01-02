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
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { Button, Grid, IconButton, useMediaQuery } from "@mui/material"
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
  const [open, setOpen] = useState(true)
  const [drawerOpen] = useDrawerOpen()

  return (
    <Page title={t("contracts.contractsTitle")}>
      <ContractSearchContext.Provider
        value={useState<ContractSearchState>({ query: "", sort: "date-old" })}
      >
        <ContractSidebarContext.Provider value={[open, setOpen]}>
          {isMobile ? (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FilterListIcon />}
              aria-label={t("contracts.toggleSidebar")}
              onClick={() => {
                setOpen(true)
              }}
              sx={{
                position: "fixed",
                bottom: { xs: 80, sm: 24 },
                right: 24,
                zIndex: theme.zIndex.speedDial,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: theme.shadows[4],
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {t("contracts.filters", "Filters")}
            </Button>
          ) : null}
          <ContractSidebar />
          <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
            <Grid item xs={12}>
              <Grid
                container
                justifyContent={"space-between"}
                alignItems={"center"}
                spacing={theme.layoutSpacing.layout}
              >
                <Grid item sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {!isMobile && (
                    <IconButton
                      color="secondary"
                      aria-label={t("contracts.toggleSidebar")}
                      onClick={() => {
                        setOpen(true)
                      }}
                    >
                      {open ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                  )}
                  <HeaderTitle lg={8} xl={8}>
                    {t("contracts.activeContracts")}
                  </HeaderTitle>
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
