import { useState, useCallback, useMemo } from "react"
import {
  GridEventListener,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid"
import { Box, Paper } from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { ThemedDataGrid } from "../../../components/grid/ThemedDataGrid"
import { NumberedPagination } from "../../../components/pagination/NumberedPagination"
import { EmptyListings } from "../../../components/empty-states"
import { type MyListingItem } from "../../../store/api/v2/market"
import {
  useRefreshListing,
  useSaveStockRow,
} from "../hooks/useStockListingActions"
import { MobileListingRow } from "./components/MobileListingRow"
import { QuickEditListingSheet } from "./components/QuickEditListingSheet"
import { canEditShopListings } from "../../shops/domain/shopPermissions"
import {
  useListingSelection,
  NewListingRowV2,
  STOCK_PAGE_SIZE_OPTIONS,
} from "./stockListingSelection"
import { ListingsToolbarV2 } from "./ShopListingsToolbarV2"
import { useShopListingsColumns } from "./useShopListingsColumns"

/* ── ShopListingsGridV2: the listings grid (cards on mobile) ── */

export function ShopListingsGridV2({
  listings,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: {
  listings: MyListingItem[]
  total: number
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (ps: number) => void
  onRefreshAll: () => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const { shop } = useShopRouteContext()
  const handleRefresh = useRefreshListing()
  const { createRow, saveRow } = useSaveStockRow(shop.shop_id)
  const canManage = canEditShopListings(shop)

  const [newRows, setNewRows] = useState<NewListingRowV2[]>([])
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [editingRows, setEditingRows] = useState<
    Record<string, Partial<NewListingRowV2>>
  >({})
  const [editTarget, setEditTarget] = useState<MyListingItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [selectionModel, setSelectionModel] = useListingSelection()

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = useCallback(
    (id: GridRowId) => () => {
      const nr = newRows.find((r) => r.id === id)
      if (nr) {
        setEditingRows((prev) => ({ ...prev, [id]: { ...nr } }))
      } else {
        const existing = listings.find((l) => l.listing_id === id.toString())
        if (existing) {
          setEditingRows((prev) => ({
            ...prev,
            [id]: {
              status: existing.status as "active" | "inactive",
              price: existing.price_min,
              quantity_available: existing.quantity_available,
            },
          }))
        }
      }
      setRowModesModel((old) => ({ ...old, [id]: { mode: GridRowModes.Edit } }))
    },
    [newRows, listings],
  )

  const handleCancelClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel((old) => ({
        ...old,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      }))
      const nr = newRows.find((r) => r.id === id)
      if (nr?.isNew) setNewRows((prev) => prev.filter((r) => r.id !== id))
      setEditingRows((prev) => {
        const copy = { ...prev }
        delete copy[id as string]
        return copy
      })
    },
    [newRows],
  )

  const handleSaveClick = useCallback(
    (id: GridRowId) => async () => {
      const editing = editingRows[id as string]
      if (!editing) return

      const nr = newRows.find((r) => r.id === id)
      const existing = listings.find((l) => l.listing_id === id.toString())

      if (nr?.isNew) {
        if (!(await createRow(editing))) return
        setNewRows((prev) => prev.filter((r) => r.id !== id))
      } else if (existing) {
        if (!(await saveRow(existing, editing))) return
      }

      setEditingRows((prev) => {
        const copy = { ...prev }
        delete copy[id as string]
        return copy
      })
      setRowModesModel((old) => ({ ...old, [id]: { mode: GridRowModes.View } }))
    },
    [editingRows, newRows, listings, createRow, saveRow],
  )

  const columns = useShopListingsColumns({
    newRows,
    rowModesModel,
    editingRows,
    setEditingRows,
    handleRefresh,
    handleEditClick,
    handleCancelClick,
    handleSaveClick,
    canManage,
    shopSlug: shop.slug,
  })

  // Combine existing + new rows
  const allRows = useMemo(() => {
    const existing = listings.map((l) => ({ ...l, id: l.listing_id }))
    const newMapped = newRows.map((r) => ({
      id: r.id,
      listing_id: r.id,
      title: r.game_item_name || t("ItemStock.noItemSelected"),
      status: r.status,
      created_at: "",
      updated_at: "",
      variant_count: 0,
      quantity_available: r.quantity_available,
      price_min: r.price,
      price_max: r.price,
    }))
    return [...existing, ...newMapped]
  }, [listings, newRows, t])

  // ── Mobile rendering ──
  if (isMobile) {
    return (
      <Box sx={{ width: "100%" }}>
        <ListingsToolbarV2
          listings={listings}
          setNewRows={setNewRows}
          setRowModesModel={setRowModesModel}
          isMobile={true}
          canManage={canManage}
          onAddQuickListing={() => {
            const id = `new-${Date.now()}`
            setNewRows((prev) => [
              ...prev,
              {
                id,
                game_item_id: null,
                game_item_name: null,
                price: 1,
                quantity_available: 1,
                status: "active",
                isNew: true,
              },
            ])
          }}
        />
        <Paper
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            overflow: "hidden",
          }}
        >
          {allRows.length === 0 ? (
            <EmptyListings showCreateAction={false} />
          ) : (
            allRows.map((row) => (
              <MobileListingRow
                key={row.id}
                listing={row as MyListingItem}
                onEdit={
                  canManage
                    ? (l) => {
                        setEditTarget(l)
                        setSheetOpen(true)
                      }
                    : undefined
                }
              />
            ))
          )}
        </Paper>
        <NumberedPagination
          count={total}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(size) => {
            onPageSizeChange(size)
            onPageChange(0)
          }}
          rowsPerPageOptions={STOCK_PAGE_SIZE_OPTIONS}
        />
        <QuickEditListingSheet
          listing={editTarget}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      </Box>
    )
  }

  // ── Desktop rendering ──
  return (
    <Box sx={{ width: "100%" }}>
      <ThemedDataGrid
        rows={allRows}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        checkboxSelection={canManage}
        onRowSelectionModelChange={setSelectionModel}
        rowSelectionModel={selectionModel}
        onRowEditStop={handleRowEditStop}
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        initialState={{
          sorting: { sortModel: [{ field: "title", sort: "asc" }] },
        }}
        slots={{
          toolbar: ListingsToolbarV2,
        }}
        slotProps={{
          toolbar: {
            listings,
            setNewRows,
            setRowModesModel,
            isMobile: false,
            canManage,
          },
        }}
        showToolbar
        paginationMode="server"
        rowCount={total}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m) => {
          onPageChange(m.page)
          onPageSizeChange(m.pageSize)
        }}
        pageSizeOptions={[...STOCK_PAGE_SIZE_OPTIONS]}
        loading={isLoading}
      />
    </Box>
  )
}
