import React from "react"
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import AddRounded from "@mui/icons-material/AddRounded"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import type { StandingBuyOrder } from "../../store/api/v2/market"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MARKET_PATHS } from "../../routes/paths"
import { formatPrice } from "../../util/formatPrice"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { LandingImg } from "./LandingImage"
import { WANTED_NOW_COUNT } from "./landingLinks"

/** Every body row's height (px), loaded, loading or filler. */
const ROW_HEIGHT = 52

/** The item photo thumbnail (px), drawn at its attribute size. */
const THUMB_SIZE = 32

/** The Buyer column only from sm: phones show item and price. */
const BUYER_CELL_SX = { display: { xs: "none", sm: "table-cell" } } as const

const CELL_SX = {
  height: ROW_HEIGHT,
  py: 0,
  px: 2,
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const

/** A link whose ::after covers the row (the row is position: relative). */
const ROW_LINK_SX = {
  color: "text.secondary",
  textDecoration: "none",
  overflow: "hidden",
  textOverflow: "ellipsis",
  "&::after": { content: '""', position: "absolute", inset: 0 },
  "&:focus-visible": { outline: "none" },
  "&:focus-visible::after": {
    outline: 2,
    outlineColor: "primary.main",
    outlineOffset: -2,
  },
} as const

const ITEM_SX = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
} as const

function BuyOrderRow({ order }: { order: StandingBuyOrder }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const remaining = order.quantity - (order.quantity_fulfilled || 0)
  return (
    <TableRow
      hover
      data-testid="buy-order-row"
      data-id={order.buy_order_id}
      sx={{ position: "relative" }}
    >
      <TableCell sx={CELL_SX}>
        <Box sx={ITEM_SX}>
          {/* Buyer uploads come in one size (no srcset to offer); the box
              is fixed by width/height, so loading never moves the row. */}
          <LandingImg
            src={order.photos?.[0]?.url || FALLBACK_IMAGE_URL}
            alt=""
            width={THUMB_SIZE}
            height={THUMB_SIZE}
            loading="lazy"
            decoding="async"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src = FALLBACK_IMAGE_URL
            }}
            sx={{
              flexShrink: 0,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              objectFit: "cover",
              borderRadius: theme.spacing(theme.borderRadius.image),
              bgcolor: "background.default",
            }}
          />
          <Box
            component={Link}
            to={MARKET_PATHS.buyOrder(order.buy_order_id)}
            sx={ROW_LINK_SX}
          >
            {order.game_item_name}
          </Box>
        </Box>
      </TableCell>
      <TableCell sx={{ ...CELL_SX, ...BUYER_CELL_SX }}>
        {order.buyer_name}
      </TableCell>
      <TableCell align="right" sx={CELL_SX}>
        <Typography
          component="span"
          color="primary"
          sx={{ display: "block", fontSize: "0.875rem", lineHeight: 1.3 }}
        >
          {order.price_per_unit > 0
            ? formatPrice(order.price_per_unit)
            : t("BuyOrdersRedesign.priceNegotiable", "Make an offer")}
        </Typography>
        <Typography
          component="span"
          color="text.primary"
          sx={{ display: "block", fontSize: "0.7rem", lineHeight: 1.1 }}
        >
          {t("landing.wantedNowQuantity", {
            quantity: remaining.toLocaleString(i18n.language),
          })}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

/** A row while loading: the same height, a thumbnail and text skeletons. */
function SkeletonRow() {
  return (
    <TableRow>
      <TableCell sx={CELL_SX}>
        <Box sx={ITEM_SX}>
          <Skeleton
            variant="rounded"
            width={THUMB_SIZE}
            height={THUMB_SIZE}
            sx={{ flexShrink: 0 }}
          />
          <Skeleton width="70%" />
        </Box>
      </TableCell>
      <TableCell sx={{ ...CELL_SX, ...BUYER_CELL_SX }}>
        <Skeleton width="70%" />
      </TableCell>
      <TableCell align="right" sx={CELL_SX}>
        <Skeleton width="60%" sx={{ ml: "auto" }} />
      </TableCell>
    </TableRow>
  )
}

