import { Link, Navigate, useParams } from "react-router-dom"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { BackArrow } from "../../components/button/BackArrow"
import { CurrentMarketListingContext } from "../../features/market"
import {
  useGetMarketListingQuery,
  useGetMultipleByIdQuery,
} from "../../features/market"
import { MarketListingView } from "../../views/market/MarketListingView"
import { MarketListingViewSkeleton } from "../../views/market/MarketListingView"
import { Page } from "../../components/metadata/Page"
import { PageBreadcrumbs } from "../../components/navigation"
import { MarketListingEditView } from "../../views/market/MarketListingEditView"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { MarketMultipleEditView } from "../../features/market/components/MarketMultipleEditView"
import { formatCompleteListingUrl, formatMarketUrl } from "../../util/urls"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"
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

export function ViewMarketListing() {
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()

  /*
   * TODO:
   *   Contract appliants
   *   Accept applicant, update order status,
   *   order comments, update date,
   *   assigned person, payment
   */

  const { t } = useTranslation()

  const {
    data: listing,
    error,
    refetch,
    isLoading,
  } = useGetMarketListingQuery(id!)

  return (
    <Page
      title={listing?.details?.title}
      canonUrl={listing && formatCompleteListingUrl(listing)}
    >
      <ContainerGrid sidebarOpen={true} maxWidth={"xl"}>
        <Grid item xs={12}>
          <PageBreadcrumbs
            items={[
              { label: t("market.title", "Market"), href: "/market" },
              {
                label:
                  listing?.details?.title ||
                  t("market.viewMarketListing", "Listing"),
              },
            ]}
          />
        </Grid>

        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle md={7} lg={7} xl={7}>
            {listing?.details?.title || t("market.viewMarketListing")}
          </HeaderTitle>

          <Grid item>
            <Link
              to={"/market/cart"}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Button
                color={"secondary"}
                startIcon={<ShoppingCartRoundedIcon />}
                variant={"contained"}
                size={"large"}
              >
                {t("marketActions.myCart")}
              </Button>
            </Link>
          </Grid>
        </Grid>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}
        {isLoading ? (
          <MarketListingViewSkeleton />
        ) : listing ? (
          <CurrentMarketListingContext.Provider value={[listing!, refetch]}>
            {(() => {
              return <MarketListingView />

              // if (order.data!.customer === profile.data?.username) {
              //     return <ManageOrderOwner/>
              // } else if (order.data!.assigned_to === profile.data?.username) {
              //     return <ManageOrderOrg/>
              // } else {
              //     return <ViewPublicOrder/>
              // }
            })()}
          </CurrentMarketListingContext.Provider>
        ) : null}
      </ContainerGrid>
    </Page>
  )
}

export function EditMarketListing() {
  /*
   * TODO:
   *   Contract appliants
   *   Accept applicant, update order status,
   *   order comments, update date,
   *   assigned person, payment
   */
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const {
    data: listing,
    error,
    refetch,
    isLoading,
  } = useGetMarketListingQuery(id!)

  return (
    <Page title={listing?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <HeaderTitle>
          <BackArrow /> {t("market.editMarketListing")}
        </HeaderTitle>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}
        {isLoading ? (
          <MarketListingViewSkeleton />
        ) : listing ? (
          <CurrentMarketListingContext.Provider value={[listing!, refetch]}>
            {(() => {
              return <MarketListingEditView />

              // if (order.data!.customer === profile.data?.username) {
              //     return <ManageOrderOwner/>
              // } else if (order.data!.assigned_to === profile.data?.username) {
              //     return <ManageOrderOrg/>
              // } else {
              //     return <ViewPublicOrder/>
              // }
            })()}
          </CurrentMarketListingContext.Provider>
        ) : null}
      </ContainerGrid>
    </Page>
  )
}

export function EditMultipleListing() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const {
    data: listing,
    error,
    refetch,
    isLoading,
  } = useGetMultipleByIdQuery(id!)

  return (
    <Page title={listing?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <HeaderTitle>
          <BackArrow /> {t("market.editMultipleListing")}
        </HeaderTitle>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}
        {isLoading ? (
          <MarketListingViewSkeleton />
        ) : listing ? (
          <CurrentMarketListingContext.Provider value={[listing!, refetch]}>
            {(() => {
              return <MarketMultipleEditView />

              // if (order.data!.customer === profile.data?.username) {
              //     return <ManageOrderOwner/>
              // } else if (order.data!.assigned_to === profile.data?.username) {
              //     return <ManageOrderOrg/>
              // } else {
              //     return <ViewPublicOrder/>
              // }
            })()}
          </CurrentMarketListingContext.Provider>
        ) : null}
      </ContainerGrid>
    </Page>
  )
}
