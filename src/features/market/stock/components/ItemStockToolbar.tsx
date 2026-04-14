import React, { useCallback, useContext, useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from "@mui/material"
import {
  AddRounded,
  ArchiveOutlined,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { GridRowModes, GridRowModesModel } from "@mui/x-data-grid"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { UniqueListing } from "../../domain/types"
import { useBatchUpdateMarketListingsMutation } from "../../api/marketApi"
import { NewListingRow } from "../types"
import { ManageStockArea, ItemStockContext } from "./ManageStockArea"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

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
  const issueAlert = useAlertHook()

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [batchUpdateListings, { isLoading }] =
    useBatchUpdateMarketListingsMutation()

  const selectedCount = selectionModel.ids.size
  const hasSelection = selectedCount > 0

  const listingIdsFromSelection = useCallback(
    () => [...selectionModel.ids].map((id) => id.toString()),
    [selectionModel.ids],
  )

  const handleBulkStatus = useCallback(
    async (status: "active" | "inactive") => {
      const listing_ids = listingIdsFromSelection()
      if (listing_ids.length === 0) return
      try {
        await batchUpdateListings({ listing_ids, status }).unwrap()
      } catch (e) {
        issueAlert(e as Error)
      }
    },
    [batchUpdateListings, listingIdsFromSelection, issueAlert],
  )

  const handleConfirmBulkArchive = useCallback(async () => {
    const ids = [...selectionModel.ids]
    if (ids.length === 0) return
    setArchiving(true)
    try {
      await batchUpdateListings({
        listing_ids: ids.map((id) => String(id)),
        status: "archived",
      }).unwrap()
      setArchiveDialogOpen(false)
      issueAlert({
        message: t("ItemStock.bulkArchivedSuccess", { count: ids.length }),
        severity: "success",
      })
    } catch (e) {
      issueAlert(e as Error)
    } finally {
      setArchiving(false)
    }
  }, [selectionModel.ids, batchUpdateListings, issueAlert, t])

  const archiveDialog = (
    <Dialog
      open={archiveDialogOpen}
      onClose={() => !archiving && setArchiveDialogOpen(false)}
      aria-labelledby="bulk-archive-title"
    >
      <DialogTitle id="bulk-archive-title">
        {t("ItemStock.bulkArchiveTitle")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("ItemStock.bulkArchiveBody", { count: selectedCount })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setArchiveDialogOpen(false)}
          disabled={archiving}
          color="inherit"
        >
          {t("ItemStock.bulkArchiveCancel")}
        </Button>
        <LoadingButton
          onClick={handleConfirmBulkArchive}
          loading={archiving}
          color="error"
          variant="contained"
        >
          {t("ItemStock.bulkArchiveConfirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )

  if (isMobile) {
    return (
      <>
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
              onClick={() => void handleBulkStatus("active")}
              fullWidth
              disabled={!hasSelection}
            >
              {t("ItemStock.activate")}
            </LoadingButton>
          <LoadingButton
            color={"error"}
            startIcon={<RadioButtonUncheckedRounded />}
            variant={"outlined"}
            size={"small"}
            loading={isLoading}
            onClick={() => void handleBulkStatus("inactive")}
            fullWidth
            disabled={!hasSelection}
          >
            {t("ItemStock.deactivate")}
          </LoadingButton>
          <LoadingButton
            color="warning"
            startIcon={<ArchiveOutlined />}
            variant="outlined"
            size="small"
            loading={isLoading}
            onClick={() => setArchiveDialogOpen(true)}
            fullWidth
            disabled={!hasSelection}
          >
            {t("ItemStock.archive")}
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
        {archiveDialog}
      </>
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
          onClick={() => void handleBulkStatus("active")}
          disabled={!hasSelection}
        >
          {t("ItemStock.activate")}
        </LoadingButton>
        <LoadingButton
          color={"error"}
          startIcon={<RadioButtonUncheckedRounded />}
          variant={"outlined"}
          size={"small"}
          loading={isLoading}
          onClick={() => void handleBulkStatus("inactive")}
          disabled={!hasSelection}
        >
          {t("ItemStock.deactivate")}
        </LoadingButton>
        <LoadingButton
          color="warning"
          startIcon={<ArchiveOutlined />}
          variant="outlined"
          size="small"
          loading={isLoading}
          onClick={() => setArchiveDialogOpen(true)}
          disabled={!hasSelection}
        >
          {t("ItemStock.archive")}
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
      {archiveDialog}
    </Toolbar>
  )
}
