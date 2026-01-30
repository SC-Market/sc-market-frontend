import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material"

interface AddEmailDialogProps {
  open: boolean
  email: string
  selectedNotificationTypes: number[]
  availableNotificationTypes: Array<{
    id: number
    name: string
    description?: string
  }>
  onClose: () => void
  onEmailChange: (email: string) => void
  onNotificationTypeToggle: (typeId: number) => void
  onSubmit: () => void
}

export function AddEmailDialog({
  open,
  email,
  selectedNotificationTypes,
  availableNotificationTypes,
  onClose,
  onEmailChange,
  onNotificationTypeToggle,
  onSubmit,
}: AddEmailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Email Address</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select which notification types you want to enable:
        </Typography>
        <FormGroup>
          {availableNotificationTypes.map((type) => (
            <FormControlLabel
              key={type.id}
              control={
                <Checkbox
                  checked={selectedNotificationTypes.includes(type.id)}
                  onChange={() => onNotificationTypeToggle(type.id)}
                />
              }
              label={type.name}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Add Email
        </Button>
      </DialogActions>
    </Dialog>
  )
}
