import React, { useState } from "react"
import { Grid, Paper, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { CreateBuyOrderV2 } from "./components/CreateBuyOrderV2"

export function CreateBuyOrderPageV2() {
  const { t } = useTranslation()
  const [selectedGameItemId, setSelectedGameItemId] = useState<string | null>(null)
  const [selectedGameItemName, setSelectedGameItemName] = useState<string | null>(null)
  const [selectedGameItemType, setSelectedGameItemType] = useState<string | null>(null)

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
            onChange={(name, type, itemId) => { setSelectedGameItemId(itemId); setSelectedGameItemName(name); setSelectedGameItemType(type) }}
            label={t("buyOrderActions.searchItem", "Search for a game item")}
          />
        </Paper>
      </Grid>
      {selectedGameItemId && (
        <Grid item xs={12}>
          <CreateBuyOrderV2 gameItemId={selectedGameItemId} gameItemName={selectedGameItemName || undefined} gameItemType={selectedGameItemType || undefined} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
