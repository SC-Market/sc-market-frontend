/**
 * AllAllocatedLotsGrid Component
 *
 * Displays all stock lots that are currently allocated to orders
 */

import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useGetContractorAllocationsQuery } from "../../../../store/api/stockLotsApi"
import { UnderlineLink } from "../../../../components/typography/UnderlineLink"

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

export function AllAllocatedLotsGrid() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()

  const { data, isLoading } = useGetContractorAllocationsQuery(
    { contractor_spectrum_id: currentOrg?.spectrum_id || "" },
    { skip: !currentOrg?.spectrum_id },
  )

  const allocations = data?.allocations || []

  const columns: GridColDef[] = [
    {
      field: "listing_id",
      headerName: t("stock.listing", "Listing"),
      flex: 1.5,
      valueGetter: (value, row) => row.lot?.listing_id,
      renderCell: (params) => {
        const photo = params.row.lot?.photos?.[0]
        const title =
          params.row.lot?.title || params.value.substring(0, 8).toUpperCase()
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={photo}
              variant="rounded"
              sx={{ width: 32, height: 32 }}
            />
            <Link
              to={`/market/${params.value}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink>{title}</UnderlineLink>
            </Link>
          </Box>
        )
      },
    },
    {
      field: "order_id",
      headerName: t("stock.order", "Order"),
      flex: 1.5,
      renderCell: (params) => (
        <Link
          to={`/contract/${params.value}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <UnderlineLink>
            {params.row.order_title ||
              params.value.substring(0, 8).toUpperCase()}
          </UnderlineLink>
        </Link>
      ),
    },
    {
      field: "quantity",
      headerName: t("stock.quantity", "Quantity"),
      width: 120,
    },
    {
      field: "location_name",
      headerName: t("stock.location", "Location"),
      flex: 1,
      valueGetter: (value, row) => row.lot?.location?.name || "Unspecified",
    },
    {
      field: "owner",
      headerName: t("stock.user", "User"),
      flex: 1,
      valueGetter: (value, row) =>
        row.lot?.owner?.display_name || row.lot?.owner?.username || "—",
      renderCell: (params) => {
        if (!params.row.lot?.owner) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )
        }
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={params.row.lot.owner.avatar || undefined}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" color="text.secondary">
              {params.value}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: "created_at",
      headerName: t("stock.allocatedAt", "Allocated"),
      width: 150,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
  ]

  return (
    <Paper>
      <DataGrid
        rows={allocations}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.allocation_id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        slots={{
          toolbar: () => (
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="h6">
                {t("stock.allocatedStock", "Allocated Stock")}
              </Typography>
              <Chip label={allocations.length} size="small" color="primary" />
            </Box>
          ),
        }}
        showToolbar
        sx={{
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />
    </Paper>
  )
}
