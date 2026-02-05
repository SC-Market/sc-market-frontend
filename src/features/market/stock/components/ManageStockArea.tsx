import React, { useCallback, useContext, useState } from "react"
import { Button, ButtonGroup, TextField } from "@mui/material"
import { AddRounded, RemoveRounded } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { GridRowSelectionModel } from "@mui/x-data-grid"
import { UniqueListing } from "../../domain/types"
import { useUpdateListingQuantityMutation } from "../../api/marketApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

export const ItemStockContext = React.createContext<
  | [
      GridRowSelectionModel,
      React.Dispatch<React.SetStateAction<GridRowSelectionModel>>,
    ]
  | null
>(null)

export function ManageStockArea(props: { listings: UniqueListing[] }) {
  const context = useContext(ItemStockContext)
  if (!context || !Array.isArray(context)) {
    return null
  }
  const [selectionModel] = context
  const [quantity, setQuantity] = useState(1)
  const { listings } = props

  const [updateListing] = useUpdateListingQuantityMutation()
  const issueAlert = useAlertHook()
  const { t } = useTranslation()

  const updateListingCallback = useCallback(
    async (listing_id: string, body: { quantity_available: number }) => {
      updateListing({
        listing_id: listing_id,
        quantity: body.quantity_available,
      })
        .unwrap()
        .then(() =>
          issueAlert({
            message: t("ItemStock.updated"),
            severity: "success",
          }),
        )
        .catch((err) => issueAlert(err))
    },
    [selectionModel, issueAlert, updateListing, t],
  )

  return (
    <>
      <NumericFormat
        decimalScale={0}
        allowNegative={false}
        customInput={TextField}
        thousandSeparator
        onValueChange={async (values) => {
          setQuantity(values.floatValue || 0)
        }}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*",
          type: "numeric",
          size: "small",
        }}
        sx={{
          minWidth: 200,
        }}
        size="small"
        label={t("ItemStock.updateAmount")}
        value={quantity}
        color={"secondary"}
      />

      <ButtonGroup size={"small"}>
        <Button
          variant={"contained"}
          onClick={() =>
            [...selectionModel.ids].map((listing_id) => {
              const listing = listings.find(
                (l) => l.listing.listing_id === listing_id,
              )
              if (listing) {
                updateListingCallback(listing_id.toString(), {
                  quantity_available:
                    listing.listing.quantity_available + quantity,
                })
              }
            })
          }
          color={"success"}
          startIcon={<AddRounded />}
        >
          {t("ItemStock.add")}
        </Button>

        <Button
          variant={"contained"}
          onClick={() =>
            [...selectionModel.ids].map((listing_id) =>
              updateListingCallback(listing_id.toString(), {
                quantity_available: 0,
              }),
            )
          }
          color={"warning"}
        >
          {t("ItemStock.zero")}
        </Button>
        <Button
          variant={"contained"}
          onClick={() =>
            [...selectionModel.ids].map((listing_id) => {
              const listing = listings.find(
                (l) => l.listing.listing_id === listing_id,
              )
              if (listing) {
                updateListingCallback(listing_id.toString(), {
                  quantity_available:
                    listing.listing.quantity_available - quantity,
                })
              }
            })
          }
          color={"error"}
          startIcon={<RemoveRounded />}
        >
          {t("ItemStock.sub")}
        </Button>
      </ButtonGroup>
    </>
  )
}
