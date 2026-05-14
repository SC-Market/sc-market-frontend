/**
 * StockManagerV2 — V2 equivalent of V1 ManageStock / DisplayStock with full feature parity.
 */

import React, { useState, useCallback, useMemo, createContext, useContext } from "react"
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
  useMediaQuery,
} from "@mui/material"
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
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { ThemedDataGrid } from "../../../components/grid/ThemedDataGrid"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { MarketSearchAreaV2 } from "./ListingSearchV2"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { PullToRefresh, LongPressMenu, useLongPress } from "../../../components/gestures"
import { EmptyListings } from "../../../components/empty-states"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { formatMostSignificantDiff } from "../../../util/time"
import {
  useGetMyListingsQuery,
  useUpdateListingMutation,
  useRefreshListingMutation,
  useDeleteListingMutation,
  useCreateListingMutation,
  type MyListingItem,
} from "../../../store/api/v2/market"

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

/* ── Selection context (mirrors V1 ItemStockContext) ── */

const StockSelectionContext = createContext<
  [GridRowSelectionModel, React.Dispatch<React.SetStateAction<GridRowSelectionModel>>] | null
>(null)

/* ── Toolbar props ── */

interface StockToolbarProps {
  listings: MyListingItem[]
  setNewRows: React.Dispatch<React.SetStateAction<NewListingRowV2[]>>
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
  isMobile: boolean
  onAddQuickListing?: () => void
}

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    listings: MyListingItem[]
    setNewRows: React.Dispatch<React.SetStateAction<NewListingRowV2[]>>
    setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
    isMobile: boolean
    onAddQuickListing?: () => void
  }
}

/* ── Toolbar (mirrors V1 ItemStockToolbar) ── */

