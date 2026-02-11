import EmailIcon from "@mui/icons-material/Email"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

interface EmailStatusProps {
  email: string | null
  emailVerified: boolean
  isLoading: boolean
  isError: boolean
  resendCooldown: number
  onAddEmail: () => void
  onEditEmail: () => void
  onDeleteEmail: () => void
  onRequestVerification: () => void | Promise<void>
}

export function EmailStatus({
  email,
  emailVerified,
  isLoading,
  isError,
  resendCooldown,
  onAddEmail,
  onEditEmail,
  onDeleteEmail,
  onRequestVerification,
}: EmailStatusProps) {
  const { t } = useTranslation()
  const hasEmail = !!email

  if (isLoading) {
    return <CircularProgress />
  }

  if (isError) {
    return <Alert severity="error">{t("settings.email.loadError")}</Alert>
  }

  if (!hasEmail) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("settings.email.addEmailDescription")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          onClick={onAddEmail}
          sx={{ mt: 2 }}
        >
          {t("settings.email.addEmail")}
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <EmailIcon color="action" />
        <Typography variant="body1">
          {email || t("settings.email.emailConfigured")}
        </Typography>
        <Chip
          icon={
            emailVerified ? <CheckCircleIcon /> : <CancelIcon color="error" />
          }
          label={
            emailVerified
              ? t("settings.email.verified")
              : t("settings.email.notVerified")
          }
          color={emailVerified ? "success" : "warning"}
          size="small"
        />
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={onEditEmail}
        >
          {t("settings.email.updateEmail")}
        </Button>
        {!emailVerified && (
          <Button
            variant="outlined"
            size="small"
            onClick={onRequestVerification}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? t("settings.email.resendVerificationCooldown", {
                  seconds: resendCooldown,
                })
              : t("settings.email.resendVerification")}
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={onDeleteEmail}
        >
          {t("settings.email.removeEmail")}
        </Button>
      </Box>
    </Box>
  )
}
