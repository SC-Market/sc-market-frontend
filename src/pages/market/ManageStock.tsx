import React, { useEffect, useState } from "react"
import { Grid, Paper } from "@mui/material"
import { MarketSearchArea } from "../../views/market/MarketSidebar"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { MarketSidebarContext } from "../../hooks/market/MarketSidebar"
import { Page } from "../../components/metadata/Page"
import { ItemStockContext, MyItemStock } from "../../views/market/ItemStock"
import { useMarketSearch } from "../../hooks/market/MarketSearch"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GridRowSelectionModel } from "@mui/x-data-grid"

export function ManageStock() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const [searchState, setSearchState] = useMarketSearch()

  useEffect(() => {
    setSearchState({
      query: "",
      quantityAvailable: 0,
      sort: searchState.sort || "activity",
      statuses: "active,inactive",
    })
  }, [])

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  })

  return (
    <Page title={t("sidebar.my_market_listings")}>
      <ItemStockContext.Provider value={[selectionModel, setSelectionModel]}>
        <MarketSidebarContext.Provider value={[open, setOpen]}>
          <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
            <HeaderTitle>{t("sidebar.manage_listings")}</HeaderTitle>

            <Grid item xs={12} md={3}>
              <Paper>
                <MarketSearchArea status />
              </Paper>
            </Grid>

            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MyItemStock />
                </Grid>
                {/*{profile?.role === "admin" && (*/}
                {/*  <Grid item xs={12}>*/}
                {/*    <ItemStockRework />*/}
                {/*  </Grid>*/}
                {/*)}*/}
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Link to={"/market/me"} style={{ color: "inherit" }}>
                <UnderlineLink>{t("sidebar.archived_listings")}</UnderlineLink>
              </Link>
            </Grid>
          </ContainerGrid>
        </MarketSidebarContext.Provider>
      </ItemStockContext.Provider>
    </Page>
  )
}
