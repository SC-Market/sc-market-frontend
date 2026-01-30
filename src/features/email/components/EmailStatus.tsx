import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { useTranslation } from "react-i18next"

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
    return (
      <Alert severity="error">
        {t("settings.email.loadError")}
      </Alert>
    )
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
            emailVerified ? (
              <CheckCircleIcon />
            ) : (
              <CancelIcon color="error" />
            )
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
