/**
 * StockManagerV2: the shop's Listings page (/shop/:slug/listings, "Manage
 * Listings"). One row per listing, with quick edits of price, status and
 * quantity. Not the Stock page: the shop's stock lots are managed in
 * BulkStockManagementV2, your own lots across shops on My Stock
 * (pages/inventory). The name is from V1's ManageStock.
 */

import React, { useState, useCallback, useMemo, createContext, useContext, useEffect, useRef } from "react"
import {
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid"
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Link as MaterialLink,
  Paper,
  Stack,
  Switch,
  TablePagination,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useHydratedInitialState } from "../../../hooks/ssr/useHydratedInitialState"
import {
  AddRounded,
  ArchiveOutlined,
  CreateRounded,
  DeleteRounded,
  InventoryRounded,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
  RefreshOutlined,
  RemoveRounded,
  SaveRounded,
  ShareRounded,
  VisibilityRounded,
} from "@mui/icons-material"
import FilterListIcon from "@mui/icons-material/FilterList"
import LoadingButton from "@mui/lab/LoadingButton"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { NumericFormat } from "react-number-format"
import { RefreshCircle } from "mdi-material-ui"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { ThemedDataGrid } from "../../../components/grid/ThemedDataGrid"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { MarketSearchAreaV2 } from "./ListingSearchV2"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { LongPressMenu, useLongPress } from "../../../components/gestures"
import { EmptyListings } from "../../../components/empty-states"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetMyListingsQuery,
  useUpdateListingMutation,
  useRefreshListingMutation,
  useDeleteListingMutation,
  useCreateListingMutation,
  useUpdateStockLotMutation,
  marketV2Api,
  type MyListingItem,
} from "../../../store/api/v2/market"
import { MobileListingRow } from "./components/MobileListingRow"
import { formatMarketUrl } from "../domain/urls"
import { QuickEditListingSheet } from "./components/QuickEditListingSheet"
import { MARKET_PATHS, SHOP_PATHS } from "../../../routes/paths"
import { listingApiError } from "../domain/listingFormErrors"
import { withShopContext } from "../../../components/sidebar/shopContextState"
import { ShopManageAccessNotice } from "../../shops/components/ShopManageAccessNotice"
import { ImportFromUexDialog } from "./ImportFromUex"
import { canEditShopListings } from "../../shops/domain/shopPermissions"
import { FirstUseHint } from "../../help/components/FirstUseHint"
import { HelpTip } from "../../help/components/HelpTip"
import { DiscordUserInstallCta } from "../../discord-install/DiscordUserInstallCta"
import { selectOnFocus } from "../../../util/selectOnFocus"
import { useFormatters } from "../../../util/format"

/* ── Types ── */

interface NewListingRowV2 {
  id: string
  game_item_id: string | null
  game_item_name: string | null
  price: number
  quantity_available: number
  status: "active" | "inactive"
  isNew: boolean
}

/* ── Listing selection (bulk actions) ── */

const ListingSelectionContext = createContext<
  [GridRowSelectionModel, React.Dispatch<React.SetStateAction<GridRowSelectionModel>>] | null
>(null)

/** The selection state from StockManagerV2. Both consumers render inside its provider. */
function useListingSelection() {
  const ctx = useContext(ListingSelectionContext)
  if (!ctx) throw new Error("useListingSelection must be used inside ListingSelectionContext")
  return ctx
}

/* ── Toolbar props ── */

interface ListingsToolbarProps {
  listings: MyListingItem[]
  setNewRows: React.Dispatch<React.SetStateAction<NewListingRowV2[]>>
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
  isMobile: boolean
  onAddQuickListing?: () => void
  /** False for org members without manage_market: no bulk or create actions */
  canManage: boolean
}

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    listings: MyListingItem[]
    setNewRows: React.Dispatch<React.SetStateAction<NewListingRowV2[]>>
    setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
    isMobile: boolean
    onAddQuickListing?: () => void
    canManage: boolean
  }
}

/* ── Toolbar: bulk status/archive and quick add ── */

