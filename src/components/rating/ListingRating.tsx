import { MinimalUser } from "../../datatypes/User"
import { MinimalContractor } from "../../datatypes/Contractor"
import { Rating } from "../../datatypes/Contractor"
import React, { useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import {
  prioritizeBadges,
  calculateBadgesFromRating,
  BADGE_RATING_99_9,
  BADGE_RATING_99,
  BADGE_RATING_95,
  BADGE_RATING_90,
  BADGE_STREAK_PRO,
  BADGE_STREAK_GOLD,
  BADGE_STREAK_SILVER,
  BADGE_STREAK_COPPER,
  BADGE_VOLUME_PRO,
  BADGE_VOLUME_GOLD,
  BADGE_VOLUME_SILVER,
  BADGE_VOLUME_COPPER,
  BADGE_POWER_SELLER,
  BADGE_BUSY_SELLER,
  BADGE_ACTIVE_SELLER,
  BADGE_SPEED_PRO,
  BADGE_SPEED_GOLD,
  BADGE_SPEED_SILVER,
  BADGE_SPEED_COPPER,
  BADGE_CONSISTENCY_PRO,
  BADGE_CONSISTENCY_GOLD,
  BADGE_CONSISTENCY_SILVER,
  BADGE_CONSISTENCY_COPPER,
  BADGE_DONOR_PRO,
  BADGE_DONOR_GOLD,
  BADGE_DONOR_SILVER,
  BADGE_DONOR_COPPER,
  BADGE_EARLY_ADOPTER,
  BADGE_RESPONSIVE,
} from "../../util/badges"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/BoxProps';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import useTheme1 from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/FabProps';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextFieldProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { BreadcrumbsProps } from '@mui/material/BreadcrumbsProps';
import MaterialLink from '@mui/material/Link';
import { TypographyProps } from '@mui/material/TypographyProps';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { GridProps } from '@mui/material/Grid';
import { PaperProps } from '@mui/material/PaperProps';
import CardActions from '@mui/material/CardActions';
import ListItemButton from '@mui/material/ListItemButton';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';
import MuiRating from '@mui/material/Rating';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import FilterList from '@mui/icons-material/FilterList';
import AddRounded from '@mui/icons-material/AddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import MessageRounded from '@mui/icons-material/MessageRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuRounded from '@mui/icons-material/MenuRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import Info from '@mui/icons-material/Info';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import GetAppRounded from '@mui/icons-material/GetAppRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Person from '@mui/icons-material/Person';
import Business from '@mui/icons-material/Business';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import AutoGraphOutlined from '@mui/icons-material/AutoGraphOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import WhatshotRounded from '@mui/icons-material/WhatshotRounded';
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded';
import RocketLaunchRounded from '@mui/icons-material/RocketLaunchRounded';

export function ListingNameAndRating(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
  const { user, contractor } = props
  const navigate = useNavigate()
  const url = user
    ? `/user/${user?.username}`
    : `/contractor/${contractor?.spectrum_id}`

  return (
    <Box display={"flex"} alignItems={"center"} flexWrap={"wrap"} gap={0.5}>
      <Box
        component="span"
        onClick={(e) => {
          e.stopPropagation()
          navigate(url)
        }}
        sx={{
          cursor: "pointer",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <UnderlineLink variant={"subtitle2"}>
          {user?.display_name || contractor?.name}
        </UnderlineLink>
      </Box>
      <ListingSellerRating user={user} contractor={contractor} />
    </Box>
  )
}

export function ListingSellerRating(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
  const { user, contractor } = props

  return (
    <Box display={"flex"} alignItems={"center"} flexWrap={"wrap"} gap={0.5}>
      <SellerRatingStars user={user} contractor={contractor} />
      <SellerRatingCount user={user} contractor={contractor} />
    </Box>
  )
}

// New component for market listings that have rating info at the top level
export function MarketListingRating(props: {
  avg_rating: number
  rating_count: number | null
  total_rating: number
  rating_streak: number | null
  total_orders: number | null
  total_assignments: number | null
  response_rate: number | null
  badge_ids?: string[] | null
  display_limit?: number // Default: 3 for market listings
  iconSize?: string | number // Size for badge icons
  showBadges?: boolean // Whether to show badges (default: true for backward compatibility)
}) {
  const {
    avg_rating,
    rating_count,
    total_rating,
    rating_streak,
    total_orders,
    total_assignments,
    response_rate,
    badge_ids,
    display_limit = 3, // Default to 3 for market listings
    iconSize,
    showBadges = true, // Default to true for backward compatibility
  } = props

  // Create a rating object that matches the expected structure
  const rating = {
    avg_rating,
    rating_count: rating_count || 0,
    total_rating,
    streak: rating_streak || 0,
    total_orders: total_orders || 0,
    total_assignments: total_assignments || 0,
    response_rate: response_rate || 0,
  }

  // Use badge_ids if available, otherwise calculate from rating
  const allBadges = badge_ids || calculateBadgesFromRating(rating)
  const badges = prioritizeBadges(allBadges, display_limit)

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      gap={0.5}
      sx={{ lineHeight: 1, margin: 0, padding: 0 }}
    >
      <MarketRatingStars rating={rating} />
      <MarketRatingCount
        rating={rating}
        badges={showBadges ? badges : []}
        iconSize={iconSize}
      />
    </Box>
  )
}

export function SellerRatingStars(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
  const theme = useTheme<ExtendedTheme>()
  const { user, contractor } = props
  const rating = useMemo(() => {
    const avgRating =
      user?.rating.avg_rating || contractor?.rating.avg_rating || 0
    // Ratings are stored in 0-5 scale, use directly (no division needed)
    return avgRating
  }, [user, contractor])

  return (
    <MuiRating
      readOnly
      precision={0.1}
      value={rating}
      icon={<StarRounded fontSize="inherit" />}
      emptyIcon={
        <StarRounded
          style={{ color: theme.palette.text.primary }}
          fontSize="inherit"
        />
      }
      size={"small"}
    />
  )
}

export function MarketRatingStars(props: { rating: Rating }) {
  const theme = useTheme<ExtendedTheme>()
  const { rating } = props

  // Market listings use 0-5 scale from market_search view
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        lineHeight: 1,
        margin: 0,
        padding: 0,
      }}
    >
      <MuiRating
        readOnly
        precision={0.1}
        value={rating.avg_rating}
        icon={<StarRounded fontSize="inherit" />}
        emptyIcon={
          <StarRounded
            style={{ color: theme.palette.text.primary }}
            fontSize="inherit"
          />
        }
        size={"small"}
        sx={{ "& .MuiRating-icon": { fontSize: "inherit" } }}
      />
    </Box>
  )
}

