import { useTranslation } from "react-i18next"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
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
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("settings.email.editEmailDialog.title")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t("settings.email.editEmailDialog.newEmailLabel")}
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t("settings.email.editEmailDialog.verificationNote")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("accessibility.cancel")}</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          {t("settings.email.editEmailDialog.update")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
