import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material"

interface DeleteEmailDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteEmailDialog({
  open,
  onClose,
  onConfirm,
}: DeleteEmailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Remove Email Address</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Are you sure you want to remove your email address? You will no longer
          receive email notifications.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Remove Email
        </Button>
      </DialogActions>
    </Dialog>
  )
}