export function SellerRatingCount(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
  display_limit?: number // Default: unlimited for profiles
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { user, contractor, display_limit } = props
  const rating = useMemo(
    () =>
      user?.rating ||
      contractor?.rating || {
        avg_rating: 0,
        rating_count: 0,
        streak: 0,
        total_orders: 0,
        total_assignments: 0,
        total_rating: 0,
        response_rate: 0,
      },
    [user, contractor],
  )

  // Use badge_ids if available, otherwise calculate from rating
  const badgeIds = user?.badges?.badge_ids || contractor?.badges?.badge_ids
  const allBadges = badgeIds || calculateBadgesFromRating(rating)
  const badges = prioritizeBadges(allBadges, display_limit)

  return (
    <>
      ({rating.rating_count.toLocaleString(undefined)}){" "}
      <BadgeDisplay badges={badges} />
    </>
  )
}

export function MarketRatingCount(props: {
  rating: Rating
  badges?: string[]
  iconSize?: string | number
}) {
  const { rating, badges = [], iconSize } = props

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      gap={0.5}
      sx={{ lineHeight: 1, margin: 0, padding: 0 }}
    >
      <Box component="span" sx={{ lineHeight: 1, margin: 0, padding: 0 }}>
        ({rating.rating_count.toLocaleString(undefined)})
      </Box>
      {badges.length > 0 && (
        <BadgeDisplay badges={badges} iconSize={iconSize} />
      )}
    </Box>
  )
}

