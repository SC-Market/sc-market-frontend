import React, { useMemo, useState } from "react"
import {
  Avatar,
  Box,
  Button,
  Chip,
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
import { useGetInventoryQuery } from "../../store/api/v2/market"
import { Link } from "react-router-dom"

export default function InventoryPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const { data, isLoading } = useGetInventoryQuery({ page, page_size: 50 })

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
    </StandardPageLayout>
  )
}
