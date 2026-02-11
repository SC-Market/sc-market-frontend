import React, { useMemo } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { PageBreadcrumbs } from "../../components/navigation"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import {
  AggregateMarketListingForm,
  MarketListingForm,
  MarketMultipleForm,
} from "../../features/market/components/MarketListingForm"
import { Page } from "../../components/metadata/Page"
import { Link } from "react-router-dom"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../store/profile"

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
import AlertTitle from '@mui/material/AlertTitle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
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
import LocalOfferRounded from '@mui/icons-material/LocalOfferRounded';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';

const name_to_index = new Map([
  // ["aggregate", 0],
  ["unique", 0],
  ["auction", 1],
  ["combined", 2],
])

export function MarketCreate(props: {}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => name_to_index.get(tab || "aggregate") || 0, [tab])
  const { data: userProfile } = useGetUserProfileQuery()

  const isVerified = userProfile?.rsi_confirmed

  return (
    <Page title={t("market.createMarketListing")}>
      <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
        <Grid item xs={12}>
          <PageBreadcrumbs
            items={[
              { label: t("market.title", "Market"), href: "/market" },
              {
                label: t("sidebar.my_market_listings"),
                href: "/market/me",
              },
              { label: t("market.createMarketListing") },
            ]}
          />
        </Grid>
        <HeaderTitle lg={12} xl={12}>
          {t("market.createMarketListing")}
        </HeaderTitle>

        {!isVerified && (
          <Grid item xs={12}>
            <Alert severity="warning">
              {t(
                "market.verificationRequired",
                "Your account must be verified to create market listings. Please verify your account with RSI/Citizen iD to continue.",
              )}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Tabs
            value={page}
            // onChange={handleChange}
            aria-label={t("market.aria.listingTabs")}
            variant="scrollable"
            textColor="secondary"
            indicatorColor="secondary"
          >
            {/*<Tab
              label={t("market.bulkListingTab")}
              component={Link}
              to={`/market/create/aggregate`}
              // icon={
              //     <DesignServicesRounded/>
              // }
              {...a11yProps(0)}
            />*/}
            <Tab
              component={Link}
              to={`/market/create/unique`}
              label={t("market.uniqueListingTab")}
              // icon={
              //     <InfoRounded/>
              // }
              {...a11yProps(0)}
            />
            <Tab
              component={Link}
              to={`/market/create/auction`}
              label={t("market.auctionTab")}
              // icon={
              //     <InfoRounded/>
              // }
              {...a11yProps(1)}
            />
            <Tab
              component={Link}
              to={`/market/create/combined`}
              label={t("market.combinedListingTab")}
              // icon={
              //     <InfoRounded/>
              // }
              {...a11yProps(2)}
            />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          {/*<TabPanel value={page} index={0}>
            <Grid container spacing={theme.layoutSpacing.layout * 4}>
              <AggregateMarketListingForm />
            </Grid>
          </TabPanel>*/}
          <TabPanel value={page} index={0}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {isVerified ? (
                <MarketListingForm sale_type={"sale"} key={"sale"} />
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {t(
                      "market.pleaseVerify",
                      "Please verify your account to create market listings.",
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={1}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {isVerified ? (
                <MarketListingForm sale_type={"auction"} key={"auction"} />
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {t(
                      "market.pleaseVerify",
                      "Please verify your account to create market listings.",
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={2}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {isVerified ? (
                <MarketMultipleForm />
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {t(
                      "market.pleaseVerify",
                      "Please verify your account to create market listings.",
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
