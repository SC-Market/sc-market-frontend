import { Section } from "../../components/paper/Section"
import React, { MouseEventHandler, ReactElement, useCallback } from "react"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { Button, TableCell, TableRow, Typography } from "@mui/material"
import {
  MarketBid,
  MarketListing,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../util/time"
import { useAcceptBidMutation } from "../../store/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export interface BidRowProps {
  row: MarketBid
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}

export function BidRow(props: BidRowProps): ReactElement {
  const { row, index, isItemSelected } = props // TODO: Add `assigned_to` column
  const { i18n } = useTranslation()

  return (
    <TableRow
      hover
      // onClick={onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={index}
      selected={isItemSelected}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <TableCell>
        {
          <Link
            to={`/user/${row.user_bidder?.username}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <UnderlineLink
              color={"text.secondary"}
              variant={"subtitle1"}
              noWrap
            >
              {row.user_bidder?.username}
            </UnderlineLink>
          </Link>
        }
      </TableCell>

      <TableCell align={"right"}>
        {getRelativeTime(new Date(row.timestamp))}
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"} color={"text.primary"}>
          {row.bid.toLocaleString(i18n.language)} aUEC
        </Typography>
      </TableCell>

      {/*<TableCell align={'right'}>*/}
      {/*    <Button color={'primary'} variant={'outlined'} onClick={handleAcceptBid}>*/}
      {/*        Accept*/}
      {/*    </Button>*/}
      {/*</TableCell>*/}
    </TableRow>
  )
}

export const BidsHeadCells: readonly HeadCell<MarketBid>[] = [
  {
    id: "user_bidder",
    numeric: false,
    disablePadding: false,
    label: "Bidder",
    minWidth: 135,
  },
  {
    id: "timestamp",
    numeric: false,
    disablePadding: false,
    label: "",
  },
  {
    id: "bid",
    numeric: true,
    disablePadding: false,
    label: "Bid",
    minWidth: 135,
  },
  // {
  //     id: 'bid_id',
  //     numeric: false,
  //     disablePadding: false,
  //     label: '',
  // },
]

export function Bids(props: { listing: UniqueListing }) {
  const { listing } = props

  const [past, setPast] = React.useState(false)

  // const rows = useMemo(() => {
  //     return (listing.bids || []).filter(o => {
  //         if (active || !past) {
  //             return !['fulfilled', 'cancelled'].includes(o.status)
  //         }
  //         // if (past) {
  //         //     return ['fulfilled', 'cancelled'].includes(o.status)
  //         // }
  //
  //         return true
  //     })
  // }, [listing.])

  return (
    <Section xs={12} md={12} lg={12} xl={12} title={"Bids"} disablePadding>
      <PaginatedTable
        rows={listing.bids || []}
        initialSort={"bid"}
        generateRow={BidRow}
        keyAttr={"bid_id"}
        headCells={BidsHeadCells}
        disableSelect
      />
    </Section>
  )
}