function ListingsToolbarV2(props: ListingsToolbarProps) {
  const {
    listings,
    setNewRows,
    setRowModesModel,
    isMobile,
    onAddQuickListing,
    canManage,
  } = props
  const [selectionModel] = useListingSelection()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const issueAlert = useAlertHook()
  const [updateListing] = useUpdateListingMutation()

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const selectedCount = selectionModel.ids.size
  const hasSelection = selectedCount > 0

  const handleBulkStatus = useCallback(
    async (status: "active" | "inactive") => {
      const ids = [...selectionModel.ids].map(String)
      if (ids.length === 0) return
      setBulkLoading(true)
      try {
        await Promise.all(
          ids.map((id) =>
            updateListing({ id, updateListingRequest: { status } }).unwrap(),
          ),
        )
        issueAlert({ message: t("ItemStock.updated"), severity: "success" })
      } catch (e) {
        issueAlert(e as Error)
      } finally {
        setBulkLoading(false)
      }
    },
    [selectionModel.ids, updateListing, issueAlert, t],
  )

  const handleConfirmBulkArchive = useCallback(async () => {
    const ids = [...selectionModel.ids].map(String)
    if (ids.length === 0) return
    setArchiving(true)
    try {
      await Promise.all(
        ids.map((id) =>
          updateListing({ id, updateListingRequest: { status: "cancelled" } }).unwrap(),
        ),
      )
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
  }, [selectionModel.ids, updateListing, issueAlert, t])

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
    <Dialog
      open={archiveDialogOpen}
      onClose={() => !archiving && setArchiveDialogOpen(false)}
    >
      <DialogTitle>{t("ItemStock.bulkArchiveTitle")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("ItemStock.bulkArchiveBody", { count: selectedCount })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setArchiveDialogOpen(false)} disabled={archiving} color="inherit">
          {t("ItemStock.bulkArchiveCancel")}
        </Button>
        <LoadingButton onClick={handleConfirmBulkArchive} loading={archiving} color="error" variant="contained">
          {t("ItemStock.bulkArchiveConfirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )

  if (!canManage) return <></>

  if (isMobile) {
    return (
      <>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <LoadingButton color="success" startIcon={<RadioButtonCheckedRounded />} variant="outlined" size="small" loading={bulkLoading} onClick={() => void handleBulkStatus("active")} fullWidth disabled={!hasSelection}>
              {t("ItemStock.activate")}
            </LoadingButton>
            <LoadingButton color="error" startIcon={<RadioButtonUncheckedRounded />} variant="outlined" size="small" loading={bulkLoading} onClick={() => void handleBulkStatus("inactive")} fullWidth disabled={!hasSelection}>
              {t("ItemStock.deactivate")}
            </LoadingButton>
            <LoadingButton color="warning" startIcon={<ArchiveOutlined />} variant="outlined" size="small" loading={bulkLoading} onClick={() => setArchiveDialogOpen(true)} fullWidth disabled={!hasSelection}>
              {t("ItemStock.archive")}
            </LoadingButton>
            <Button onClick={onAddQuickListing} color="primary" variant="outlined" size="small" startIcon={<AddRounded />} sx={{ flex: "0 0 auto" }}>
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
        <LoadingButton color="success" startIcon={<RadioButtonCheckedRounded />} variant="outlined" size="small" loading={bulkLoading} onClick={() => void handleBulkStatus("active")} disabled={!hasSelection}>
          {t("ItemStock.activate")}
        </LoadingButton>
        <LoadingButton color="error" startIcon={<RadioButtonUncheckedRounded />} variant="outlined" size="small" loading={bulkLoading} onClick={() => void handleBulkStatus("inactive")} disabled={!hasSelection}>
          {t("ItemStock.deactivate")}
        </LoadingButton>
        <LoadingButton color="warning" startIcon={<ArchiveOutlined />} variant="outlined" size="small" loading={bulkLoading} onClick={() => setArchiveDialogOpen(true)} disabled={!hasSelection}>
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


/* ── ShopListingsGridV2: the listings grid (cards on mobile) ── */

function ShopListingsGridV2({
  listings,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRefreshAll,
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
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const { shop } = useShopRouteContext()
  const issueAlert = useAlertHook()
  const [updateListing] = useUpdateListingMutation()
  const [refreshListing] = useRefreshListingMutation()
  const [deleteListing] = useDeleteListingMutation()
  const [createListing] = useCreateListingMutation()
  const [updateStockLot] = useUpdateStockLotMutation()
  const [fetchStockLots] = marketV2Api.endpoints.getStockLots.useLazyQuery()
  const canManage = canEditShopListings(shop)

  const [newRows, setNewRows] = useState<NewListingRowV2[]>([])
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [editingRows, setEditingRows] = useState<Record<string, Partial<NewListingRowV2>>>({})
  const [editTarget, setEditTarget] = useState<MyListingItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [selectionModel, setSelectionModel] = useListingSelection()

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleRefresh = useCallback(
    async (id: string) => {
      try {
        await refreshListing({ id }).unwrap()
        issueAlert({ message: t("ItemStock.refreshed", "Listing refreshed"), severity: "success" })
      } catch {
        issueAlert({ message: t("marketV2.refreshFailed"), severity: "error" })
      }
    },
    [refreshListing, issueAlert, t],
  )

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

  const handleSaveClick = (id: GridRowId) => async () => {
    const editing = editingRows[id as string]
    if (!editing) return

    const nr = newRows.find((r) => r.id === id)
    const existing = listings.find((l) => l.listing_id === id.toString())

    if (nr?.isNew) {
      if (!editing.game_item_id) {
        issueAlert({ message: t("ItemStock.selectItemError", "Select an item"), severity: "error" })
        return
      }
      try {
        await createListing({
          createListingRequest: {
            title: editing.game_item_name || "New Listing",
            game_item_id: editing.game_item_id,
            pricing_mode: "unified",
            base_price: editing.price || 1,
            lots: [{ quantity: editing.quantity_available || 1, variant_attributes: {} }],
            shop_id: shop.shop_id,
          },
        }).unwrap()
        issueAlert({ message: t("ItemStock.created"), severity: "success" })
        setNewRows((prev) => prev.filter((r) => r.id !== id))
      } catch (e) {
        issueAlert({ message: listingApiError(e, t("ItemStock.createError")).message, severity: "error" })
        return
      }
    } else if (existing) {
      try {
        const req: Record<string, string | number> = {}
        if (editing.status !== undefined && editing.status !== existing.status) req.status = editing.status
        if (editing.price !== undefined && editing.price !== existing.price_min) req.base_price = editing.price
        if (Object.keys(req).length > 0) {
          await updateListing({ id: existing.listing_id, updateListingRequest: req }).unwrap()
        }

        // Quantity change: apply the difference to the listing's newest listed
        // lot. The lookup is scoped to this shop: unscoped it only searched
        // your own shops, so an org shop's lots were never found and the edit
        // was silently dropped.
        if (
          editing.quantity_available !== undefined &&
          editing.quantity_available !== existing.quantity_available
        ) {
          const { lots } = await fetchStockLots({
            listingId: existing.listing_id,
            listed: true,
            pageSize: 1,
            shopId: shop.shop_id,
          }).unwrap()
          const firstLot = lots[0]
          const delta = editing.quantity_available - existing.quantity_available
          if (!firstLot || firstLot.quantity_total + delta < 0) {
            issueAlert({
              message: t(
                "ItemStock.quantityUseStockPage",
                "Change this listing's quantity per lot on the Stock page",
              ),
              severity: "error",
            })
            return
          }
          await updateStockLot({
            id: firstLot.lot_id,
            updateStockLotRequest: { quantity_total: firstLot.quantity_total + delta },
          }).unwrap()
        }

        issueAlert({ message: t("ItemStock.updated"), severity: "success" })
      } catch {
        issueAlert({ message: t("ItemStock.updateError", "Failed to update"), severity: "error" })
        return
      }
    }

    setEditingRows((prev) => {
      const copy = { ...prev }
      delete copy[id as string]
      return copy
    })
    setRowModesModel((old) => ({ ...old, [id]: { mode: GridRowModes.View } }))
  }

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "title",
        headerName: t("ItemStock.title"),
        flex: 1,
        // Room for the quick-add row's item search (it was 42 px wide)
        minWidth: 240,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr && rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <GameItemSearchAutocomplete
                required
                sx={{ width: "100%" }}
                label={t("ItemStock.item", "Item")}
                value={editing?.game_item_name ?? null}
                onChange={(name, _type, itemId) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: { ...prev[params.id as string], game_item_name: name, game_item_id: itemId },
                  }))
                }}
                size="small"
              />
            )
          }
          if (nr) return nr.game_item_name || t("ItemStock.noItemSelected")
          return (
            <Stack direction="row" spacing={theme.layoutSpacing.compact} alignItems="center">
              <MaterialLink
                component={Link}
                to={formatMarketUrl(params.row)}
                sx={{ fontWeight: "bold" }}
                underline="hover"
              >
                {params.row.title}
              </MaterialLink>
            </Stack>
          )
        },
      },
      {
        field: "price_min",
        headerName: t("ItemStock.price"),
        width: 150,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          if (rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={(v) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: { ...prev[params.id as string], price: v.floatValue || 1 },
                  }))
                }}
                size="small"
                onFocus={selectOnFocus}
                label={t("ItemStock.price")}
                value={editing?.price ?? params.row.price_min ?? 1}
              />
            )
          }
          const min = params.row.price_min
          const max = params.row.price_max
          if (min === max) return `${fmt.number(min)} aUEC`
          return `${fmt.number(min)}–${fmt.number(max)} aUEC`
        },
      },
      {
        field: "quantity_available",
        headerName: t("ItemStock.quantity"),
        width: 90,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          if (rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={(v) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: { ...prev[params.id as string], quantity_available: v.floatValue || 0 },
                  }))
                }}
                size="small"
                onFocus={selectOnFocus}
                label={t("ItemStock.qty")}
                value={editing?.quantity_available ?? params.value ?? 0}
              />
            )
          }
          return params.value?.toLocaleString?.() ?? "0"
        },
      },
      {
        field: "quality",
        headerName: t("ItemStock.quality", "Quality"),
        width: 100,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr) return "—"
          const min = params.row.quality_tier_min
          const max = params.row.quality_tier_max
          if (min == null) return <Typography variant="body2" color="text.disabled">—</Typography>
          const label = min === max ? `Tier ${min}` : `T${min}–${max}`
          return <Chip label={label} size="small" variant="outlined" color={min >= 4 ? "success" : min >= 3 ? "primary" : "default"} />
        },
      },
      {
        field: "variant_count",
        headerName: t("ItemStock.variants", "Variants"),
        width: 80,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr) return "—"
          return params.value ?? 0
        },
      },
      {
        field: "status",
        headerName: t("ItemStock.status"),
        width: 100,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr && rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <Switch
                inputProps={{ "aria-label": t("ItemStock.status") }}
                checked={(editing?.status ?? "active") === "active"}
                onChange={(e) => {
                  const newStatus: "active" | "inactive" = e.target.checked ? "active" : "inactive"
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id as string],
                      status: newStatus,
                    },
                  }))
                }}
              />
            )
          }
          return (
            <Typography
              color={params.value === "active" ? "success" : "error"}
              display="flex"
              alignItems="center"
              variant="subtitle2"
            >
              <RadioButtonCheckedRounded fontSize="small" style={{ marginRight: 1 }} />{" "}
              {params.value === "active"
                ? t("ItemStock.active")
                : params.value === "expired"
                  ? t("ItemStock.paused", "Paused")
                  : t("ItemStock.inactive")}
            </Typography>
          )
        },
      },
      {
        field: "expires_at",
        headerName: t("ItemStock.expiration"),
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <RefreshCircle aria-hidden />
            <HelpTip
              label={t("ItemStock.renewHelpLabel", "Renew")}
              title={t(
                "ItemStock.renewHelp",
                "Paused listings are hidden from buyers, for example after an auction ends with no bids. Click the renew button in this column to make a listing active again.",
              )}
            />
          </Box>
        ),
        width: 80,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr) return "—"
          const paused = params.row.status === "expired"
          if (!params.value && !paused) return "—"
          if (!canManage) return "—"
          // Renewable: paused (expired) or within the 3-day notice window.
          // Renew starts a new month and reactivates a paused listing.
          const msLeft = params.value ? new Date(params.value).getTime() - Date.now() : 0
          if (!paused && msLeft > RENEW_WINDOW_MS) return fmt.timeUntil(params.value, Date.now())
          // An active listing long past its date: a date migrated from V1
          // that nothing enforces (listing expiry is off), not renewable.
          if (!paused && msLeft < -RENEW_WINDOW_MS) return "—"
          const label = paused
            ? t("ItemStock.reactivateListing", "Paused: renew and reactivate")
            : t("ItemStock.renewListing", "Expires soon: renew for another month")
          return (
            <Tooltip title={label}>
              <IconButton
                aria-label={label}
                sx={{ color: paused || msLeft <= 0 ? "error.main" : "warning.main" }}
                onClick={(e) => { e.stopPropagation(); handleRefresh(params.row.listing_id) }}
              >
                <RefreshOutlined />
              </IconButton>
            </Tooltip>
          )
        },
      },
      {
        sortable: false,
        field: "listing_id",
        renderHeader: () => null,
        headerName: t("ItemStock.edit"),
        width: 90,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          const isEdit = rowModesModel[params.id]?.mode === GridRowModes.Edit

          if (nr) {
            if (isEdit) {
              const editing = editingRows[params.id as string]
              return (
                <Stack direction="row" spacing={theme.layoutSpacing.compact} justifyContent="flex-end" sx={{ width: "100%" }}>
                  <Tooltip title={t("ItemStock.save")}>
                    <IconButton size="small" onClick={handleSaveClick(params.id)} disabled={!editing?.game_item_id} color="primary">
                      <SaveRounded />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("ItemStock.discard")}>
                    <IconButton size="small" onClick={handleCancelClick(params.id)} color="error">
                      <DeleteRounded />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )
            }
            return (
              <Tooltip title={t("ItemStock.edit")}>
                <IconButton size="small" onClick={handleEditClick(params.id)} color="inherit">
                  <CreateRounded />
                </IconButton>
              </Tooltip>
            )
          }

          if (!canManage) return null
          return (
            <Tooltip title={t("ItemStock.editListing")}>
              <Link to={MARKET_PATHS.edit(params.value)} state={withShopContext(shop.slug)} style={{ color: "inherit" }}>
                <IconButton aria-label={t("ItemStock.editListing")}><CreateRounded /></IconButton>
              </Link>
            </Tooltip>
          )
        },
      },
    ],
    [t, fmt, theme, newRows, rowModesModel, editingRows, handleRefresh, handleEditClick, handleCancelClick, handleSaveClick, canManage, shop.slug],
  )

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
              { id, game_item_id: null, game_item_name: null, price: 1, quantity_available: 1, status: "active", isNew: true },
            ])
          }}
        />
        <Paper sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel), overflow: "hidden" }}>
          {allRows.length === 0 ? (
            <EmptyListings showCreateAction={false} />
          ) : (
            allRows.map((row) => (
              <MobileListingRow
                key={row.id}
                listing={row as MyListingItem}
                onEdit={canManage ? (l) => { setEditTarget(l); setSheetOpen(true) } : undefined}
              />
            ))
          )}
        </Paper>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[24, 48, 96]}
          labelRowsPerPage={t("common.rowsPerPage", "Rows per page")}
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
        initialState={{ sorting: { sortModel: [{ field: "title", sort: "asc" }] } }}
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
        onPaginationModelChange={(m) => { onPageChange(m.page); onPageSizeChange(m.pageSize) }}
        pageSizeOptions={[24, 48, 96]}
        loading={isLoading}
      />
    </Box>
  )
}

