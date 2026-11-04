import React from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Avatar,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import type { GameItemAggregate } from "../../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { MARKET_PATHS } from "../../../../routes/paths"
import { useTranslation } from "react-i18next"
import { useFormatters, type Formatters } from "../../../../util/format"

function formatPrice(fmt: Formatters, min: number, max: number) {
  if (min === max) return `${fmt.number(min)} aUEC`
  return `${fmt.number(min)} – ${fmt.number(max)} aUEC`
}

export function BulkItemsTableV2({ items }: { items: GameItemAggregate[] }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>{t("marketUi.tables.name")}</TableCell>
            <TableCell>{t("marketUi.tables.type")}</TableCell>
            <TableCell>{t("marketUi.tables.priceRange")}</TableCell>
            <TableCell align="right">
              {t("marketUi.tables.available")}
            </TableCell>
            <TableCell align="right">{t("marketUi.tables.sellers")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.game_item_id} hover>
              <TableCell padding="none" sx={{ width: 40, pl: 1 }}>
                <Avatar
                  src={item.image_url || FALLBACK_IMAGE_URL}
                  sx={{ width: 40, height: 40 }}
                  variant="rounded"
                  imgProps={{ loading: "lazy" }}
                />
              </TableCell>
              <TableCell>
                <MuiLink
                  component={RouterLink}
                  to={MARKET_PATHS.aggregate(item.game_item_id)}
                  underline="hover"
                  color="text.primary"
                  fontWeight="bold"
                  variant="body2"
                >
                  {item.name}
                </MuiLink>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {item.type}
                </Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  {formatPrice(fmt, item.min_price, item.max_price)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {fmt.number(item.total_quantity)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{item.shop_count}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
