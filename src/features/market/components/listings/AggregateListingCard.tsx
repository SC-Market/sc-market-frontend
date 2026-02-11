import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useTheme, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import type {
  ExtendedAggregateSearchResult,
  MarketAggregate,
} from "../../domain/types"
import { useMarketSidebarExp } from "../../hooks/MarketSidebar"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import useTheme1 from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/PaperProps';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Fab from '@mui/material/Fab';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Autocomplete from '@mui/material/Autocomplete';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded';

export function AggregateListing(props: {
  aggregate: ExtendedAggregateSearchResult
  index: number
}) {
  const { aggregate, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      sm={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={marketSidebarOpen ? 4 : 3}
      xxl={marketSidebarOpen ? 4.8 : 2.4}
      sx={{ transition: "0.3s" }}
    >
      <AggregateListingBase aggregate={aggregate} index={index} />
    </Grid>
  )
}

export function AggregateListingBase(props: {
  aggregate: ExtendedAggregateSearchResult
  index: number
}) {
  const { t } = useTranslation()
  const { aggregate, index } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { minimum_price, photo, quantity_available, title } = aggregate

  const cardHeight = isMobile ? 300 : 400
  const mediaHeight =
    theme.palette.mode === "dark" ? "100%" : isMobile ? 150 : 244

  const contentSx =
    theme.palette.mode === "dark"
      ? { position: "absolute" as const, bottom: 0, zIndex: 4 }
      : {}

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={`/market/aggregate/${aggregate.game_item_id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea
          sx={{
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: (theme) =>
                theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
              height: cardHeight,
              position: "relative",
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={photo || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                width: "100%",
                objectFit: "cover",
                aspectRatio: "16/9",
                ...(theme.palette.mode === "dark"
                  ? { height: "100%" }
                  : { height: mediaHeight }),
                overflow: "hidden",
              }}
              alt={`Image of ${title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: (theme) =>
                  theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
                background: `linear-gradient(to bottom, transparent, transparent 25%, ${theme.palette.background.sidebar}AA 40%, ${theme.palette.background.sidebar} 100%)`,
              }}
            />

            <Box sx={contentSx}>
              <CardContent
                sx={
                  isMobile
                    ? {
                        padding: "8px 12px !important",
                        "&:last-child": { pb: 1 },
                      }
                    : undefined
                }
              >
                <Typography
                  variant={isMobile ? "body1" : "h5"}
                  color="primary"
                  fontWeight="bold"
                  sx={isMobile ? { fontSize: "0.95rem", mb: 0.5 } : undefined}
                >
                  {minimum_price.toLocaleString(undefined)} aUEC
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    ...(isMobile
                      ? {
                          fontSize: "0.75rem",
                          lineHeight: 1.3,
                          maxHeight: 36,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          mb: 0.5,
                        }
                      : { maxHeight: 60 }),
                  }}
                >
                  {aggregate.title} ({aggregate.item_type})
                </Typography>
                <Typography
                  display="block"
                  color="text.primary"
                  variant="subtitle2"
                  sx={
                    isMobile
                      ? { fontSize: "0.7rem", lineHeight: 1.2 }
                      : undefined
                  }
                >
                  {quantity_available.toLocaleString(undefined)}{" "}
                  {t("market.total_available")}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}

export function AggregateBuyOrderListing(props: {
  aggregate: MarketAggregate
  index: number
}) {
  const { aggregate, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      sm={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={marketSidebarOpen ? 4 : 3}
      xxl={marketSidebarOpen ? 4.8 : 2.4}
      sx={{ transition: "0.3s" }}
    >
      <AggregateBuyOrderListingBase aggregate={aggregate} index={index} />
    </Grid>
  )
}

export function AggregateBuyOrderListingBase(props: {
  aggregate: MarketAggregate
  index: number
}) {
  const { t } = useTranslation()
  const { aggregate, index } = props
  const { details, photos } = aggregate
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const maximum_price = useMemo(
    () =>
      aggregate.buy_orders.length
        ? (aggregate.buy_orders.reduce((prev, curr) =>
            (prev.price ?? 0) > (curr.price ?? 0) ? prev : curr,
          ).price ?? 0)
        : 0,
    [aggregate.buy_orders],
  )
  const minimum_price = useMemo(
    () =>
      aggregate.buy_orders.length
        ? (aggregate.buy_orders.reduce((prev, curr) =>
            (prev.price ?? 0) < (curr.price ?? 0) ? prev : curr,
          ).price ?? 0)
        : 0,
    [aggregate.buy_orders],
  )
  const sum_requested = useMemo(
    () => aggregate.buy_orders.reduce((prev, curr) => prev + curr.quantity, 0),
    [aggregate.buy_orders],
  )

  const cardHeight = isMobile ? 300 : 400
  const mediaHeight =
    theme.palette.mode === "dark" ? "100%" : isMobile ? 150 : 244
  const contentSx =
    theme.palette.mode === "dark"
      ? { position: "absolute" as const, bottom: 0, zIndex: 4 }
      : {}

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={`/market/aggregate/${aggregate.details.game_item_id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea
          sx={{
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: (theme) =>
                theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
              height: cardHeight,
              position: "relative",
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={photos[0] || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                ...(theme.palette.mode === "dark"
                  ? { height: "100%" }
                  : { height: mediaHeight }),
                overflow: "hidden",
              }}
              alt={`Image of ${details.title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: (theme) =>
                  theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
                background: `linear-gradient(to bottom, transparent, transparent 25%, ${theme.palette.background.sidebar}AA 40%, ${theme.palette.background.sidebar} 100%)`,
              }}
            />

            <Box sx={contentSx}>
              <CardContent
                sx={
                  isMobile
                    ? {
                        padding: "8px 12px !important",
                        "&:last-child": { pb: 1 },
                      }
                    : undefined
                }
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  color="primary"
                  fontWeight="bold"
                  sx={isMobile ? { fontSize: "0.95rem", mb: 0.5 } : undefined}
                >
                  {minimum_price.toLocaleString(undefined)} -{" "}
                  {maximum_price.toLocaleString(undefined)} aUEC/
                  {t("market.unit")}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    ...(isMobile
                      ? {
                          fontSize: "0.75rem",
                          lineHeight: 1.3,
                          maxHeight: 36,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          mb: 0.5,
                        }
                      : { maxHeight: 60 }),
                  }}
                >
                  {details.title} ({details.item_type})
                </Typography>
                <Typography
                  display="block"
                  color="text.primary"
                  variant="subtitle2"
                  sx={
                    isMobile
                      ? { fontSize: "0.7rem", lineHeight: 1.2 }
                      : undefined
                  }
                >
                  {sum_requested.toLocaleString(undefined)}{" "}
                  {t("market.total_requested")}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}
