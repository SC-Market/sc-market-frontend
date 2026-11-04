/**
 * BidAreaV2 — auction bid placement and bid list for V2 listings.
 */

import React, { useState } from "react"
import {
  Box,
  Button,
  Chip,
  Divider,
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
import { GavelRounded, TimerRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetAuctionDetailQuery } from "../../../../store/api/v2/market"
import { HelpLink } from "../../../help/components/HelpLink"

import { useFormatters, useNow } from "../../../../util/format"
import { usePlaceBid } from "../../hooks/usePlaceBid"
interface BidAreaV2Props {
  listingId: string
  startingPrice: number
  isOwner: boolean
}

export function BidAreaV2({ listingId, startingPrice, isOwner }: BidAreaV2Props) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const now = useNow(30_000)
  const { data: auction, refetch } = useGetAuctionDetailQuery({ listingId })
  const { bid, isLoading } = usePlaceBid(listingId)
  const [bidAmount, setBidAmount] = useState<number>(0)

  if (!auction) return null

  const currentHighest = auction.current_highest_bid ?? startingPrice
  const minBid = currentHighest + auction.min_bid_increment
  const endTime = new Date(auction.end_time)
  const isExpired = endTime.getTime() <= now
  const isActive = auction.status === "active" && !isExpired

  // Initialize bid amount to minimum
  if (bidAmount === 0 && minBid > 0) {
    setBidAmount(minBid)
  }

  const handlePlaceBid = async () => {
    if (await bid(bidAmount)) refetch()
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Auction Status */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <GavelRounded color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {t("BidAreaV2.auction", "Auction")}
            </Typography>
            <HelpLink guide="auctions">{t("BidAreaV2.howItWorks", "How bidding works")}</HelpLink>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <TimerRounded fontSize="small" color={isActive ? "warning" : "disabled"} />
            <Typography variant="body2" color={isActive ? "warning.main" : "text.disabled"}>
              {isActive
                ? t("BidAreaV2.endsIn", { time: fmt.timeUntil(endTime, now) })
                : auction.status === "concluded"
                  ? t("BidAreaV2.concluded", "Concluded")
                  : t("BidAreaV2.ended", "Ended")}
            </Typography>
          </Stack>
        </Stack>

        {/* Current Price */}
        <Box sx={{ textAlign: "center", py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t("BidAreaV2.currentBid", "Current Bid")}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {fmt.price(currentHighest)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("BidAreaV2.totalBids", { count: auction.total_bids })}
          </Typography>
        </Box>

        {/* Bid Input */}
        {isActive && !isOwner && (
          <>
            <Divider />
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                type="number"
                label={t("BidAreaV2.yourBid", "Your Bid (aUEC)")}
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                inputProps={{ min: minBid }}
                size="small"
                helperText={t("BidAreaV2.minBid", { min: fmt.price(minBid) })}
              />
              <Button
                variant="contained"
                onClick={handlePlaceBid}
                disabled={isLoading || bidAmount < minBid}
                startIcon={<GavelRounded />}
                sx={{ minWidth: 120, height: 40 }}
              >
                {t("BidAreaV2.placeBid", "Place Bid")}
              </Button>
            </Stack>
          </>
        )}

        {/* Bid History */}
        {auction.bids.length > 0 && (
          <>
            <Divider />
            <Typography variant="subtitle2" fontWeight="bold">
              {t("BidAreaV2.bidHistory", "Bid History")}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("BidAreaV2.bidder", "Bidder")}</TableCell>
                  <TableCell align="right">{t("BidAreaV2.amount", "Amount")}</TableCell>
                  <TableCell align="right">{t("BidAreaV2.time", "Time")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auction.bids.map((bid) => {
                  // The highest bid across all pages, not this page's first row.
                  const isHighest = bid.amount === auction.current_highest_bid
                  return (
                  <TableRow
                    key={bid.bid_id}
                    selected={bid.bidder.is_you}
                    aria-current={bid.bidder.is_you ? "true" : undefined}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={bid.bidder.is_you ? "bold" : "normal"}>
                          {bid.bidder.display_name}
                        </Typography>
                        {bid.bidder.is_you && (
                          <Chip label={t("BidAreaV2.isYou", "Your bid")} size="small" color="primary" variant="outlined" />
                        )}
                        {isHighest && <Chip label={t("BidAreaV2.highest", "Highest")} size="small" color="success" />}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={isHighest ? "bold" : "normal"}>
                        {fmt.price(bid.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" color="text.secondary">
                        {fmt.relative(bid.created_at, now)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </>
        )}
      </Stack>
    </Paper>
  )
}
