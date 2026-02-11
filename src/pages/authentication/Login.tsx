import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React from "react"
import { Authenticate } from "../../views/authentication/Authenticate"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useGetUserProfileQuery } from "../../store/profile"
import { Navigate } from "react-router-dom"
import { LoginInfoPanel } from "./LoginInfoPanel"
import { RegisterShip } from "../../views/fleet/RegisterShip"
import { DashNotificationArea } from "../../views/notifications/DashNotificationArea"
import { AuthenticateRSI } from "../../views/authentication/AuthenticateRSI"
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
import Stack from '@mui/material/Stack';
import useTheme1 from '@mui/material/styles';
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
import ArrowBack from '@mui/icons-material/ArrowBack';

export function Login() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const profile = useGetUserProfileQuery()

  return (
    <ContainerGrid maxWidth={"xl"} sidebarOpen={false}>
      {!profile.isLoading && !profile.error && <Navigate to={"/dashboard"} />}
      <Grid
        item
        xs={12}
        lg={8}
        container
        spacing={theme.layoutSpacing.layout * 4}
      >
        <HeaderTitle></HeaderTitle>
        <LoginInfoPanel />
      </Grid>

      <Grid item xs={12} lg={4}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout * 4}
          alignItems={"flex-start"}
        >
          <HeaderTitle>{t("login.title")}</HeaderTitle>
          <AuthenticateRSI />
        </Grid>
      </Grid>

      <RegisterShip />
      <DashNotificationArea />
    </ContainerGrid>
  )
}
