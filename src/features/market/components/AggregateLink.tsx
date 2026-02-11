import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { UniqueListing, MarketAggregateListing } from "../domain/types"
import { useGetAggregateByIdQuery } from "../api/marketApi"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

export interface AggregateLinkProps {
  listing: UniqueListing
}

/**
 * Helper function to calculate the count of active listings with available quantity.
 * Filters out the current listing and inactive/unavailable listings.
 *
 * Sub-task 3.1: Calculate listing count
 * Requirements: 1.5, 2.2, 2.3
 *
 * @param listings - Array of aggregate listings
 * @param currentListingId - ID of the current listing to exclude
 * @returns Count of active listings with quantity > 0, excluding current listing
 */
export function calculateListingCount(
  listings: MarketAggregateListing[],
  currentListingId: string,
): number {
  return listings.filter(
    (listing) =>
      listing.status === "active" &&
      listing.quantity_available > 0 &&
      listing.listing_id !== currentListingId,
  ).length
}

/**
 * Helper function to calculate the average price of active listings.
 * Uses the same filtering as listing count calculation.
 *
 * Sub-task 3.2: Calculate average price
 * Requirements: 2.1, 2.2, 2.3, 2.4
 *
 * @param listings - Array of aggregate listings
 * @param currentListingId - ID of the current listing to exclude
 * @returns Average price of filtered listings, or null if no listings remain
 */
export function calculateAveragePrice(
  listings: MarketAggregateListing[],
  currentListingId: string,
): number | null {
  const filteredListings = listings.filter(
    (listing) =>
      listing.status === "active" &&
      listing.quantity_available > 0 &&
      listing.listing_id !== currentListingId,
  )

  if (filteredListings.length === 0) {
    return null
  }

  const totalPrice = filteredListings.reduce(
    (sum, listing) => sum + listing.price,
    0,
  )

  return totalPrice / filteredListings.length
}

/**
 * Helper function to format price with locale-specific formatting and aUEC suffix.
 * Handles null/undefined values gracefully.
 *
 * Sub-task 5.2: Implement price formatting
 * Requirements: 2.5
 *
 * @param price - Price value to format, or null/undefined
 * @param locale - User's locale from i18n
 * @returns Formatted price string with " aUEC" suffix, or null if price is null/undefined
 */
export function formatPrice(
  price: number | null | undefined,
  locale: string,
): string | null {
  if (price === null || price === undefined) {
    return null
  }

  return `${price.toLocaleString(locale)} aUEC`
}

/**
 * AggregateLink component displays a link to view all listings for the same game item.
 * Only renders when the listing has an associated game_item_id.
 */
/**
 * Compute percentage difference of listing price vs average: (listing - avg) / avg * 100.
 * Positive = listing is more expensive, negative = listing is cheaper.
 */
function percentDiff(listingPrice: number, avgPrice: number): number {
  if (avgPrice === 0) return 0
  return ((listingPrice - avgPrice) / avgPrice) * 100
}

export function AggregateLink(props: AggregateLinkProps) {
  const { listing } = props
  const { t, i18n } = useTranslation()

  if (!listing.details.game_item_id) {
    return null
  }

  const {
    data: aggregate,
    isLoading,
    error,
  } = useGetAggregateByIdQuery(listing.details.game_item_id)

  if (error) {
    return null
  }

  if (isLoading) {
    return <Skeleton variant="text" width={180} height={20} />
  }

  if (!aggregate?.listings) {
    return null
  }

  const otherListings = aggregate.listings.filter(
    (l) =>
      l.status === "active" &&
      l.quantity_available > 0 &&
      l.listing_id !== listing.listing.listing_id,
  )

  if (otherListings.length === 0) {
    return null
  }

  const avgPrice =
    otherListings.reduce((sum, l) => sum + l.price, 0) / otherListings.length
  const listingPrice = listing.listing.price
  const pct = percentDiff(listingPrice, avgPrice)
  const pctFormatted = pct >= 0 ? `+${pct.toFixed(0)}%` : `${pct.toFixed(0)}%`
  const to = `/market/aggregate/${listing.details.game_item_id}`

  const tooltipTitle = (
    <Box component="span" sx={{ display: "block" }}>
      <Typography variant="caption" component="span" display="block">
        {t("MarketListingView.tooltipThisListing", {
          defaultValue: "This listing: {{price}} aUEC",
          price: listingPrice.toLocaleString(i18n.language),
        })}
      </Typography>
      <Typography variant="caption" component="span" display="block">
        {t("MarketListingView.tooltipAvgOther", {
          defaultValue: "Average of {{count}} other listings: {{price}} aUEC",
          count: otherListings.length,
          price: avgPrice.toLocaleString(i18n.language),
        })}
      </Typography>
      <Typography variant="caption" component="span" display="block">
        {pct > 0
          ? t("MarketListingView.tooltipAboveAvg", {
              defaultValue: "{{pct}}% above average",
              pct: pct.toFixed(0),
            })
          : pct < 0
            ? t("MarketListingView.tooltipBelowAvg", {
                defaultValue: "{{pct}}% below average",
                pct: Math.abs(pct).toFixed(0),
              })
            : t("MarketListingView.tooltipAtAvg", {
                defaultValue: "At average price",
              })}
      </Typography>
      <Typography
        variant="caption"
        component="span"
        display="block"
        sx={{ mt: 0.5 }}
      >
        {t("MarketListingView.tooltipViewAll", {
          defaultValue: "Click to view all listings for this item",
        })}
      </Typography>
    </Box>
  )

  return (
    <Tooltip title={tooltipTitle} placement="top" enterDelay={300}>
      <Box component="span" sx={{ display: "inline-block" }}>
        <MaterialLink
          component={RouterLink}
          to={to}
          underline="hover"
          variant="body2"
          color="text.secondary"
        >
          {t("MarketListingView.averagePrice", {
            defaultValue: "Average price",
          })}
          : {avgPrice.toLocaleString(i18n.language)} aUEC{" "}
          <Typography
            component="span"
            variant="body2"
            color={
              pct > 0
                ? "error.main"
                : pct < 0
                  ? "success.main"
                  : "text.secondary"
            }
          >
            ({pctFormatted})
          </Typography>
        </MaterialLink>
      </Box>
    </Tooltip>
  )
}
