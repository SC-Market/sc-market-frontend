import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  AddRounded,
  DeleteRounded,
  InventoryRounded,
  LinkRounded,
  LinkOffRounded,
  SearchRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  useGetInventoryQuery,
  useCreateInventoryLotMutation,
  useDeleteInventoryLotMutation,
  useUnlinkFromListingMutation,
} from "../../store/api/v2/market"
import { Link } from "react-router-dom"
import { useAlertHook } from "../../hooks/alert/AlertHook"

export default function InventoryPage() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [newQty, setNewQty] = useState(1)
  const [newNotes, setNewNotes] = useState("")

  const { data, isLoading, refetch } = useGetInventoryQuery({ page, page_size: 50 })
  const [createLot, { isLoading: creating }] = useCreateInventoryLotMutation()
  const [deleteLot] = useDeleteInventoryLotMutation()
  const [unlinkLot] = useUnlinkFromListingMutation()

  const lots = data?.lots || []
  const filtered = useMemo(() => {
    if (!search) return lots
    const s = search.toLowerCase()
    return lots.filter(
      (l) =>
        l.game_item_name?.toLowerCase().includes(s) ||
        l.listing_title?.toLowerCase().includes(s) ||
        l.notes?.toLowerCase().includes(s),
    )
  }, [lots, search])

  const handleCreate = async () => {
    try {
      await createLot({ createInventoryLotRequest: { quantity: newQty, notes: newNotes || undefined } }).unwrap()
      issueAlert({ message: t("inventory.created", "Lot created"), severity: "success" })
      setCreateOpen(false)
      setNewQty(1)
      setNewNotes("")
      refetch()
    } catch (err: any) {
      issueAlert({ message: err?.data?.message || "Failed to create lot", severity: "error" })
    }
  }

  const handleDelete = async (lotId: string) => {
    try {
      await deleteLot({ lotId }).unwrap()
      issueAlert({ message: t("inventory.deleted", "Lot deleted"), severity: "success" })
      refetch()
    } catch (err: any) {
      issueAlert({ message: err?.data?.message || "Failed to delete lot", severity: "error" })
    }
  }

  const handleUnlink = async (lotId: string) => {
    try {
      await unlinkLot({ lotId }).unwrap()
      issueAlert({ message: t("inventory.unlinked", "Lot unlinked from listing"), severity: "success" })
      refetch()
    } catch (err: any) {
      issueAlert({ message: err?.data?.message || "Failed to unlink lot", severity: "error" })
    }
  }

  return (
    <StandardPageLayout
      title={t("sidebar.inventory", "My Inventory")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.inventory", "My Inventory") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
    >
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" color="text.secondary">
              {t("inventory.title", "Inventory")}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder={t("inventory.search", "Search...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchRounded sx={{ mr: 0.5, color: "text.secondary" }} /> }}
              />
              <Button variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>
                {t("inventory.addLot", "Add Lot")}
              </Button>
            </Stack>
          </Stack>

          {filtered.length === 0 && !isLoading ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <InventoryRounded sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography color="text.secondary">
                {t("inventory.empty", "No inventory items yet")}
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("inventory.item", "Item")}</TableCell>
                  <TableCell>{t("inventory.variant", "Variant")}</TableCell>
                  <TableCell align="right">{t("inventory.quantity", "Qty")}</TableCell>
                  <TableCell>{t("inventory.location", "Location")}</TableCell>
                  <TableCell>{t("inventory.listing", "Listing")}</TableCell>
                  <TableCell>{t("inventory.status", "Status")}</TableCell>
                  <TableCell align="right">{t("inventory.actions", "Actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((lot) => (
                  <TableRow key={lot.lot_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {lot.game_item_name || t("inventory.custom_item", "Custom Item")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {lot.variant_display_name || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {lot.quantity_total.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {lot.location_name || t("inventory.unspecified", "Unspecified")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {lot.listing_id ? (
                        <Chip
                          label={lot.listing_title || "Listing"}
                          size="small"
                          component={Link}
                          to={`/market/${lot.listing_id}`}
                          clickable
                          icon={<LinkRounded />}
                        />
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          {t("inventory.unlisted", "Unlisted")}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lot.listed ? t("inventory.listed", "Listed") : t("inventory.personal", "Personal")}
                        size="small"
                        color={lot.listed ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {lot.listing_id && (
                          <Tooltip title={t("inventory.unlink", "Unlink from listing")}>
                            <IconButton size="small" onClick={() => handleUnlink(lot.lot_id)}>
                              <LinkOffRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t("inventory.delete", "Delete lot")}>
                          <IconButton size="small" color="error" onClick={() => handleDelete(lot.lot_id)}>
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data && data.total > data.page_size && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {t("common.previous", "Previous")}
              </Button>
              <Typography sx={{ mx: 2, alignSelf: "center" }}>
                {page} / {Math.ceil(data.total / data.page_size)}
              </Typography>
              <Button disabled={page >= Math.ceil(data.total / data.page_size)} onClick={() => setPage(page + 1)}>
                {t("common.next", "Next")}
              </Button>
            </Stack>
          )}
        </Paper>
      </Grid>

      {/* Create Lot Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("inventory.createLot", "Create Inventory Lot")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("inventory.quantity", "Quantity")}
              type="number"
              value={newQty}
              onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label={t("inventory.notes", "Notes")}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t("common.cancel", "Cancel")}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating || newQty < 0}>
            {t("common.create", "Create")}
          </Button>
        </DialogActions>
      </Dialog>
    </StandardPageLayout>
  )
}
