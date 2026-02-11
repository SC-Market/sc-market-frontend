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

interface ConcurrentModificationDialogProps {
  open: boolean
  onClose: () => void
  onRetry: () => void
  resourceType?: string
  conflictDetails?: {
    field: string
    yourValue: any
    currentValue: any
  }[]
}

export function ConcurrentModificationDialog({
  open,
  onClose,
  onRetry,
  resourceType = "resource",
  conflictDetails,
}: ConcurrentModificationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <SyncProblemRounded color="warning" />
          <Typography variant="h6">Concurrent Modification Detected</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Problem Summary */}
          <Alert severity="warning">
            <Typography variant="body2" gutterBottom>
              <strong>This {resourceType} was modified by another user</strong>
            </Typography>
            <Typography variant="body2">
              The {resourceType} has been updated since you started editing.
              Your changes could not be saved to prevent data loss.
            </Typography>
          </Alert>

          {/* Conflict Details */}
          {conflictDetails && conflictDetails.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Conflicting Changes
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                {conflictDetails.map((conflict, index) => (
                  <Box key={index}>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      gutterBottom
                    >
                      {conflict.field}
                    </Typography>
                    <Stack spacing={0.5} sx={{ pl: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: 80 }}
                        >
                          Your value:
                        </Typography>
                        <Typography variant="caption" fontFamily="monospace">
                          {String(conflict.yourValue)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: 80 }}
                        >
                          Current value:
                        </Typography>
                        <Typography
                          variant="caption"
                          fontFamily="monospace"
                          color="primary"
                        >
                          {String(conflict.currentValue)}
                        </Typography>
                      </Stack>
                    </Stack>
                    {index < conflictDetails.length - 1 && (
                      <Divider sx={{ mt: 1 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Resolution Instructions */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              What happens next?
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                • The latest data will be loaded automatically
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You can review the current values
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Make your changes again and retry
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            onRetry()
            onClose()
          }}
          variant="contained"
        >
          Reload and Retry
        </Button>
      </DialogActions>
    </Dialog>
  )
}
