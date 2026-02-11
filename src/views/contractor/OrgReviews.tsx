import React, { MouseEventHandler, useCallback, useMemo } from "react"
import { MinimalUser } from "../../datatypes/User"
import { Link } from "react-router-dom"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { useGetContractorReviewsQuery } from "../../store/contractor"
import { Contractor, MinimalContractor } from "../../datatypes/Contractor"
import { OrderReview } from "../../datatypes/Order"
import { useGetUserOrderReviews } from "../../store/profile"
import { styled, useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { amber } from "@mui/material/colors"
import {
  SellerRatingStars,
  SellerRatingCount,
} from "../../components/rating/ListingRating"
import { useTranslation } from "react-i18next"
import { EmptyReviews } from "../../components/empty-states"
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';

function ReviewRow(props: {
  row: OrderReview
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { row, onClick, isItemSelected, labelId } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const formatDate = useCallback(
    (date: number) =>
      Intl.DateTimeFormat("default", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date)),
    [],
  )

  return (
    <>
      <TableRow
        hover
        onClick={onClick}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.user_author?.username || row.contractor_author!.spectrum_id}
        selected={isItemSelected}
      >
        <TableCell component="th" id={labelId} scope="row">
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item>
              <Avatar
                src={row.user_author?.avatar || row.contractor_author!.avatar}
              />
            </Grid>
            <Grid item>
              <Link
                to={
                  row.user_author
                    ? `/user/${row.user_author.username}`
                    : `/user/${row.contractor_author!.spectrum_id}`
                }
              >
                <UnderlineLink
                  color={"text.secondary"}
                  variant={"subtitle1"}
                  fontWeight={"bold"}
                >
                  {row.user_author?.username ||
                    row.contractor_author!.spectrum_id}
                </UnderlineLink>
              </Link>
              <Typography variant={"subtitle2"}>
                {row.user_author?.display_name || row.contractor_author!.name}
              </Typography>
            </Grid>
          </Grid>
          <Typography variant={"subtitle1"}>
            <Rating
              readOnly
              precision={0.5}
              value={row.rating}
              icon={<StarRounded fontSize="inherit" />}
              emptyIcon={
                <StarRounded
                  style={{ color: theme.palette.text.primary }}
                  fontSize="inherit"
                />
              }
            />
          </Typography>
        </TableCell>
        <TableCell align={"right"}>
          <Box
            sx={{
              height: "100%",
              "-webkit-box-orient": "vertical",
              display: "-webkit-box",
              "-webkit-line-clamp": "3",
              lineClamp: "3",
              textOverflow: "ellipsis",
              // whiteSpace: "pre-line",
              overflow: "hidden",
            }}
          >
            <Typography variant={"subtitle2"} color={"text.secondary"}>
              {formatDate(row.timestamp)}
            </Typography>
            <Typography variant={"subtitle1"}>{row.content}</Typography>
          </Box>
        </TableCell>
      </TableRow>
    </>
  )
}

const headCells: readonly HeadCell<OrderReview>[] = [
  // {
  //     id: 'author',
  //     numeric: false,
  //     disablePadding: false,
  //     label: 'Username',
  //     minWidth: 260,
  // },
  {
    id: "rating",
    numeric: false,
    disablePadding: false,
    label: "orderReviewView.ratingLabel",
  },
  {
    id: "content",
    numeric: true,
    disablePadding: false,
    label: "orderReviewView.review",
  },
]

export function OrgReviews(props: { contractor: MinimalContractor }) {
  const { t } = useTranslation()
  const { data: rows } = useGetContractorReviewsQuery(
    props.contractor.spectrum_id,
  )

  return (
    <React.Fragment>
      <PaginatedTable<OrderReview>
        rows={rows || []}
        initialSort={"timestamp"}
        generateRow={ReviewRow}
        keyAttr={"review_id"}
        headCells={headCells.map((cell) => ({
          ...cell,
          label: t(cell.label),
        }))}
        disableSelect
      />
    </React.Fragment>
  )
}

export function UserReviews(props: { user: MinimalUser }) {
  const { t } = useTranslation()
  const {
    data: rows,
    isLoading,
    isFetching,
  } = useGetUserOrderReviews(props.user.username)

  if (isLoading || isFetching) {
    // Show skeleton while loading - PaginatedTable doesn't have loading prop
    return (
      <Grid item xs={12}>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t("common.loading", { defaultValue: "Loading..." })}
          </Typography>
        </Box>
      </Grid>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyReviews isUser={true} />
      </Grid>
    )
  }

  return (
    <React.Fragment>
      <PaginatedTable<OrderReview>
        rows={rows || []}
        initialSort={"timestamp"}
        generateRow={ReviewRow}
        keyAttr={"review_id"}
        headCells={headCells.map((cell) => ({
          ...cell,
          label: t(cell.label),
        }))}
        disableSelect
      />
    </React.Fragment>
  )
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => {
  const extendedTheme = theme as ExtendedTheme
  return {
    height: 10,
    borderRadius: theme.spacing(extendedTheme.borderRadius.input),
    width: "95%",
    display: "inline",
    flexGrow: "1",
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: theme.spacing(extendedTheme.borderRadius.input),
      backgroundColor: amber[500],
    },
  }
})

export function ReviewSummaryArea(props: {
  reviews: OrderReview[]
  target: MinimalContractor | MinimalUser
}) {
  const { reviews, target } = props
  const { t } = useTranslation()
  const counts = useMemo(() => {
    const vals = [0, 0, 0, 0, 0]
    reviews.forEach((item) => {
      if (+item.rating) {
        vals[5 - Math.ceil(+item.rating)] += 1
      }
    })

    const max = vals.reduce((x, y) => (x > y ? x : y))

    return vals.map((v) => (v / max) * 100)
  }, [reviews])

  return (
    <Grid item xs={12} lg={4} sx={{ padding: 1 }}>
      <Box display={"flex"} sx={{ maxWidth: 800, width: "100%", marginTop: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: "3",

            "& > *": {
              width: "100%",
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          {counts.map((d, i) => (
            <Box key={i}>
              {5 - i}&nbsp;&nbsp;
              <BorderLinearProgress variant="determinate" value={d || 0} />
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            minWidth: 100,
          }}
        >
          <Typography variant={"h3"}>
            {target.rating.avg_rating.toFixed(1)}
          </Typography>
          <SellerRatingStars
            contractor={target as Contractor}
            user={target as MinimalUser}
          />
          <SellerRatingCount
            contractor={target as Contractor}
            user={target as MinimalUser}
            display_limit={undefined}
          />
          <Typography variant={"body1"} color={"text.primary"}>
            {target.rating.rating_count} {t("orderReviewArea.review")}
            {target.rating.rating_count !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>
    </Grid>
  )
}

export function ContractorReviewSummary(props: {
  contractor: MinimalContractor
}) {
  const { data: rows } = useGetContractorReviewsQuery(
    props.contractor.spectrum_id,
  )

  return <ReviewSummaryArea reviews={rows || []} target={props.contractor} />
}

export function UserReviewSummary(props: { user: MinimalUser }) {
  const { data: rows } = useGetUserOrderReviews(props.user.username)

  return <ReviewSummaryArea reviews={rows || []} target={props.user} />
}
