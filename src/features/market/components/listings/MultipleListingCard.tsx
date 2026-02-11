import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useTheme, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import type { ExtendedMultipleSearchResult } from "../../domain/types"
import { formatMarketMultipleUrl } from "../../domain/urls"
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
import ThemeOptions from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/Paper';
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

export function MultipleListing(props: {
  multiple: ExtendedMultipleSearchResult
  index: number
}) {
  const { multiple, index } = props
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
      <MultipleListingBase multiple={multiple} index={index} />
    </Grid>
  )
}

export function MultipleListingBase(props: {
  multiple: ExtendedMultipleSearchResult
  index: number
}) {
  const { t } = useTranslation()
  const { multiple, index } = props
  const { photo, title } = multiple
  const theme = useTheme<ExtendedTheme>()

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={formatMarketMultipleUrl(multiple)}
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
              height: 400,
              postition: "relative",
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
                ...(theme.palette.mode === "dark"
                  ? {
                      height: "100%",
                    }
                  : {
                      height: 244,
                    }),
                overflow: "hidden",
              }}
              alt={`Image of ${title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light"
                  ? {
                      display: "none",
                    }
                  : {}),
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

            <Box
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      position: "absolute",
                      bottom: 0,
                      zIndex: 4,
                    }
                  : {}),
              }}
            >
              <CardContent>
                <Typography
                  variant={"h5"}
                  color={"primary"}
                  fontWeight={"bold"}
                >
                  {t("market.starting_at", {
                    price: multiple.minimum_price.toLocaleString(undefined),
                  })}{" "}
                  aUEC
                </Typography>
                <Typography
                  variant={"subtitle2"}
                  color={"text.secondary"}
                  maxHeight={60}
                >
                  <span
                    style={{
                      lineClamp: "2",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                    }}
                  >
                    {title} ({multiple.item_type})
                  </span>{" "}
                </Typography>
                <Typography
                  display={"block"}
                  color={"text.primary"}
                  variant={"subtitle2"}
                >
                  {multiple.quantity_available.toLocaleString(undefined)}{" "}
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
