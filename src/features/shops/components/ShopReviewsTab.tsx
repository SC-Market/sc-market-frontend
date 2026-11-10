import { Link } from "react-router-dom"
import {
  Box,
  Grid,
  Rating,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { useTheme } from "@mui/material/styles"
import { StarRounded } from "@mui/icons-material"
import {
  useGetShopReviewsQuery,
  ShopPublicResponse,
} from "../../../store/api/v2/market"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  HeadCell,
  PaginatedTable,
} from "../../../components/table/PaginatedTable"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useMemo, MouseEventHandler } from "react"
import { EmptyReviews } from "../../../components/empty-states"
import { USER_PATHS } from "../../../routes/paths"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../../util/format"

export interface ShopReviewRow {
  review_id: string
  rating: number
  comment: string
  created_at: string
  author: {
    avatar: string | null
    display_name: string
    username: string
    user_id: string
  }
  timestamp: number
}

export const shopReviewHeadCells: readonly HeadCell<ShopReviewRow>[] = [
  {
    id: "rating",
    numeric: false,
    disablePadding: false,
    label: "shops.profile.headRating",
  },
  {
    id: "comment",
    numeric: true,
    disablePadding: false,
    label: "shops.profile.headReview",
  },
]

export function ShopReviewRow(props: {
  row: ShopReviewRow
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { row, onClick, isItemSelected, labelId } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const fmt = useFormatters()

  return (
    <TableRow
      hover
      onClick={onClick}
      tabIndex={-1}
      key={row.author.username}
      selected={isItemSelected}
    >
      <TableCell component="th" id={labelId} scope="row">
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item>
            <Link to={USER_PATHS.profile(row.author.username)}>
              <ImageAvatar
                src={row.author.avatar || undefined}
                alt={t("accessibility.userAvatar", "Avatar of {{username}}", {
                  username: row.author.username,
                })}
              />
            </Link>
          </Grid>
          <Grid item>
            <Link to={USER_PATHS.profile(row.author.username)}>
              <UnderlineLink
                color="text.secondary"
                variant="subtitle1"
                fontWeight="bold"
              >
                {row.author.username}
              </UnderlineLink>
            </Link>
            <Typography variant="subtitle2">
              {row.author.display_name}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="subtitle1">
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
      <TableCell align="right">
        <Box
          sx={{
            height: "100%",
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
            WebkitLineClamp: "3",
            lineClamp: "3",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {fmt.date(row.timestamp, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
          <Typography variant="subtitle1">{row.comment}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  )
}

export function ShopReviewsTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const { t } = useTranslation()
  const { data: reviewsData, isLoading } = useGetShopReviewsQuery({
    shopId: shop.shop_id,
    pageSize: 200,
  })

  const rows: ShopReviewRow[] = useMemo(() => {
    if (!reviewsData?.reviews) return []
    return reviewsData.reviews.map((r) => ({
      ...r,
      timestamp: new Date(r.created_at).getTime(),
    }))
  }, [reviewsData])

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t("shops.profile.loading")}
        </Typography>
      </Box>
    )
  }

  if (!rows.length) {
    return (
      <Grid container>
        <Grid item xs={12}>
          <EmptyReviews
            title={t("shops.profile.noReviews")}
            description={t("shops.profile.noReviewsBody")}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <PaginatedTable<ShopReviewRow>
      rows={rows}
      initialSort="timestamp"
      initialSortDirection="desc"
      generateRow={ShopReviewRow}
      keyAttr="review_id"
      headCells={shopReviewHeadCells}
      disableSelect
    />
  )
}
