import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { InventoryRounded } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { TrashCan } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import { type VariantDetail } from "../../../store/api/v2/market"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import {
  formatCraftedSource,
  hasDisplayableSource,
} from "../../../util/variantDisplay"
import { useFormatters } from "../../../util/format"

/** A single variant item in the counteroffer */
export interface V2Item {
  listing_id: string
  variant_id: string
  quantity: number
  price_per_unit: number
}

/** Enriched item for display */
export interface DisplayItem extends V2Item {
  listing_title: string
  listing_photo?: string
  variant: VariantDetail
}

/** The counteroffer's items: quantity editable, removable, with the total. */
export function CounterOfferItemsTable({
  displayItems,
  total,
  handleQuantityChange,
  handleRemove,
}: {
  displayItems: DisplayItem[]
  total: number
  handleQuantityChange: (variantId: string, quantity: number) => void
  handleRemove: (variantId: string) => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("marketV2.item")}</TableCell>
          <TableCell>{t("marketV2.variant")}</TableCell>
          <TableCell align="right">{t("marketV2.qty")}</TableCell>
          <TableCell align="right">{t("marketV2.price")}</TableCell>
          <TableCell align="right">{t("marketV2.subtotal")}</TableCell>
          <TableCell width={48} />
        </TableRow>
      </TableHead>
      <TableBody>
        {displayItems.map((item) => (
          <TableRow key={item.variant_id}>
            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center">
                <ImageAvatar
                  alt=""
                  src={item.listing_photo}
                  variant="rounded"
                  sx={{ width: 32, height: 32, borderRadius: 1 }}
                >
                  <InventoryRounded fontSize="small" />
                </ImageAvatar>
                <Typography variant="body2" fontWeight={600}>
                  {item.listing_title}
                </Typography>
              </Stack>
            </TableCell>
            <TableCell>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexWrap: "wrap",
                }}
              >
                {item.variant.attributes.quality_tier != null && (
                  <QualityBadge
                    tier={item.variant.attributes.quality_tier}
                    size="small"
                  />
                )}
                {hasDisplayableSource(
                  item.variant.attributes.crafted_source,
                ) && (
                  <Chip
                    label={formatCraftedSource(
                      String(item.variant.attributes.crafted_source),
                    )}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </TableCell>
            <TableCell align="right">
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                value={item.quantity}
                onValueChange={(values) => {
                  handleQuantityChange(
                    item.variant_id,
                    Math.max(1, values.floatValue || 1),
                  )
                }}
                size="small"
                sx={{ width: 100 }}
                inputProps={{
                  inputMode: "numeric",
                  style: { textAlign: "right" },
                }}
              />
            </TableCell>
            <TableCell align="right">
              {fmt.price(item.price_per_unit)}
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight={600}>
                {fmt.price(item.price_per_unit * item.quantity)}
              </Typography>
            </TableCell>
            <TableCell>
              <IconButton
                size="small"
                onClick={() => handleRemove(item.variant_id)}
                aria-label={t("cart.removeItem", "Remove {{title}} from cart", {
                  title: item.listing_title,
                })}
              >
                <TrashCan fontSize="small" color="error" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={4} align="right">
            <Typography variant="subtitle2">{t("marketV2.total")}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="h6" color="primary" fontWeight={700}>
              {fmt.price(total)}
            </Typography>
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  )
}