/** Listings can be renewed within this window before expiry (backend NOTICE_DAYS_BEFORE). */
const RENEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

/**
 * The "Still selling?" notice links here with ?renew=<id>,<id>: renew those
 * listings once (a new month; paused ones are reactivated), say so, and drop
 * the parameter.
 */
function RenewFromLink() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [searchParams, setSearchParams] = useSearchParams()
  const [refreshListing] = useRefreshListingMutation()
  const done = useRef(false)
  const ids = (searchParams.get("renew") || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/i.test(s))
    .slice(0, 50)

  useEffect(() => {
    if (done.current || !ids.length) return
    done.current = true
    void (async () => {
      const results = await Promise.allSettled(ids.map((id) => refreshListing({ id }).unwrap()))
      const ok = results.filter((r) => r.status === "fulfilled").length
      issueAlert(
        ok === ids.length
          ? {
              message: t("ItemStock.renewedFromLink", "Renewed {{count}} listings for another month", { count: ok }),
              severity: "success",
            }
          : {
              message: t("ItemStock.renewedFromLinkPartial", "Renewed {{ok}} of {{total}} listings. Renew the rest below.", {
                ok,
                total: ids.length,
              }),
              severity: "warning",
            },
      )
      const next = new URLSearchParams(searchParams)
      next.delete("renew")
      setSearchParams(next, { replace: true })
    })()
    // Runs once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

/* ── Main page component ── */

export function StockManagerV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const { shop } = useShopRouteContext()
  const [sidebarOpen, setSidebarOpen] = useHydratedInitialState(!isMobile)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(48)
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get("status") as "active" | "inactive" | "expired" | "cancelled" | null

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  })

  const { data, isLoading, refetch } = useGetMyListingsQuery({
    status: statusFilter || undefined,
    page: page + 1,
    pageSize,
    sortBy: "updated_at",
    sortOrder: "desc",
    shopId: shop.shop_id,
  })

  const listings = data?.listings ?? []
  const canManage = canEditShopListings(shop)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <StandardPageLayout
      title={t("sidebar.manage_listings")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: MARKET_PATHS.search },
        { label: t("sidebar.manage_listings", "Manage Listings") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
    >
      <ListingSelectionContext.Provider value={[selectionModel, setSelectionModel]}>
        <RenewFromLink />
        <Grid item xs={12}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            {/* Mobile bottom sheet sidebar */}
            {isMobile && (
              <BottomSheet
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title={t("market.filters", "Filters")}
                maxHeight="90vh"
              >
                <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
                  <MarketSearchAreaV2 manageMode />
                </Box>
              </BottomSheet>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {isMobile && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FilterListIcon />}
                    onClick={() => setSidebarOpen((p) => !p)}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    {t("market.filters", "Filters")}
                  </Button>
                )}
                <ManageListingsTabBar
                  title={t("sidebar.manage_listings", "Manage Listings")}
                  rightAction={
                    canManage ? (
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" color="secondary" onClick={() => setImportOpen(true)}>
                          {t("ItemStock.importFromUex", "Import from UEX")}
                        </Button>
                        <Link to={SHOP_PATHS.create(shop.slug)} style={{ textDecoration: "none" }}>
                          <Button variant="contained" color="secondary" startIcon={<AddRounded />} size="large">
                            {t("market.createListing", "Create Listing")}
                          </Button>
                        </Link>
                      </Stack>
                    ) : undefined
                  }
                />
              </Box>
            </Grid>

            {!canManage && (
              <Grid item xs={12}>
                <ShopManageAccessNotice />
              </Grid>
            )}

            {canManage && (
              <Grid item xs={12} sx={{ "&:empty": { display: "none" } }}>
                <FirstUseHint hint="listingQuantity" title={t("hints.listingQuantity.title")}>
                  {t("hints.listingQuantity.body")}
                </FirstUseHint>
              </Grid>
            )}

            {canManage && (
              <Grid item xs={12} sx={{ "&:empty": { display: "none" } }}>
                <DiscordUserInstallCta src="shop_hint" variant="hint" />
              </Grid>
            )}

            {/* Desktop sidebar */}
            {!isMobile && (
              <Grid item xs={12} md={3}>
                <Paper><MarketSearchAreaV2 manageMode /></Paper>
              </Grid>
            )}

            {/* Content area */}
            <Grid item xs={12} md={isMobile ? 12 : 9}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Grid item xs={12}>
                  <ShopListingsGridV2
                    listings={listings}
                    total={data?.total ?? 0}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onRefreshAll={() => { refetch() }}
                    isLoading={isLoading}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Archived listings link */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Link to={MARKET_PATHS.myListings} style={{ color: "inherit" }}>
                <UnderlineLink>{t("sidebar.archived_listings")}</UnderlineLink>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </ListingSelectionContext.Provider>
      {canManage && (
        <ImportFromUexDialog shopId={shop.shop_id} open={importOpen} onClose={() => setImportOpen(false)} />
      )}
    </StandardPageLayout>
  )
}
