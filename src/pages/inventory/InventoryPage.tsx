import { useMemo, useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  AddRounded,
  InventoryRounded,
  WarehouseRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  useGetInventoryQuery,
  useCreateInventoryLotMutation,
  useDeleteInventoryLotMutation,
  useUnlinkFromListingMutation,
} from "../../store/api/v2/market"
import { MARKET_PATHS } from "../../routes/paths"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { GameItemSearchAutocomplete } from "../../features/market/components/GameItemSearchAutocomplete"
import { LocationSelector } from "../../features/market/components/stock/LocationSelector"
import { HelpLink } from "../../features/help/components/HelpLink"
import { FirstUseHint } from "../../features/help/components/FirstUseHint"
import { EmptyState } from "../../components/empty-states/EmptyState"
import { InventoryLotsTable } from "./InventoryLotsTable"
import { NumberedPagination } from "../../components/pagination/NumberedPagination"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"
import { scrollPageToTop } from "../../components/layout/pageScroll"

/* ── Confirm delete dialog ── */
function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const { t } = useTranslation()
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("inventory.confirmDeleteTitle", "Delete lot?")}
      message={t(
        "inventory.confirmDeleteBody",
        "This lot will be permanently deleted and cannot be recovered.",
      )}
      cancelLabel={t("common.cancel", "Cancel")}
      confirmLabel={t("inventory.deleteConfirm", "Delete")}
      destructive
      loading={loading}
    />
  )
}

