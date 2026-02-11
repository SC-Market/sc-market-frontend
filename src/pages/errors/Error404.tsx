import React from "react"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Link } from "react-router-dom"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"

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
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Link1 from '@mui/material/Link';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';
import AccountBoxRounded from '@mui/icons-material/AccountBoxRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Block from '@mui/icons-material/Block';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';

export function PageBody404() {
  const { t } = useTranslation()
  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant={"h3"}
          sx={{ fontWeight: "bold" }}
          color={"text.secondary"}
          align={"center"}
        >
          {t("error404.title")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t("error404.subtitle")}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Grid>

      <Grid item>
        <Link
          to={"/dashboard"}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Button color={"secondary"} variant={"outlined"}>
            {t("error404.returnToDashboard")}
          </Button>
        </Link>
      </Grid>
    </>
  )
}

export function Error404() {
  const { t } = useTranslation()
  return (
    <Page title={"404"}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <PageBody404 />
      </ContainerGrid>
    </Page>
  )
}
