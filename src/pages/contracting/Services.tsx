import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { Page } from "../../components/metadata/Page"
import { ServiceSidebar } from "../../views/contracts/ServiceSidebar"
import { ServiceSidebarContext } from "../../hooks/contract/ServiceSidebar"
import { ServiceListings } from "../../views/contracts/ServiceListings"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';

export function Services() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(true)

  const [drawerOpen] = useDrawerOpen()

  return (
    <Page title={t("services.contractsTitle")}>
      <ServiceSidebarContext.Provider value={[open, setOpen]}>
        <ServiceSidebar />
        <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
          <Grid
            item
            container
            justifyContent={"space-between"}
            spacing={theme.layoutSpacing.layout}
            xs={12}
            alignItems="center"
          >
            <Grid item md={7} lg={7} xl={7}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isMobile ? (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FilterListIcon />}
                    aria-label={t("services.toggleSidebar")}
                    onClick={() => {
                      setOpen((prev) => !prev)
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    {t("services.filters", "Filters")}
                  </Button>
                ) : (
                  <IconButton
                    color="secondary"
                    aria-label={t("services.toggleSidebar")}
                    onClick={() => {
                      setOpen((prev) => !prev)
                    }}
                    sx={{
                      transition: "0.3s",
                    }}
                  >
                    {open ? <CloseIcon /> : <MenuIcon />}
                  </IconButton>
                )}
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", margin: 0 }}
                  color={"text.secondary"}
                >
                  {t("services.contractorServices")}
                </Typography>
              </Box>
            </Grid>
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
