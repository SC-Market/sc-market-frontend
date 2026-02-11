import { Section } from "../../../components/paper/Section"
import React, { MouseEventHandler, ReactElement, useCallback } from "react"
import {
  HeadCell,
  PaginatedTable,
} from "../../../components/table/PaginatedTable"
import {
  DatatypesMarketBid,
  MarketListing,
  UniqueListing,
} from "../domain/types"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../../util/time"
import { useAcceptBidMutation } from "../api/marketApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';
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
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

export interface BidRowProps {
  row: DatatypesMarketBid
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

export const BidsHeadCells: readonly HeadCell<DatatypesMarketBid>[] = [
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
