import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React from "react"
import { ActiveDeliveries } from "../../views/fleet/ActiveDeliveries"
import { Ships } from "../../views/fleet/Ships"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
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
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
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

export function Fleet() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <ContainerGrid maxWidth={"xxl"} sidebarOpen={true}>
      <HeaderTitle>{t("fleet.fleetTitle")}</HeaderTitle>
      <Grid container xs={12} spacing={theme.layoutSpacing.layout * 4} item>
        <Ships />
        <Grid
          item
          xs={12}
          xl={7}
          container
          spacing={theme.layoutSpacing.layout * 4}
        >
          {/*<FleetBreakdown/>*/}
          <ActiveDeliveries />
        </Grid>
      </Grid>
    </ContainerGrid>
  )
}
