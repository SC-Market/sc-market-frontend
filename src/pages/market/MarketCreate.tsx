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
