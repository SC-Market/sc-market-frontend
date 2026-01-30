import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material"

interface EditEmailDialogProps {
  open: boolean
  email: string
  onClose: () => void
  onEmailChange: (email: string) => void
  onSubmit: () => void
}

export function EditEmailDialog({
  open,
  email,
  onClose,
  onEmailChange,
  onSubmit,
}: EditEmailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Email Address</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="New Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          You will need to verify your new email address after updating.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Update Email
        </Button>
      </DialogActions>
    </Dialog>
  )
}