function StockToolbarV2(props: StockToolbarProps) {
  const {
    listings,
    setNewRows,
    setRowModesModel,
    isMobile,
    onAddQuickListing,
  } = props
  const ctx = useContext(StockSelectionContext)
  if (!ctx) return <></>
  const [selectionModel] = ctx
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

/* ── Mobile Stock Card (mirrors V1 StockCard) ── */

const StockCardV2 = React.memo<{
  row: MyListingItem & { id: string }
  isSelected: boolean
  onRefresh: (id: string) => void
}>(({ row, isSelected, onRefresh }) => {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const ctx = useContext(StockSelectionContext)
  if (!ctx) return null
  const [selectionModel, setSelectionModel] = ctx

  const isInSelectionMode = selectionModel.ids.size > 0

  const handleLongPressForSelection = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault()
      const newIds = new Set(selectionModel.ids)
      if (newIds.has(row.id)) newIds.delete(row.id)
      else newIds.add(row.id)
      setSelectionModel({ type: "include", ids: newIds })
    },
    [selectionModel, row.id, setSelectionModel],
  )

  const handleTapForSelection = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!isInSelectionMode) return
      event.preventDefault()
      event.stopPropagation()
      const newIds = new Set(selectionModel.ids)
      if (newIds.has(row.id)) newIds.delete(row.id)
      else newIds.add(row.id)
      setSelectionModel({ type: "include", ids: newIds })
    },
    [selectionModel, row.id, setSelectionModel, isInSelectionMode],
  )

  const longPressHandlers = useLongPress({
    onLongPress: handleLongPressForSelection,
    onClick: handleTapForSelection,
    enabled: true,
    delay: 500,
  })

  const longPressActions = [
    {
      label: t("common.viewDetails", "View Details"),
      icon: <VisibilityRounded />,
      onClick: () => { window.location.href = `/market/${row.listing_id}` },
    },
    {
      label: t("ItemStock.manageStock", "Manage Stock"),
      icon: <InventoryRounded />,
      onClick: () => { window.location.href = `/market/stock/${row.listing_id}` },
    },
    {
      label: t("ItemStock.share", "Share"),
      icon: <ShareRounded />,
      onClick: () => {
        navigator.clipboard.writeText(window.location.origin + `/market/${row.listing_id}`)
      },
    },
    {
      label: t("ItemStock.refresh", "Refresh"),
      icon: <RefreshOutlined />,
      onClick: () => onRefresh(row.listing_id),
    },
  ]

  const priceLabel =
    row.price_min === row.price_max
      ? `${row.price_min?.toLocaleString()} aUEC`
      : `${row.price_min?.toLocaleString()}–${row.price_max?.toLocaleString()} aUEC`

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
          to={isInSelectionMode ? undefined : `/market/${row.listing_id}`}
        >
          <Stack direction="row" spacing={2} sx={{ p: 2 }} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {row.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {priceLabel}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                <Chip
                  label={`${t("ItemStock.quantity")}: ${row.quantity_available.toLocaleString()}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={row.status === "active" ? t("ItemStock.active") : t("ItemStock.inactive")}
                  color={row.status === "active" ? "success" : "error"}
                  size="small"
                />
                {row.quality_tier_min != null && (
                  <Chip
                    label={
                      row.quality_tier_min === row.quality_tier_max
                        ? `Tier ${row.quality_tier_min}`
                        : `T${row.quality_tier_min}–${row.quality_tier_max}`
                    }
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
            {isSelected && <RadioButtonCheckedRounded color="primary" />}
          </Stack>
        </CardActionArea>
      </Card>
    </LongPressMenu>
  )
})
StockCardV2.displayName = "StockCardV2"

/* ── DisplayStockV2 (mirrors V1 DisplayStock) ── */

function DisplayStockV2({
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
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [currentOrg] = useCurrentOrg()
  const issueAlert = useAlertHook()

  const [updateListing] = useUpdateListingMutation()
  const [refreshListing] = useRefreshListingMutation()
  const [deleteListing] = useDeleteListingMutation()
  const [createListing] = useCreateListingMutation()

  const [newRows, setNewRows] = useState<NewListingRowV2[]>([])
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [editingRows, setEditingRows] = useState<Record<string, Partial<NewListingRowV2>>>({})

  const ctx = useContext(StockSelectionContext)
  if (!ctx) return null
  const [selectionModel, setSelectionModel] = ctx

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
        issueAlert({ message: "Failed to refresh", severity: "error" })
      }
    },
    [refreshListing, issueAlert, t],
  )

  const handleEditClick = useCallback(
    (id: GridRowId) => () => {
      const nr = newRows.find((r) => r.id === id)
      if (nr) setEditingRows((prev) => ({ ...prev, [id]: { ...nr } }))
      setRowModesModel((old) => ({ ...old, [id]: { mode: GridRowModes.Edit } }))
    },
    [newRows],
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
            description: "",
            game_item_id: editing.game_item_id,
            pricing_mode: "unified",
            base_price: editing.price || 1,
            lots: [{ quantity: editing.quantity_available || 1, variant_attributes: {} }],
          },
        }).unwrap()
        issueAlert({ message: t("ItemStock.created"), severity: "success" })
        setNewRows((prev) => prev.filter((r) => r.id !== id))
      } catch {
        issueAlert({ message: t("ItemStock.createError"), severity: "error" })
        return
      }
    } else if (existing) {
      try {
        const req: Record<string, string | number> = {}
        if (editing.status !== undefined && editing.status !== existing.status) req.status = editing.status
        if (editing.price !== undefined && editing.price !== existing.price_min) req.base_price = editing.price
        if (Object.keys(req).length > 0) {
          await updateListing({ id: existing.listing_id, updateListingRequest: req }).unwrap()
          issueAlert({ message: t("ItemStock.updated"), severity: "success" })
        }
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
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr && rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <GameItemSearchAutocomplete
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
                to={`/market/${params.row.listing_id}`}
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
          const nr = newRows.find((r) => r.id === params.id)
          if (nr && rowModesModel[params.id]?.mode === GridRowModes.Edit) {
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
                label={t("ItemStock.price")}
                value={editing?.price ?? 1}
              />
            )
          }
          const min = params.row.price_min
          const max = params.row.price_max
          if (min === max) return `${min?.toLocaleString()} aUEC`
          return `${min?.toLocaleString()}–${max?.toLocaleString()} aUEC`
        },
      },
      {
        field: "quantity_available",
        headerName: t("ItemStock.quantity"),
        width: 90,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr && rowModesModel[params.id]?.mode === GridRowModes.Edit) {
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
                    [params.id]: { ...prev[params.id as string], quantity_available: v.floatValue || 1 },
                  }))
                }}
                size="small"
                label={t("ItemStock.qty")}
                value={editing?.quantity_available ?? 1}
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
              {params.value === "active" ? t("ItemStock.active") : t("ItemStock.inactive")}
            </Typography>
          )
        },
      },
      {
        field: "expires_at",
        headerName: t("ItemStock.expiration"),
        renderHeader: () => <RefreshCircle />,
        width: 50,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr) return "—"
          if (!params.value) return "—"
          const d = new Date(params.value)
          if (d > new Date()) return formatMostSignificantDiff(params.value)
          return (
            <Tooltip title={t("ItemStock.refreshListing")}>
              <IconButton sx={{ color: "error.main" }} onClick={(e) => { e.stopPropagation(); handleRefresh(params.row.listing_id) }}>
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

          return (
            <Tooltip title={t("ItemStock.editListing")}>
              <Link to={`/market_edit/${params.value}`} style={{ color: "inherit" }}>
                <IconButton><CreateRounded /></IconButton>
              </Link>
            </Tooltip>
          )
        },
      },
    ],
    [t, theme, newRows, rowModesModel, editingRows, handleRefresh, handleEditClick, handleCancelClick, handleSaveClick],
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
        <StockToolbarV2
          listings={listings}
          setNewRows={setNewRows}
          setRowModesModel={setRowModesModel}
          isMobile={true}
          onAddQuickListing={() => {
            const id = `new-${Date.now()}`
            setNewRows((prev) => [
              ...prev,
              { id, game_item_id: null, game_item_name: null, price: 1, quantity_available: 1, status: "active", isNew: true },
            ])
          }}
        />
        <PullToRefresh onRefresh={async () => onRefreshAll()}>
          <Paper sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}>
            {allRows.length === 0 ? (
              <EmptyListings showCreateAction={false} />
            ) : (
              <Grid container spacing={theme.layoutSpacing.layout}>
                {allRows.map((row) => (
                  <StockCardV2
                    key={row.id}
                    row={row as MyListingItem & { id: string }}
                    isSelected={selectionModel.ids.has(row.id)}
                    onRefresh={handleRefresh}
                  />
                ))}
              </Grid>
            )}
          </Paper>
        </PullToRefresh>
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
        checkboxSelection
        onRowSelectionModelChange={setSelectionModel}
        rowSelectionModel={selectionModel}
        onRowEditStop={handleRowEditStop}
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        initialState={{ sorting: { sortModel: [{ field: "title", sort: "asc" }] } }}
        slots={{
          toolbar: StockToolbarV2,
        }}
        slotProps={{
          toolbar: {
            listings,
            setNewRows,
            setRowModesModel,
            isMobile: false,
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

/* ── Main Page Component (mirrors V1 ManageStock) ── */

export function StockManagerV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [currentOrg] = useCurrentOrg()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
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
    spectrumId: currentOrg?.spectrum_id,  })

  const listings = data?.listings ?? []

  return (
    <StandardPageLayout
      title={t("sidebar.manage_listings")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.manage_listings", "Manage Listings") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
    >
      <StockSelectionContext.Provider value={[selectionModel, setSelectionModel]}>
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
                    <Link to="/market/create" style={{ textDecoration: "none" }}>
                      <Button variant="contained" color="secondary" startIcon={<AddRounded />} size="large">
                        {t("market.createListing", "Create Listing")}
                      </Button>
                    </Link>
                  }
                />
              </Box>
            </Grid>

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
                  <DisplayStockV2
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
              <Link to="/market/me" style={{ color: "inherit" }}>
                <UnderlineLink>{t("sidebar.archived_listings")}</UnderlineLink>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </StockSelectionContext.Provider>
    </StandardPageLayout>
  )
}
