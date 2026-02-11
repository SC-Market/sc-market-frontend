import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Link } from "react-router-dom"
import { MyServices } from "../../views/orders/Services"
import { Page } from "../../components/metadata/Page"
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

export function MyServicesPage(props: {}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Page title={t("services.myServices")}>
      <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle lg={8} xl={8}>
            {t("services.myServices")}
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

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <Grid
          item
          container
          xs={12}
          lg={12}
          spacing={theme.layoutSpacing.layout}
          sx={{ transition: "0.3s" }}
        >
          <MyServices status={"active"} />
        </Grid>

        <Grid
          item
          container
          xs={12}
          lg={12}
          spacing={theme.layoutSpacing.layout}
          sx={{ transition: "0.3s" }}
        >
          <MyServices status={"inactive"} />
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
