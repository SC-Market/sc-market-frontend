import React, { useMemo } from "react"
import { Section } from "../../components/paper/Section"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { getRelativeTime } from "../../util/time"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { Order, OrderReview } from "../../datatypes/Order"
import { useTranslation } from "react-i18next"
import { ReviewRevisionButton } from "../../components/reviews/ReviewRevisionButton"
import { EditableReview } from "../../components/reviews/EditableReview"
import { useGetUserProfileQuery } from "../../store/profile"
import { UserProfileState } from "../../hooks/login/UserProfile"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { has_permission } from "../contractor/OrgRoles"
import { Contractor } from "../../datatypes/Contractor.ts"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import { GridProps } from '@mui/material/Grid';
import List from '@mui/material/List';
import TablePagination from '@mui/material/TablePagination';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ButtonGroup from '@mui/material/ButtonGroup';
import Rating from '@mui/material/Rating';
import CardActionArea from '@mui/material/CardActionArea';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Announcement from '@mui/icons-material/Announcement';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HourglassTop from '@mui/icons-material/HourglassTop';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';
import PersonRemoveRounded from '@mui/icons-material/PersonRemoveRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import PublishRounded from '@mui/icons-material/PublishRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';
import DoneRounded from '@mui/icons-material/DoneRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import StarRounded from '@mui/icons-material/StarRounded';

// Helper function to determine if current user can request revision
function canRequestRevision(
  review: OrderReview,
  currentUser: UserProfileState | undefined,
  currentOrg: Contractor | undefined | null,
  order: Order,
): boolean {
  if (!currentUser || !review) return false

  if (review.role !== "customer" && order.customer === currentUser.username) {
    return true
  }

  // Check if user is the recipient of the review
  if (
    review.role !== "contractor" &&
    order.assigned_to === currentUser.username
  ) {
    return true
  }

  if (
    review.role !== "contractor" &&
    order.contractor &&
    currentOrg &&
    order.contractor === currentOrg.spectrum_id
  ) {
    return has_permission(
      currentOrg,
      currentUser,
      "manage_orders",
      currentUser?.contractors,
    )
  }

  return false
}

// Helper function to determine if current user can edit review
function canEditReview(
  review: OrderReview,
  currentUser: UserProfileState | undefined,
  currentOrg: Contractor | null | undefined,
  order: Order,
): boolean {
  if (!currentUser || !review || !review.revision_requested) return false

  // Individual user can edit their own review
  if (review.user_author?.username === currentUser.username) return true

  // Organization member can edit org review if they have permission
  if (
    review.contractor_author &&
    order.contractor &&
    order.contractor === currentOrg?.spectrum_id
  ) {
    if (currentOrg) {
      // Check if user has manage_orders permission
      return has_permission(
        currentOrg,
        currentUser,
        "manage_orders",
        currentUser?.contractors,
      )
    }
  }

  return false
}

export function OrderReviewView(props: {
  customer?: boolean
  contractor?: boolean
  order: Order
}) {
  const { order } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: currentUser } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  const review = useMemo(
    () => (props.customer ? order.customer_review! : order.contractor_review!),
    [order.contractor_review, order.customer_review, props.customer],
  )

  return (
    <>
      <Section xs={12} title={t("orderReviewView.review")}>
        <Grid item xs={8}>
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: "1" }}>
            <MaterialLink
              component={Link}
              to={
                review.user_author
                  ? `/user/${review.user_author.username}`
                  : `/contractor/${review.contractor_author?.spectrum_id}`
              }
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink
                color={"text.primary"}
                variant={"h6"}
                sx={{
                  fontWeight: "600",
                }}
              >
                {review.user_author?.display_name ||
                  review.contractor_author!.name}
              </UnderlineLink>
            </MaterialLink>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              {getRelativeTime(new Date(review.timestamp!))}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <CardActionArea
            component={Link}
            to={
              review.user_author
                ? `/user/${review.user_author.username}`
                : `/contractor/${review.contractor_author?.spectrum_id}`
            }
          >
            <CardMedia
              component="img"
              loading="lazy"
              sx={{ width: 96, objectFit: "cover", borderRadius: 2 }}
              image={
                review.user_author
                  ? review.user_author.avatar
                  : review.contractor_author!.avatar
              }
              alt={
                review.user_author
                  ? review.user_author.display_name
                  : review.contractor_author!.name
              }
            />
          </CardActionArea>
        </Grid>
        <Grid item xs={12}>
          <Typography>{review.content}</Typography>
          <br />

          <Typography
            sx={{ textAlign: "left", verticalAlign: "middle" }}
            color={"text.secondary"}
          >
            {t("orderReviewView.ratingLabel")}
          </Typography>
          <Rating
            name="half-rating"
            defaultValue={0}
            value={review.rating}
            readOnly
            precision={0.5}
            size={"large"}
            icon={<StarRounded fontSize="inherit" />}
            emptyIcon={
              <StarRounded
                style={{ color: theme.palette.text.primary }}
                fontSize="inherit"
              />
            }
          />
        </Grid>

        {/* Review Revision Button */}
        {canRequestRevision(review, currentUser, currentOrg, order) && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <ReviewRevisionButton review={review} orderId={order.order_id} />
          </Grid>
        )}

        {/* Editable Review Component */}
        {canEditReview(review, currentUser, currentOrg, order) && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <EditableReview review={review} />
          </Grid>
        )}
      </Section>
    </>
  )
}
