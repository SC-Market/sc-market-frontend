import React, { useContext, useCallback } from "react"
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
  Avatar,
  Box,
  useMediaQuery,
} from "@mui/material"
import {
  AddRounded,
  RemoveRounded,
  VisibilityRounded,
  InventoryRounded,
  ShareRounded,
  RefreshOutlined,
  RadioButtonCheckedRounded,
  CreateRounded,
} from "@mui/icons-material"
import { GridRowId, GridRowModes, GridRowModesModel } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { formatCompleteListingUrl } from "../../../../util/urls"
import { formatMostSignificantDiff } from "../../../../util/time"
import { LongPressMenu, useLongPress } from "../../../../components/gestures"
import { StockRow, NewListingRow } from "../types"
import { ItemStockContext } from "./ManageStockArea"

interface StockCardProps {
  row: StockRow & { id: string }
  isSelected: boolean
  newRows: NewListingRow[]
  editingRows: Record<string, Partial<NewListingRow>>
  rowModesModel: GridRowModesModel
  setEditingRows: React.Dispatch<
    React.SetStateAction<Record<string, Partial<NewListingRow>>>
  >
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
  setFetchingItemName: (name: string) => void
  handleEditClick: (id: GridRowId) => () => void
  handleSaveClick: (id: GridRowId) => () => Promise<void>
  handleCancelClick: (id: GridRowId) => () => void
  handleUpdateQuantity: (
    listingId: string,
    newQuantity: number,
  ) => Promise<void>
}

export const StockCard = React.memo<StockCardProps>(
  ({
    row,
    isSelected,
    newRows,
    editingRows,
    rowModesModel,
    setEditingRows,
    setRowModesModel,
    setFetchingItemName,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleUpdateQuantity,
  }) => {
    const { t } = useTranslation()
    const theme = useTheme<ExtendedTheme>()
    const stockContext = useContext(ItemStockContext)

    if (!stockContext || !Array.isArray(stockContext)) {
      return null
    }
    const [selectionModel, setSelectionModel] = stockContext

    const isNewRow = row.id.startsWith("new-")
    const newRowData = isNewRow ? newRows.find((r) => r.id === row.id) : null
    const hasSelectedItems = selectionModel.ids.size > 0
    const isInSelectionMode = hasSelectedItems

    const handleLongPressForSelection = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (isNewRow) return
        event.preventDefault()
        const newIds = new Set(selectionModel.ids)
        if (newIds.has(row.id)) {
          newIds.delete(row.id)
        } else {
          newIds.add(row.id)
        }
        setSelectionModel({ type: "include", ids: newIds })
      },
      [selectionModel, row.id, setSelectionModel, isNewRow],
    )

    const handleTapForSelection = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (isNewRow || !isInSelectionMode) return
        event.preventDefault()
        event.stopPropagation()
        const newIds = new Set(selectionModel.ids)
        if (newIds.has(row.id)) {
          newIds.delete(row.id)
        } else {
          newIds.add(row.id)
        }
        setSelectionModel({ type: "include", ids: newIds })
      },
      [selectionModel, row.id, setSelectionModel, isNewRow, isInSelectionMode],
    )

    const longPressHandlers = useLongPress({
      onLongPress: handleLongPressForSelection,
      onClick: handleTapForSelection,
      enabled: !isNewRow,
      delay: 500,
    })

    const longPressActions = [
      {
        label: t("common.viewDetails", "View Details"),
        icon: <VisibilityRounded />,
        onClick: () => {
          window.location.href = formatCompleteListingUrl({
            type: "unique",
            details: { title: row.title },
            listing: row,
          })
        },
      },
      {
        label: t("ItemStock.manageStock", "Manage Stock"),
        icon: <InventoryRounded />,
        onClick: () => {
          window.location.href = `/market/stock/${row.listing_id}`
        },
      },
      {
        label: t("ItemStock.share", "Share"),
        icon: <ShareRounded />,
        onClick: () => {
          navigator.clipboard.writeText(
            window.location.origin +
              formatCompleteListingUrl({
                type: "unique",
                details: { title: row.title },
                listing: row,
              }),
          )
        },
      },
      {
        label: t("ItemStock.refresh", "Refresh"),
        icon: <RefreshOutlined />,
        onClick: async () => {
          // Refresh logic would go here
        },
      },
    ]

    // New row rendering
    if (isNewRow) {
      const isInEditMode = rowModesModel[row.id]?.mode === GridRowModes.Edit
      const editingRow = editingRows[row.id]

      if (isInEditMode && editingRow) {
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("ItemStock.newListing", "New Listing")}
              </Typography>
              {/* Edit form would go here - simplified for now */}
              <Typography variant="body2">
                {t("ItemStock.editingNewListing", "Editing new listing...")}
              </Typography>
            </CardContent>
          </Card>
        )
      }

      return (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2">
              {newRowData?.item_name || t("ItemStock.noItemSelected")}
            </Typography>
          </CardContent>
        </Card>
      )
    }

    // Existing row rendering
    return (
      <LongPressMenu actions={longPressActions}>
        <Card
          sx={{
            mb: 2,
            border: isSelected ? 2 : 0,
            borderColor: isSelected ? "primary.main" : "transparent",
          }}
        >
          <CardActionArea
            {...longPressHandlers}
            component={isInSelectionMode ? "div" : Link}
            to={
              isInSelectionMode
                ? undefined
                : formatCompleteListingUrl({
                    type: "unique",
                    details: { title: row.title },
                    listing: row,
                  })
            }
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ p: 2 }}
              alignItems="center"
            >
              <Avatar
                src={row.image_url}
                variant="rounded"
                sx={{ width: 56, height: 56 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {row.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.price.toLocaleString()} aUEC
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1 }}
                  flexWrap="wrap"
                >
                  <Chip
                    label={`${t("ItemStock.quantity")}: ${row.quantity_available.toLocaleString()}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={
                      row.status === "active"
                        ? t("ItemStock.active")
                        : t("ItemStock.inactive")
                    }
                    color={row.status === "active" ? "success" : "error"}
                    size="small"
                  />
                  {row.order_count > 0 && (
                    <Chip
                      label={`${row.order_count} ${t("ItemStock.offersAccepted")}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
              {isSelected && <RadioButtonCheckedRounded color="primary" />}
            </Stack>
          </CardActionArea>

          {!isInSelectionMode && (
            <Stack direction="column" spacing={0.5}>
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpdateQuantity(row.id, row.quantity_available + 1)
                }}
                sx={{ minWidth: 40 }}
              >
                <AddRounded fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="warning"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpdateQuantity(
                    row.id,
                    Math.max(0, row.quantity_available - 1),
                  )
                }}
                sx={{ minWidth: 40 }}
              >
                <RemoveRounded fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Card>
      </LongPressMenu>
    )
  },
)

StockCard.displayName = "StockCard"
