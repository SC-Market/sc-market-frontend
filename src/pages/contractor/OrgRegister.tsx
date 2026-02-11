import React, { useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { AuthenticateContractor } from "../../views/authentication/AuthenticateContractor"
import { Page } from "../../components/metadata/Page"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { CreateNewContractor } from "../../views/authentication/CreateNewContractor"
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

export function OrgRegister() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)

  return (
    <Page title={t("org.registerOrgTitle")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <HeaderTitle>{t("org.registerOrgTitle")}</HeaderTitle>

        <Grid item xs={12}>
          <Tabs
            value={page}
            onChange={(_, newPage) => setPage(newPage)}
            aria-label={t("ui.aria.orgInfoArea")}
            variant="scrollable"
          >
            <Tab
              label={t("org.existingRsiOrg")}
              icon={<HowToRegRounded />}
              {...a11yProps(0)}
            />

            <Tab
              label={t("org.newContractor")}
              icon={<CreateRounded />}
              {...a11yProps(1)}
            />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={page} index={0}>
            <AuthenticateContractor />
          </TabPanel>
          <TabPanel value={page} index={1}>
            <CreateNewContractor />
          </TabPanel>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
