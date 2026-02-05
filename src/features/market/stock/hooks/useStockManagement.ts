import { useState, useCallback, useMemo } from "react"
import { GridRowModesModel, GridRowId, GridRowModes } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import {
  useMarketRefreshListingMutation,
  useUpdateListingQuantityMutation,
  useCreateMarketListingMutation,
  useUpdateMarketListingMutation,
  useMarketGetGameItemByNameQuery,
} from "../../api/marketApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { UniqueListing } from "../../domain/types"
import { StockRow, NewListingRow } from "../types"

export function useStockManagement(
  listings: UniqueListing[],
  onRefresh?: () => Promise<void>,
) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [currentOrg] = useCurrentOrg()

  // API hooks
  const [refresh] = useMarketRefreshListingMutation()
  const [updateQuantity] = useUpdateListingQuantityMutation()
  const [createListing] = useCreateMarketListingMutation()
  const [updateListing] = useUpdateMarketListingMutation()

  // State
  const [newRows, setNewRows] = useState<NewListingRow[]>([])
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [editingRows, setEditingRows] = useState<
    Record<string, Partial<NewListingRow>>
  >({})
  const [fetchingItemName, setFetchingItemName] = useState<string>("")

  // Fetch item details
  const { data: gameItem } = useMarketGetGameItemByNameQuery(fetchingItemName, {
    skip: !fetchingItemName,
  })

  // Transform listings to rows
  const rows: StockRow[] = useMemo(
    () =>
      listings.map((listing) => ({
        ...listing.details,
        ...listing.listing,
        ...(listing.stats || {
          offer_count: 0,
          order_count: 0,
          view_count: 0,
        }),
        image_url: listing.photos[0],
      })),
    [listings],
  )

  // Update quantity handler
  const handleUpdateQuantity = useCallback(
    async (listingId: string, newQuantity: number) => {
      try {
        await updateQuantity({
          listing_id: listingId,
          quantity: newQuantity,
        }).unwrap()
        issueAlert({
          message: t("ItemStock.updated"),
          severity: "success",
        })
        if (onRefresh) {
          await onRefresh()
        }
      } catch (error) {
        issueAlert(error as any)
      }
    },
    [updateQuantity, issueAlert, t, onRefresh],
  )

  // Edit mode handlers
  const handleEditClick = useCallback(
    (id: GridRowId) => () => {
      const currentRow = newRows.find((row) => row.id === id)
      if (currentRow) {
        setEditingRows((prev) => ({
          ...prev,
          [id]: { ...currentRow },
        }))
      }
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
    },
    [newRows, rowModesModel],
  )

  const handleCancelClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      })

      const editedRow = newRows.find((row) => row.id === id)
      if (editedRow?.isNew) {
        setNewRows(newRows.filter((row) => row.id !== id))
      }
      setEditingRows((prev) => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    },
    [newRows, rowModesModel],
  )

  return {
    // State
    rows,
    newRows,
    setNewRows,
    rowModesModel,
    setRowModesModel,
    editingRows,
    setEditingRows,
    fetchingItemName,
    setFetchingItemName,
    gameItem,
    currentOrg,
    // API mutations
    refresh,
    createListing,
    updateListing,
    // Handlers
    handleUpdateQuantity,
    handleEditClick,
    handleCancelClick,
    // Utils
    issueAlert,
    t,
  }
}
