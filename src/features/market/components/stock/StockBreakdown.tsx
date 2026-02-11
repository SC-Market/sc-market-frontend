/**
 * Stock Breakdown Component
 *
 * Displays aggregate stock information: total, available, and reserved quantities.
 *
 * Requirements: 2.1, 2.5, 3.3, 3.4, 4.4, 5.1
 */

import React from "react"
import { useTranslation } from "react-i18next"

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
import { useTheme } from '@mui/material/styles';
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
import { createTheme } from '@mui/material/styles';
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

export interface StockBreakdownProps {
  total: number
  available: number
  reserved: number
}

/**
 * StockBreakdown Component
 *
 * Shows total stock, available stock, and reserved stock with visual indicators.
 */
export function StockBreakdown({
  total,
  available,
  reserved,
}: StockBreakdownProps) {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {t("StockBreakdown.total", "Total Stock")}
        </Typography>
        <Typography variant="h5" fontWeight="medium">
          {total.toLocaleString()}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {t("StockBreakdown.available", "Available")}
        </Typography>
        <Typography variant="h5" fontWeight="medium" color="success.main">
          {available.toLocaleString()}
        </Typography>
      </Box>

      {reserved > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {t("StockBreakdown.reserved", "Reserved")}
          </Typography>
          <Typography variant="h5" fontWeight="medium" color="warning.main">
            {reserved.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Visual indicator chips */}
      <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
        <Chip
          label={`${available} ${t("StockBreakdown.availableShort", "available")}`}
          color="success"
          size="small"
          variant="outlined"
        />
        {reserved > 0 && (
          <Chip
            label={`${reserved} ${t("StockBreakdown.reservedShort", "reserved")}`}
            color="warning"
            size="small"
            variant="outlined"
          />
        )}
      </Stack>
    </Stack>
  )
}
