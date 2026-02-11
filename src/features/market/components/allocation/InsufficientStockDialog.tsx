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

interface InsufficientStockDialogProps {
  open: boolean
  onClose: () => void
  orderQuantity: number
  availableQuantity: number
  shortfall: number
  onAddStock?: () => void
  onAllocateUnlisted?: () => void
  onReduceOrder?: () => void
}

export function InsufficientStockDialog({
  open,
  onClose,
  orderQuantity,
  availableQuantity,
  shortfall,
  onAddStock,
  onAllocateUnlisted,
  onReduceOrder,
}: InsufficientStockDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningRounded color="warning" />
          <Typography variant="h6">Insufficient Stock</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Problem Summary */}
          <Alert severity="warning">
            <Typography variant="body2" gutterBottom>
              <strong>Cannot allocate full order quantity</strong>
            </Typography>
            <Typography variant="body2">
              The order requires {orderQuantity} units, but only{" "}
              {availableQuantity} units are available.
            </Typography>
          </Alert>

          {/* Detailed Breakdown */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Stock Breakdown
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Order Quantity:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {orderQuantity}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Available Stock:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {availableQuantity}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="error" fontWeight="medium">
                  Shortfall:
                </Typography>
                <Typography variant="body2" color="error" fontWeight="medium">
                  {shortfall}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Resolution Options */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              What would you like to do?
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {onAddStock && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onAddStock()
                    onClose()
                  }}
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="body2" fontWeight="medium">
                      Add More Stock
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create new stock lots to fulfill this order
                    </Typography>
                  </Stack>
                </Button>
              )}

              {onAllocateUnlisted && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onAllocateUnlisted()
                    onClose()
                  }}
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="body2" fontWeight="medium">
                      Use Unlisted Stock
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Allocate from unlisted stock lots if available
                    </Typography>
                  </Stack>
                </Button>
              )}

              {onReduceOrder && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onReduceOrder()
                    onClose()
                  }}
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="body2" fontWeight="medium">
                      Reduce Order Quantity
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Adjust order to match available stock ({availableQuantity}{" "}
                      units)
                    </Typography>
                  </Stack>
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}
