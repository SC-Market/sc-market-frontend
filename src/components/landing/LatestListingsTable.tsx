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
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import type { ListingSearchResult } from "../../store/api/v2/market"
import { MARKET_PATHS } from "../../routes/paths"
import { formatPrice } from "../../util/formatPrice"
import { formatMarketUrl } from "../../features/market/domain/urls"
import { LATEST_LISTINGS_COUNT } from "./landingLinks"

/** Every body row's height (px), loaded, loading or empty. */
const ROW_HEIGHT = 52

/** The Shop column only from sm: phones show item and price. */
const SHOP_CELL_SX = { display: { xs: "none", sm: "table-cell" } } as const

const CELL_SX = {
  height: ROW_HEIGHT,
  py: 0,
  px: 2,
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const

function ListingRow({ listing }: { listing: ListingSearchResult }) {
  const { t, i18n } = useTranslation()
  return (
    <TableRow
      hover
      data-testid="listing-row"
      data-id={listing.listing_id}
      // The title link's ::after covers the row.
      sx={{ position: "relative" }}
    >
      <TableCell sx={CELL_SX}>
        <Box
          component={Link}
          to={formatMarketUrl(listing)}
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            "&::after": { content: '""', position: "absolute", inset: 0 },
            "&:focus-visible": { outline: "none" },
            "&:focus-visible::after": {
              outline: 2,
              outlineColor: "primary.main",
              outlineOffset: -2,
            },
          }}
        >
          {listing.title}
        </Box>
      </TableCell>
      <TableCell sx={{ ...CELL_SX, ...SHOP_CELL_SX }}>
        {listing.shop_name}
      </TableCell>
      <TableCell align="right" sx={CELL_SX}>
        <Typography
          component="span"
          color="primary"
          sx={{ display: "block", fontSize: "0.875rem", lineHeight: 1.3 }}
        >
          {formatPrice(listing.price_min)}
        </Typography>
        <Typography
          component="span"
          color="text.primary"
          sx={{ display: "block", fontSize: "0.7rem", lineHeight: 1.1 }}
        >
          {listing.quantity_unit === "scu"
            ? t("landing.latestListingsPerScu")
            : t("landing.latestListingsQuantity", {
                quantity: listing.quantity_available.toLocaleString(
                  i18n.language,
                ),
              })}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

/** A row while loading: the same height, text skeletons in the cells. */
function SkeletonRow() {
  return (
    <TableRow>
      <TableCell sx={CELL_SX}>
        <Skeleton width="80%" />
      </TableCell>
      <TableCell sx={{ ...CELL_SX, ...SHOP_CELL_SX }}>
        <Skeleton width="70%" />
      </TableCell>
      <TableCell align="right" sx={CELL_SX}>
        <Skeleton width="60%" sx={{ ml: "auto" }} />
      </TableCell>
    </TableRow>
  )
}

/** Filler so a short or failed list keeps the table's height. */
function EmptyRow(props: { children?: React.ReactNode }) {
  return (
    <TableRow aria-hidden={props.children ? undefined : true}>
      <TableCell colSpan={3} sx={CELL_SX}>
        {props.children}
      </TableCell>
    </TableRow>
  )
}

/**
 * The hero's live feed: the newest in-stock listings in a fixed-height
 * table (LATEST_LISTINGS_COUNT rows of ROW_HEIGHT whatever the data), so
 * loading, loaded, short and failed lists are all the same size.
 * `listings`: undefined while loading, null when the request failed.
 */
export function LatestListingsTable(props: {
  listings: ListingSearchResult[] | null | undefined
}) {
  const { t } = useTranslation()
  const { listings } = props
  const rows = listings ? listings.slice(0, LATEST_LISTINGS_COUNT) : []

  return (
    <Paper
      component="section"
      aria-labelledby="landing-latest-listings-title"
      aria-busy={listings === undefined ? true : undefined}
      data-testid="landing-latest-listings"
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
          id="landing-latest-listings-title"
          component="h2"
          color="text.secondary"
          sx={{ fontWeight: "bold", fontSize: "1.1rem", lineHeight: 1.3 }}
        >
          {t("landing.latestListingsTitle")}
        </Typography>
        <Button
          component={Link}
          to={MARKET_PATHS.search}
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
              sx={{ fontWeight: 500, py: 1.25, px: 2, width: { sm: "44%" } }}
            >
              {t("landing.latestListingsItem")}
            </TableCell>
            <TableCell
              sx={{ fontWeight: 500, py: 1.25, px: 2, width: "28%", ...SHOP_CELL_SX }}
            >
              {t("landing.latestListingsShop")}
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 500, py: 1.25, px: 2, width: { xs: "38%", sm: "28%" } }}
            >
              {t("landing.latestListingsPrice")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{ "& tr:last-of-type td": { borderBottom: 0 } }}
        >
          {listings === undefined
            ? Array.from({ length: LATEST_LISTINGS_COUNT }, (_, i) => (
                <SkeletonRow key={i} />
              ))
            : [
                ...rows.map((listing) => (
                  <ListingRow key={listing.listing_id} listing={listing} />
                )),
                ...Array.from(
                  { length: LATEST_LISTINGS_COUNT - rows.length },
                  (_, i) => (
                    <EmptyRow key={`empty-${i}`}>
                      {i === 0 && rows.length === 0
                        ? listings === null
                          ? t("landing.latestListingsError")
                          : t("landing.latestListingsEmpty")
                        : undefined}
                    </EmptyRow>
                  ),
                ),
              ]}
        </TableBody>
      </Table>
    </Paper>
  )
}
