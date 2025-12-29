import React, { useMemo } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import {
  AggregateMarketListingForm,
  MarketListingForm,
  MarketMultipleForm,
} from "../../views/market/MarketListingForm"
import { Page } from "../../components/metadata/Page"
import { Grid, Tab, Tabs } from "@mui/material"
import { Link } from "react-router-dom"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { useParams } from "react-router-dom"
import { BackArrow } from "../../components/button/BackArrow"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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

  return (
    <Page title={t("market.createMarketListing")}>
      <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
        <HeaderTitle lg={12} xl={12}>
          <BackArrow /> {t("market.createMarketListing")}
        </HeaderTitle>

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
            <Grid container spacing={theme.layoutSpacing.layout * 4}>
              <MarketListingForm sale_type={"sale"} key={"sale"} />
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={1}>
            <Grid container spacing={theme.layoutSpacing.layout * 4}>
              <MarketListingForm sale_type={"auction"} key={"auction"} />
            </Grid>
          </TabPanel>
          <TabPanel value={page} index={2}>
            <Grid container spacing={theme.layoutSpacing.layout * 4}>
              <MarketMultipleForm />
            </Grid>
          </TabPanel>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
