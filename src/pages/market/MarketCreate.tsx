import React, { useMemo } from "react"
import {
  MarketListingForm,
  MarketMultipleForm,
} from "../../features/market/components/MarketListingForm"
import { Alert, Grid, Tab, Tabs } from "@mui/material"
import { Link } from "react-router-dom"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageMarketCreate } from "../../features/market/hooks/usePageMarketCreate"

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
  const pageData = usePageMarketCreate()

  const isVerified = pageData.data?.isVerified

  return (
    <StandardPageLayout
      title={t("market.createMarketListing")}
      breadcrumbs={[
        { label: t("sidebar.market_short"), href: "/market" },
        {
          label: t("sidebar.my_market_listings", "My Listings"),
          href: "/market/me",
        },
        { label: t("market.createMarketListing", "Create Listing") },
      ]}
      headerTitle={t("market.createMarketListing")}
      sidebarOpen={true}
      maxWidth="lg"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
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
          aria-label={t("market.aria.listingTabs")}
          variant="scrollable"
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab
            component={Link}
            to={`/market/create/unique`}
            label={t("market.uniqueListingTab")}
            {...a11yProps(0)}
          />
          <Tab
            component={Link}
            to={`/market/create/auction`}
            label={t("market.auctionTab")}
            {...a11yProps(1)}
          />
          <Tab
            component={Link}
            to={`/market/create/combined`}
            label={t("market.combinedListingTab")}
            {...a11yProps(2)}
          />
        </Tabs>
      </Grid>
      <Grid item xs={12}>
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
    </StandardPageLayout>
  )
}
