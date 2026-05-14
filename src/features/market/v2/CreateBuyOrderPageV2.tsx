import React, { useState } from "react"
import { Grid, Paper, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { CreateBuyOrderV2 } from "./components/CreateBuyOrderV2"
import type { GameItemSearchResult } from "../../../store/api/v2/market"

export function CreateBuyOrderPageV2() {
  const { t } = useTranslation()
  const [selectedGameItem, setSelectedGameItem] = useState<GameItemSearchResult | null>(null)

  return (
    <StandardPageLayout
      title={t("buyOrderActions.createBuyOrder", "Create Buy Order")}
      headerTitle={t("buyOrderActions.createBuyOrder", "Create Buy Order")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.buy_orders", "Buy Orders"), href: "/buyorders" },
        { label: t("buyOrderActions.createBuyOrder", "Create Buy Order") },
      ]}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            {t("buyOrderActions.selectItem", "Select Game Item")}
          </Typography>
          <GameItemSearchAutocomplete
            value={null}
            onChange={(name, type, itemId) => setSelectedGameItem({ id: itemId, name, type })}
            label={t("buyOrderActions.searchItem", "Search for a game item")}
          />
        </Paper>
      </Grid>
      {selectedGameItem && (
        <Grid item xs={12}>
          <CreateBuyOrderV2 gameItem={selectedGameItem} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
