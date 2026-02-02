/**
 * ConcurrentModificationDialog Component
 * 
 * Handles concurrent modification conflicts detected through optimistic locking.
 * Displays the conflict and allows user to review changes and retry.
 * 
 * Requirements: 13.4
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  Divider,
} from "@mui/material"
import { SyncProblemRounded } from "@mui/icons-material"

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
              The {resourceType} has been updated since you started editing. Your changes could not be saved to prevent data loss.
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
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      {conflict.field}
                    </Typography>
                    <Stack spacing={0.5} sx={{ pl: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          Your value:
                        </Typography>
                        <Typography variant="caption" fontFamily="monospace">
                          {String(conflict.yourValue)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          Current value:
                        </Typography>
                        <Typography variant="caption" fontFamily="monospace" color="primary">
                          {String(conflict.currentValue)}
                        </Typography>
                      </Stack>
                    </Stack>
                    {index < conflictDetails.length - 1 && <Divider sx={{ mt: 1 }} />}
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
