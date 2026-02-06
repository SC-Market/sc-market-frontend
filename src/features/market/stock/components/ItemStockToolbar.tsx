import React, { useCallback, useContext, useState } from "react"
import {
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from "@mui/material"
import {
  AddRounded,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { GridRowModes, GridRowModesModel } from "@mui/x-data-grid"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { UniqueListing, MarketListingUpdateBody } from "../../domain/types"
import { useUpdateMarketListingMutation } from "../../api/marketApi"
import { NewListingRow } from "../types"
import { ManageStockArea, ItemStockContext } from "./ManageStockArea"

export function ItemStockToolbar(props: {
  listings: UniqueListing[]
  setNewRows: (newRows: (oldRows: NewListingRow[]) => NewListingRow[]) => void
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void
  newRows: NewListingRow[]
  isMobile?: boolean
  onAddQuickListing?: () => void
}) {
  const context = useContext(ItemStockContext)
  if (!context || !Array.isArray(context)) {
    return null
  }
  const [selectionModel] = context
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = props.isMobile ?? useMediaQuery(theme.breakpoints.down("md"))

  const [updateListing, { isLoading }] = useUpdateMarketListingMutation()
  const updateListingCallback = useCallback(
    async (body: MarketListingUpdateBody) => {
      selectionModel.ids.forEach((row_id) => {
        updateListing({
          listing_id: row_id.toString(),
          body,
        })
      })
    },
    [selectionModel, updateListing],
  )

  if (isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <ManageStockArea listings={props.listings} />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <LoadingButton
            color={"success"}
            startIcon={<RadioButtonCheckedRounded />}
            variant={"outlined"}
            size={"small"}
            loading={isLoading}
            onClick={() => {
              updateListingCallback({ status: "active" })
            }}
            fullWidth
          >
            {t("ItemStock.activate")}
          </LoadingButton>
          <LoadingButton
            color={"error"}
            startIcon={<RadioButtonUncheckedRounded />}
            variant={"outlined"}
            size={"small"}
            loading={isLoading}
            onClick={() => {
              updateListingCallback({ status: "inactive" })
            }}
            fullWidth
          >
            {t("ItemStock.deactivate")}
          </LoadingButton>
          <Button
            onClick={props.onAddQuickListing}
            color="primary"
            variant="outlined"
            size="small"
            startIcon={<AddRounded />}
            sx={{ flex: "0 0 auto" }}
          >
            {t("ItemStock.addQuickListing")}
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Toolbar sx={{ justifyContent: "flex-end" }}>
      <Stack direction="row" spacing="1px">
        <ManageStockArea listings={props.listings} />
        <LoadingButton
          color={"success"}
          startIcon={<RadioButtonCheckedRounded />}
          variant={"outlined"}
          size={"small"}
          loading={isLoading}
          onClick={() => {
            updateListingCallback({ status: "active" })
          }}
        >
          {t("ItemStock.activate")}
        </LoadingButton>
        <LoadingButton
          color={"error"}
          startIcon={<RadioButtonUncheckedRounded />}
          variant={"outlined"}
          size={"small"}
          loading={isLoading}
          onClick={() => {
            updateListingCallback({ status: "inactive" })
          }}
        >
          {t("ItemStock.deactivate")}
        </LoadingButton>
        <Tooltip title={t("ItemStock.addQuickListing")}>
          <IconButton
            onClick={() => {
              const id = `new-${Date.now()}`
              const newRow: NewListingRow = {
                id,
                item_type: "Other",
                item_name: null,
                price: 1,
                quantity_available: 1,
                status: "active",
                isNew: true,
              }

              props.setNewRows((prev) => [...prev, newRow])
              props.setRowModesModel((oldModel) => ({
                ...oldModel,
                [id]: { mode: GridRowModes.Edit, fieldToFocus: "item_type" },
              }))
            }}
            color="primary"
          >
            <AddRounded />
          </IconButton>
        </Tooltip>
      </Stack>
    </Toolbar>
  )
}
