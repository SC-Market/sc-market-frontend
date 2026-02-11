import React from "react"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
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
import MaterialLink from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Grid2 from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
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
import RefreshRounded from '@mui/icons-material/RefreshRounded';

export function ErrorPageBody() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const handleRetry = () => {
    // Full page reload to avoid getting stuck in error loops
    window.location.reload()
  }

  const handleGoBack = () => {
    // Navigate back to the errored page
    navigate(location.pathname)
  }

  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant={"h3"}
          sx={{ fontWeight: "bold" }}
          color={"text.secondary"}
          align={"center"}
        >
          {t("errorPage.title", "Something went wrong")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t(
            "errorPage.subtitle",
            "We encountered an error while loading this page. This could be due to a temporary server issue or network problem.",
          )}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm="auto">
            <Button
              color={"primary"}
              variant={"contained"}
              size={"large"}
              fullWidth
              startIcon={<RefreshRounded />}
              onClick={handleRetry}
            >
              {t("errorPage.retry", "Try Again")}
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              color={"secondary"}
              variant={"outlined"}
              size={"large"}
              fullWidth
              startIcon={<ArrowBackRounded />}
              onClick={handleGoBack}
            >
              {t("errorPage.goBackToPage", "Go Back to Page")}
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography
          variant={"body2"}
          color={"text.secondary"}
          align={"center"}
          sx={{ mt: 2 }}
        >
          {t("errorPage.path", "Page")}: <code>{location.pathname}</code>
        </Typography>
      </Grid>
    </>
  )
}

export function ErrorPage() {
  const { t } = useTranslation()
  return (
    <Page title={t("errorPage.pageTitle", "Error")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <ErrorPageBody />
      </ContainerGrid>
    </Page>
  )
}
