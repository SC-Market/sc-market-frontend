import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { OrgBalance } from "../../views/contractor/OrgBalance"
import { OrgTransactions } from "../../views/contractor/OrgTransactions"
import { OrderMetrics } from "../../views/orders/OrderMetrics"
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

export function OrgMoney() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
      <HeaderTitle>{t("org.moneyTitle")}</HeaderTitle>

      <Grid
        item
        xs={12}
        container
        spacing={theme.layoutSpacing.layout * 4}
        justifyContent={"center"}
      >
        <Grid item xs={12} lg={4}>
          <Grid
            container
            spacing={theme.layoutSpacing.layout * 4}
            direction={"column"}
          >
            <OrgBalance />
            <OrderMetrics />
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout * 4}
        >
          <OrgTransactions />
        </Grid>
      </Grid>
    </ContainerGrid>
  )
}
