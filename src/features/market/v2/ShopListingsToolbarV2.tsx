import {
  AddRounded,
  ArchiveRounded,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box, Button, IconButton, Stack, Toolbar, Tooltip } from "@mui/material"
import { GridRowModes, GridRowModesModel } from "@mui/x-data-grid"
import React, { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { ConfirmDialog } from "../../../components/dialog/ConfirmDialog"
import { type MyListingItem } from "../../../store/api/v2/market"
import { useBulkListingStatus } from "../hooks/useStockListingActions"
import { NewListingRowV2, useListingSelection } from "./stockListingSelection"

/* ── Toolbar props ── */

export interface ListingsToolbarProps {
  listings: MyListingItem[]
  setNewRows: React.Dispatch<React.SetStateAction<NewListingRowV2[]>>
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
  isMobile: boolean
  onAddQuickListing?: () => void
  /** False for org members without manage_market: no bulk or create actions */
  canManage: boolean
}

/* ── Toolbar: bulk status/archive and quick add ── */

export function ListingsToolbarV2(props: ListingsToolbarProps) {
  const {
    setNewRows,
    setRowModesModel,
    isMobile,
    onAddQuickListing,
    canManage,
  } = props
  const [selectionModel] = useListingSelection()
  const { t } = useTranslation()
  const bulkStatus = useBulkListingStatus()

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const bulkLoading = bulkStatus.isUpdating && !archiving

  const selectedCount = selectionModel.ids.size
  const hasSelection = selectedCount > 0

  const { setStatus, archive } = bulkStatus
  const handleBulkStatus = useCallback(
    (status: "active" | "inactive") =>
      setStatus([...selectionModel.ids].map(String), status),
    [selectionModel.ids, setStatus],
  )

  const handleConfirmBulkArchive = useCallback(async () => {
    const ids = [...selectionModel.ids].map(String)
    if (ids.length === 0) return
    setArchiving(true)
    if (await archive(ids)) setArchiveDialogOpen(false)
    setArchiving(false)
  }, [selectionModel.ids, archive])

  const handleAddNewRow = () => {
    const id = `new-${Date.now()}`
    const newRow: NewListingRowV2 = {
      id,
      game_item_id: null,
      game_item_name: null,
      price: 1,
      quantity_available: 1,
      status: "active",
      isNew: true,
    }
    setNewRows((prev) => [...prev, newRow])
    setRowModesModel((old) => ({
      ...old,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "title" },
    }))
  }

  const archiveDialog = (
    <ConfirmDialog
      open={archiveDialogOpen}
      onClose={() => setArchiveDialogOpen(false)}
      onConfirm={handleConfirmBulkArchive}
      title={t("ItemStock.bulkArchiveTitle")}
      message={t("ItemStock.bulkArchiveBody", { count: selectedCount })}
      cancelLabel={t("ItemStock.bulkArchiveCancel")}
      confirmLabel={t("ItemStock.bulkArchiveConfirm")}
      destructive
      loading={archiving}
    />
  )

  if (!canManage) return <></>

  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <LoadingButton
              color="success"
              startIcon={<RadioButtonCheckedRounded />}
              variant="outlined"
              size="small"
              loading={bulkLoading}
              onClick={() => void handleBulkStatus("active")}
              fullWidth
              disabled={!hasSelection}
            >
              {t("ItemStock.activate")}
            </LoadingButton>
            <LoadingButton
              color="error"
              startIcon={<RadioButtonUncheckedRounded />}
              variant="outlined"
              size="small"
              loading={bulkLoading}
              onClick={() => void handleBulkStatus("inactive")}
              fullWidth
              disabled={!hasSelection}
            >
              {t("ItemStock.deactivate")}
            </LoadingButton>
            <LoadingButton
              color="warning"
              startIcon={<ArchiveRounded />}
              variant="outlined"
              size="small"
              loading={bulkLoading}
              onClick={() => setArchiveDialogOpen(true)}
              fullWidth
              disabled={!hasSelection}
            >
              {t("ItemStock.archive")}
            </LoadingButton>
            <Button
              onClick={onAddQuickListing}
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
        <LoadingButton
          color="success"
          startIcon={<RadioButtonCheckedRounded />}
          variant="outlined"
          size="small"
          loading={bulkLoading}
          onClick={() => void handleBulkStatus("active")}
          disabled={!hasSelection}
        >
          {t("ItemStock.activate")}
        </LoadingButton>
        <LoadingButton
          color="error"
          startIcon={<RadioButtonUncheckedRounded />}
          variant="outlined"
          size="small"
          loading={bulkLoading}
          onClick={() => void handleBulkStatus("inactive")}
          disabled={!hasSelection}
        >
          {t("ItemStock.deactivate")}
        </LoadingButton>
        <LoadingButton
          color="warning"
          startIcon={<ArchiveRounded />}
          variant="outlined"
          size="small"
          loading={bulkLoading}
          onClick={() => setArchiveDialogOpen(true)}
          disabled={!hasSelection}
        >
          {t("ItemStock.archive")}
        </LoadingButton>
        <Tooltip title={t("ItemStock.addQuickListing")}>
          <IconButton onClick={handleAddNewRow} color="primary">
            <AddRounded />
          </IconButton>
        </Tooltip>
      </Stack>
      {archiveDialog}
    </Toolbar>
  )
}