// Badge display component that renders badges based on badge IDs
export function BadgeDisplay(props: {
  badges: string[]
  iconSize?: string | number
}) {
  const { badges, iconSize } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Create unique gradient ID for each instance to avoid conflicts
  const gradientId = `linearColors-${Math.random().toString(36).substr(2, 9)}`

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        alignItems: "center",
        lineHeight: 1,
        "& svg, & .MuiSvgIcon-root": {
          fontSize: iconSize || "1em",
          verticalAlign: "middle",
          display: "inline-flex",
        },
        "& > *": {
          display: "inline-flex",
          alignItems: "center",
          lineHeight: 1,
        },
      }}
    >
      {/* Rating badges */}
      {badges.includes(BADGE_RATING_99_9) && (
        <Tooltip title={t("listing.99_9PercentRating25PlusTransactions")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={gradientId}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <AutoAwesomeRounded
              sx={{
                fill: `url(#${gradientId})`,
                fontSize: "inherit",
                verticalAlign: "middle",
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_99) && (
        <Tooltip title={t("listing.99PercentRating25PlusTransactions")}>
          <AutoAwesomeRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_95) && (
        <Tooltip title={t("listing.95PercentRating25PlusTransactions")}>
          <AutoAwesomeRounded
            sx={{ color: theme.palette.common.badge.silver }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_90) && (
        <Tooltip title={t("listing.90PercentRating25PlusTransactions")}>
          <AutoGraphOutlined
            sx={{ color: theme.palette.common.badge.bronze }}
          />
        </Tooltip>
      )}

      {/* Volume badges */}
      {badges.includes(BADGE_VOLUME_PRO) && (
        <Tooltip title={t("listing.5000PlusOrdersCompleted")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-volume`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <WorkspacePremiumRounded
              sx={{
                fill: `url(#${gradientId}-volume)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_GOLD) && (
        <Tooltip title={t("listing.1000PlusOrdersCompleted")}>
          <WorkspacePremiumRounded
            sx={{ color: theme.palette.common.badge.gold }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_SILVER) && (
        <Tooltip title={t("listing.500PlusOrdersCompleted")}>
          <WorkspacePremiumRounded
            sx={{ color: theme.palette.common.badge.silver }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_COPPER) && (
        <Tooltip title={t("listing.100PlusOrdersCompleted")}>
          <WorkspacePremiumRounded
            sx={{ color: theme.palette.common.badge.bronze }}
          />
        </Tooltip>
      )}

      {/* Streak badges */}
      {badges.includes(BADGE_STREAK_PRO) && (
        <Tooltip title={t("listing.50PlusFiveStarStreak")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-streak`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <WhatshotRounded
              sx={{
                fill: `url(#${gradientId}-streak)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_GOLD) && (
        <Tooltip title={t("listing.25PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_SILVER) && (
        <Tooltip title={t("listing.15PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: theme.palette.common.badge.silver }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_COPPER) && (
        <Tooltip title={t("listing.5PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: theme.palette.common.badge.bronze }} />
        </Tooltip>
      )}

      {/* Activity badges */}
      {badges.includes(BADGE_POWER_SELLER) && (
        <Tooltip title={t("listing.20PlusOrdersLast30Days")}>
          <TrendingUpRounded sx={{ color: theme.palette.error.main }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_BUSY_SELLER) && (
        <Tooltip title={t("listing.10PlusOrdersLast30Days")}>
          <TrendingUpRounded sx={{ color: theme.palette.warning.main }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_ACTIVE_SELLER) && (
        <Tooltip title={t("listing.5PlusOrdersLast30Days")}>
          <TrendingUpRounded color={"primary"} />
        </Tooltip>
      )}

      {/* Speed badges */}
      {badges.includes(BADGE_SPEED_PRO) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan3Hours")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-speed`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <BoltRounded
              sx={{
                fill: `url(#${gradientId}-speed)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_GOLD) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan6Hours")}>
          <BoltRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_SILVER) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan12Hours")}>
          <BoltRounded sx={{ color: theme.palette.common.badge.silver }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_COPPER) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan24Hours")}>
          <BoltRounded sx={{ color: theme.palette.common.badge.bronze }} />
        </Tooltip>
      )}

      {/* Consistency badges */}
      {badges.includes(BADGE_CONSISTENCY_PRO) && (
        <Tooltip title={t("listing.activeSellerFor3PlusYears")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-consistency`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <CalendarTodayRounded
              sx={{
                fill: `url(#${gradientId}-consistency)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_GOLD) && (
        <Tooltip title={t("listing.activeSellerFor2PlusYears")}>
          <CalendarTodayRounded
            sx={{ color: theme.palette.common.badge.gold }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_SILVER) && (
        <Tooltip title={t("listing.activeSellerFor1PlusYear")}>
          <CalendarTodayRounded
            sx={{ color: theme.palette.common.badge.silver }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_COPPER) && (
        <Tooltip title={t("listing.activeSellerFor6PlusMonths")}>
          <CalendarTodayRounded
            sx={{ color: theme.palette.common.badge.bronze }}
          />
        </Tooltip>
      )}

      {/* Donor badges */}
      {badges.includes(BADGE_DONOR_PRO) && (
        <Tooltip title={t("listing.donor12PlusMonths")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-donor`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <FavoriteRounded
              sx={{
                fill: `url(#${gradientId}-donor)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_DONOR_GOLD) && (
        <Tooltip title={t("listing.donor6PlusMonths")}>
          <FavoriteRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_DONOR_SILVER) && (
        <Tooltip title={t("listing.donor3PlusMonths")}>
          <FavoriteRounded sx={{ color: theme.palette.common.badge.silver }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_DONOR_COPPER) && (
        <Tooltip title={t("listing.donor1PlusMonth")}>
          <FavoriteRounded sx={{ color: theme.palette.common.badge.bronze }} />
        </Tooltip>
      )}

      {/* Early adopter badge */}
      {badges.includes(BADGE_EARLY_ADOPTER) && (
        <Tooltip title={t("listing.earlyPlatformAdopter")}>
          <RocketLaunchRounded
            sx={{ color: theme.palette.common.badge.purple }}
          />
        </Tooltip>
      )}

      {/* Responsive badge */}
      {badges.includes(BADGE_RESPONSIVE) && (
        <Tooltip title={t("listing.responsiveBadge")}>
          <AccessTimeRounded color={"success"} />
        </Tooltip>
      )}
    </Box>
  )
}
