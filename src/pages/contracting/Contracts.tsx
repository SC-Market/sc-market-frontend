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
import { Button, Grid, IconButton } from "@mui/material"
import { Page } from "../../components/metadata/Page"
import { Link } from "react-router-dom"
import { CreateRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function Contracts() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [open, setOpen] = useState(true)
  const [drawerOpen] = useDrawerOpen()

  return (
    <Page title={t("contracts.contractsTitle")}>
      <ContractSearchContext.Provider
        value={useState<ContractSearchState>({ query: "", sort: "date-old" })}
      >
        <ContractSidebarContext.Provider value={[open, setOpen]}>
          <IconButton
            color="secondary"
            aria-label={t("contracts.toggleSidebar")}
            sx={{
              position: "absolute",
              zIndex: 50,
              left: (drawerOpen ? sidebarDrawerWidth : 0) + 24,
              top: 64 + 24,
              transition: "0.3s",
            }}
            onClick={() => {
              setOpen(true)
            }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <ContractSidebar />
          <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
            <Grid item xs={12}>
              <Grid container justifyContent={"space-between"} spacing={theme.layoutSpacing.layout}>
                <HeaderTitle lg={8} xl={8}>
                  {t("contracts.activeContracts")}
                </HeaderTitle>

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
