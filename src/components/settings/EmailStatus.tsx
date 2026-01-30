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

interface EmailStatusProps {
  email: string | null
  emailVerified: boolean
  isLoading: boolean
  isError: boolean
  resendCooldown: number
  onAddEmail: () => void
  onEditEmail: () => void
  onDeleteEmail: () => void
  onRequestVerification: () => void
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
  const hasEmail = !!email

  if (isLoading) {
    return <CircularProgress />
  }

  if (isError) {
    return (
      <Alert severity="error">
        Failed to load email settings. Please try again later.
      </Alert>
    )
  }

  if (!hasEmail) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          You haven't added an email address yet. Add one to receive email
          notifications.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          onClick={onAddEmail}
          sx={{ mt: 2 }}
        >
          Add Email Address
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
        <Typography variant="body1">{email || "Email configured"}</Typography>
        <Chip
          icon={
            emailVerified ? (
              <CheckCircleIcon />
            ) : (
              <CancelIcon color="error" />
            )
          }
          label={emailVerified ? "Verified" : "Not Verified"}
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
          Update Email
        </Button>
        {!emailVerified && (
          <Button
            variant="outlined"
            size="small"
            onClick={onRequestVerification}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Resend Verification (${resendCooldown}s)`
              : "Resend Verification"}
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={onDeleteEmail}
        >
          Remove Email
        </Button>
      </Box>
    </Box>
  )
}
