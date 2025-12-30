import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { Button, Grid, IconButton } from "@mui/material"
import { Page } from "../../components/metadata/Page"
import { ServiceSidebar } from "../../views/contracts/ServiceSidebar"
import { ServiceSidebarContext } from "../../hooks/contract/ServiceSidebar"
import { ServiceListings } from "../../views/contracts/ServiceListings"
import { Link } from "react-router-dom"
import { CreateRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function Services() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [open, setOpen] = useState(true)

  const [drawerOpen] = useDrawerOpen()

  return (
    <Page title={t("services.contractsTitle")}>
      <ServiceSidebarContext.Provider value={[open, setOpen]}>
        <IconButton
          color="secondary"
          aria-label={t("services.toggleSidebar")}
          sx={{
            position: "absolute",
            zIndex: 50,
            left: (drawerOpen ? sidebarDrawerWidth : 0) + 24,
            top: 64 + 24,
            transition: "0.3s",
          }}
          onClick={() => {
            setOpen((prev) => !prev)
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <ServiceSidebar />
        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
          <Grid
            item
            container
            justifyContent={"space-between"}
            spacing={theme.layoutSpacing.layout}
            xs={12}
          >
            <HeaderTitle md={7} lg={7} xl={7}>
              {t("services.contractorServices")}
            </HeaderTitle>
            <Grid item>
              <Link
                to={"/order/service/create"}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Button
                  color={"secondary"}
                  startIcon={<CreateRounded />}
                  variant={"contained"}
                  size={"large"}
                >
                  {t("services.createService")}
                </Button>
              </Link>
            </Grid>
          </Grid>
          <ServiceListings />
        </ContainerGrid>
      </ServiceSidebarContext.Provider>
    </Page>
  )
}