export default function InventoryPage() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Create form state
  const [newGameItemId, setNewGameItemId] = useState<string | null>(null)
  const [newGameItemName, setNewGameItemName] = useState<string | null>(null)
  const [newQty, setNewQty] = useState(1)
  const [newLocationId, setNewLocationId] = useState<string | null>(null)
  const [newNotes, setNewNotes] = useState("")

  const { data, isLoading, refetch } = useGetInventoryQuery({
    page,
    pageSize,
  })
  const [createLot, { isLoading: creating }] = useCreateInventoryLotMutation()
  const [deleteLot, { isLoading: deleting }] = useDeleteInventoryLotMutation()
  const [unlinkLot] = useUnlinkFromListingMutation()

  const lots = useMemo(() => data?.lots || [], [data?.lots])

  const filtered = useMemo(() => {
    if (!search) return lots
    const s = search.toLowerCase()
    return lots.filter(
      (l) =>
        l.game_item_name?.toLowerCase().includes(s) ||
        l.listing_title?.toLowerCase().includes(s) ||
        l.notes?.toLowerCase().includes(s) ||
        l.location_name?.toLowerCase().includes(s),
    )
  }, [lots, search])

  const resetCreateForm = () => {
    setNewGameItemId(null)
    setNewGameItemName(null)
    setNewQty(1)
    setNewLocationId(null)
    setNewNotes("")
  }

  const handleCreate = async () => {
    if (newQty <= 0) {
      issueAlert({
        message: t("inventory.qtyRequired", "Quantity must be greater than 0"),
        severity: "error",
      })
      return
    }
    try {
      await createLot({
        createInventoryLotRequest: {
          game_item_id: newGameItemId ?? undefined,
          quantity: newQty,
          location_id: newLocationId ?? undefined,
          notes: newNotes.trim() || undefined,
        },
      }).unwrap()
      issueAlert({
        message: t("inventory.created", "Lot created"),
        severity: "success",
      })
      setCreateOpen(false)
      resetCreateForm()
      refetch()
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("inventory.createError", "Failed to create lot")
      issueAlert({ message, severity: "error" })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    try {
      await deleteLot({ lotId: confirmDeleteId }).unwrap()
      issueAlert({
        message: t("inventory.deleted", "Lot deleted"),
        severity: "success",
      })
      setConfirmDeleteId(null)
      refetch()
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("inventory.deleteError", "Failed to delete lot")
      issueAlert({ message, severity: "error" })
    }
  }

  const handleUnlink = async (lotId: string) => {
    try {
      await unlinkLot({ lotId }).unwrap()
      issueAlert({
        message: t("inventory.unlinked", "Lot unlinked from listing"),
        severity: "success",
      })
      refetch()
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("inventory.unlinkError", "Failed to unlink lot")
      issueAlert({ message, severity: "error" })
    }
  }

  return (
    <StandardPageLayout
      headerActions={<HelpLink guide="stockLots" />}
      title={t("sidebar.inventory", "My Stock")}
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
        { label: t("sidebar.inventory", "My Stock") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
    >
      {/* minWidth 0: a flex item sizes to its content by default, so the
          wide table used to stretch the card past the page and clip the
          Actions column. The table now scrolls inside the card instead. */}
      <Grid item xs={12} sx={{ "&:empty": { display: "none" } }}>
        <FirstUseHint hint="myStock" title={t("hints.myStock.title")}>
          {t("hints.myStock.body")}
        </FirstUseHint>
      </Grid>
      <Grid item xs={12} sx={{ minWidth: 0 }}>
        <Paper sx={{ p: 2, minWidth: 0 }}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Typography variant="h5" fontWeight="bold" color="text.secondary">
              {t("inventory.title", "My Stock")}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder={t("inventory.search", "Search inventory")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InventoryRounded
                      sx={{ mr: 0.5, color: "text.secondary", fontSize: 18 }}
                    />
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => setCreateOpen(true)}
                sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
              >
                {t("inventory.addLot", "Add Lot")}
              </Button>
            </Stack>
          </Stack>

          {/* Table */}
          {filtered.length === 0 && !isLoading ? (
            search ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography color="text.secondary">
                  {t("inventory.noResults", "No lots match your search")}
                </Typography>
              </Box>
            ) : (
              <EmptyState
                title={t("inventory.empty", "No stock yet")}
                description={t("inventory.emptyDescription")}
                guide="myStock"
                action={{
                  label: t("inventory.addLot", "Add Lot"),
                  onClick: () => setCreateOpen(true),
                }}
                sx={{ minHeight: { xs: 240, sm: 300 } }}
              />
            )
          ) : (
            <InventoryLotsTable
              filtered={filtered}
              isLoading={isLoading}
              handleUnlink={handleUnlink}
              setConfirmDeleteId={setConfirmDeleteId}
            />
          )}

          {/* Pagination */}
          {data && data.total > 0 && (
            <NumberedPagination
              count={data.total}
              page={page - 1}
              rowsPerPage={pageSize}
              onPageChange={(newPage) => {
                setPage(newPage + 1)
                scrollPageToTop()
              }}
              rowsPerPageOptions={[25, 50, 100]}
              onRowsPerPageChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
              sx={{ mt: 2 }}
            />
          )}
        </Paper>
      </Grid>

      {/* Create Lot Dialog */}
      <ResponsiveDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          resetCreateForm()
        }}
        maxWidth="sm"
        title={
          <>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WarehouseRounded />
              <span>{t("inventory.createLot", "Add Stock Lot")}</span>
            </Stack>
          </>
        }
        disableClose={creating}
        actions={
          <>
            <Button
              onClick={() => {
                setCreateOpen(false)
                resetCreateForm()
              }}
              disabled={creating}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={creating || newQty <= 0}
              startIcon={creating ? <CircularProgress size={16} /> : undefined}
            >
              {t("common.create", "Create")}
            </Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <GameItemSearchAutocomplete
            value={newGameItemName}
            onChange={(name, _type, itemId) => {
              setNewGameItemName(name)
              setNewGameItemId(itemId)
            }}
            label={t("inventory.gameItem", "Item (optional)")}
            size="small"
          />
          <TextField
            fullWidth
            label={t("inventory.quantity", "Quantity")}
            type="number"
            value={newQty}
            onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
            inputProps={{ min: 1 }}
            size="small"
            error={newQty <= 0}
            helperText={
              newQty <= 0
                ? t("inventory.qtyRequired", "Must be greater than 0")
                : t("inventory.qtyHelp", "Number of units in this lot")
            }
          />
          <LocationSelector
            value={newLocationId}
            onChange={setNewLocationId}
            size="small"
            fullWidth
            label={t("inventory.location", "Location (optional)")}
          />
          <TextField
            fullWidth
            label={t("inventory.notes", "Notes (optional)")}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            multiline
            rows={2}
            size="small"
            inputProps={{ maxLength: 1000 }}
            helperText={`${newNotes.length}/1000`}
          />
        </Stack>
      </ResponsiveDialog>

      <ConfirmDeleteDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </StandardPageLayout>
  )
}
