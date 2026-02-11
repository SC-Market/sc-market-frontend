import { useTranslation } from "react-i18next"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

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
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("settings.email.addEmailDialog.title")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t("settings.email.emailAddress")}
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("settings.email.addEmailDialog.selectNotificationTypes")}
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
        <Button onClick={onClose}>{t("accessibility.cancel")}</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          {t("settings.email.addEmailDialog.add")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
