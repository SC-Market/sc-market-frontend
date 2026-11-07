import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Skeleton,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { DeleteRounded, LinkOffRounded, LinkRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { type InventoryResponse } from "../../store/api/v2/market"
import { Link } from "react-router-dom"
import { MARKET_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"

/** Stock lots table: item, variant, quantity, location, listing, status and actions. */
export function InventoryLotsTable({
  filtered,
  isLoading,
  handleUnlink,
  setConfirmDeleteId,
}: {
  filtered: InventoryResponse["lots"]
  isLoading: boolean
  handleUnlink: (lotId: string) => void
  setConfirmDeleteId: (lotId: string) => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("inventory.item", "Item")}</TableCell>
            <TableCell>{t("inventory.variant", "Variant")}</TableCell>
            <TableCell align="right">
              {t("inventory.quantity", "Qty")}
            </TableCell>
            <TableCell>{t("inventory.location", "Location")}</TableCell>
            <TableCell>{t("inventory.listing", "Listing")}</TableCell>
            <TableCell>{t("inventory.status", "Status")}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
              {t("inventory.actions", "Actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* While the first page loads: placeholder rows in the same
            table, so the column widths and page height match */}
          {isLoading &&
            Array.from({ length: 16 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Skeleton variant="rounded" width={28} height={28} />
                    <Skeleton variant="text" width={160} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" width={40} sx={{ ml: "auto" }} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={140} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rounded" width={64} height={24} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" width={72} sx={{ ml: "auto" }} />
                </TableCell>
              </TableRow>
            ))}
          {filtered.map((lot) => (
            <TableRow key={lot.lot_id} hover>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {lot.game_item_image && (
                    <ImageAvatar
                      alt=""
                      src={lot.game_item_image}
                      variant="rounded"
                      sx={{ width: 28, height: 28 }}
                    />
                  )}
                  {lot.game_item_id ? (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      component={Link}
                      to={MARKET_PATHS.aggregate(lot.game_item_id)}
                      sx={{
                        color: "text.primary",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {lot.game_item_name ||
                        t("inventory.custom_item", "Custom Item")}
                    </Typography>
                  ) : (
                    <Typography variant="body2" fontWeight={600}>
                      {lot.game_item_name ||
                        t("inventory.custom_item", "Custom Item")}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>{lot.variant_display_name || "—"}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {fmt.number(lot.quantity_total)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {lot.location_name ||
                    t("inventory.unspecified", "Unspecified")}
                </Typography>
              </TableCell>
              <TableCell>
                {lot.listing_id ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {lot.listing_photo && (
                      <ImageAvatar
                        alt=""
                        src={lot.listing_photo}
                        variant="rounded"
                        sx={{ width: 24, height: 24 }}
                      />
                    )}
                    <Chip
                      label={lot.listing_title || t("inventory.listing")}
                      size="small"
                      sx={{ maxWidth: 240 }}
                      component={Link}
                      to={MARKET_PATHS.listing(lot.listing_id)}
                      clickable
                      icon={!lot.listing_photo ? <LinkRounded /> : undefined}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    {t("inventory.unlisted", "Unlisted")}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={
                    lot.listed
                      ? t("inventory.listed", "Listed")
                      : t("inventory.personal", "Personal")
                  }
                  size="small"
                  color={lot.listed ? "success" : "default"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  {lot.listing_id && (
                    <Tooltip
                      title={t("inventory.unlink", "Unlink from listing")}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleUnlink(lot.lot_id)}
                      >
                        <LinkOffRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("inventory.delete", "Delete lot")}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setConfirmDeleteId(lot.lot_id)}
                    >
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