/**
 * The first free slot of a short list: an invitation to post a buy order,
 * in the row's own size (the rest of the free slots are blank filler).
 */
function PostBuyOrderRow() {
  const { t } = useTranslation()
  return (
    <TableRow
      hover
      data-testid="landing-post-buy-order"
      sx={{ position: "relative" }}
    >
      <TableCell colSpan={3} sx={CELL_SX}>
        <Box sx={ITEM_SX}>
          <Box
            aria-hidden
            sx={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              color: "secondary.main",
              border: 1,
              borderStyle: "dashed",
              borderColor: "secondary.main",
              borderRadius: 1,
            }}
          >
            <AddRounded fontSize="small" />
          </Box>
          <Box
            component={Link}
            to={MARKET_PATHS.buyOrderCreate}
            sx={{ ...ROW_LINK_SX, color: "secondary.main" }}
          >
            {t("landing.wantedNowPost")}
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  )
}

function FillerRow(props: { children?: React.ReactNode }) {
  return (
    <TableRow aria-hidden={props.children ? undefined : true}>
      <TableCell colSpan={3} sx={CELL_SX}>
        {props.children}
      </TableCell>
    </TableRow>
  )
}

/**
 * The hero's "Wanted now": the newest open buy orders in a fixed-height
 * table (WANTED_NOW_COUNT rows of ROW_HEIGHT whatever the data), so loading,
 * loaded, short and failed lists are all the same size. A short list's
 * first free row invites a new buy order.
 * `orders`: undefined while loading, null when the request failed.
 */
export function WantedNowTable(props: {
  orders: StandingBuyOrder[] | null | undefined
}) {
  const { t } = useTranslation()
  const { orders } = props
  const rows = orders ? orders.slice(0, WANTED_NOW_COUNT) : []
  const free = WANTED_NOW_COUNT - rows.length

  return (
    <Paper
      component="section"
      aria-labelledby="landing-wanted-now-title"
      aria-busy={orders === undefined ? true : undefined}
      data-testid="landing-wanted-now"
      sx={{ overflow: "hidden" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          id="landing-wanted-now-title"
          component="h2"
          color="text.secondary"
          sx={{ fontWeight: "bold", fontSize: "1.1rem", lineHeight: 1.3 }}
        >
          {t("landing.wantedNowTitle")}
        </Typography>
        <Button
          component={Link}
          to={MARKET_PATHS.buyOrders}
          variant="outlined"
          color="secondary"
        >
          {t("landing.seeAll")}
        </Button>
      </Box>
      <Table sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ fontWeight: 500, py: 1.25, px: 2, width: { sm: "48%" } }}
            >
              {t("landing.wantedNowItem")}
            </TableCell>
            <TableCell
              sx={{ fontWeight: 500, py: 1.25, px: 2, width: "24%", ...BUYER_CELL_SX }}
            >
              {t("landing.wantedNowBuyer")}
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 500, py: 1.25, px: 2, width: { xs: "38%", sm: "28%" } }}
            >
              {t("landing.wantedNowPrice")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ "& tr:last-of-type td": { borderBottom: 0 } }}>
          {orders === undefined
            ? Array.from({ length: WANTED_NOW_COUNT }, (_, i) => (
                <SkeletonRow key={i} />
              ))
            : [
                ...rows.map((order) => (
                  <BuyOrderRow key={order.buy_order_id} order={order} />
                )),
                ...Array.from({ length: free }, (_, i) =>
                  i > 0 ? (
                    <FillerRow key={`free-${i}`} />
                  ) : orders === null ? (
                    <FillerRow key="error">{t("landing.wantedNowError")}</FillerRow>
                  ) : (
                    <PostBuyOrderRow key="post" />
                  ),
                ),
              ]}
        </TableBody>
      </Table>
    </Paper>
  )
}
