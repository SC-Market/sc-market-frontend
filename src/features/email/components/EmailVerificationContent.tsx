import React from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Grid,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { EmailVerificationPageData } from "../hooks/usePageEmailVerification"

interface EmailVerificationContentProps {
  data: EmailVerificationPageData
  isLoading: boolean
}

export function EmailVerificationContent({
  data,
  isLoading,
}: EmailVerificationContentProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Grid item xs={12}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          textAlign: "center",
        }}
      >
        {(data.status === "loading" || isLoading) && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              {t("emailUi.verification.verifying")}
            </Typography>
          </>
        )}

        {data.status === "success" && (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {t("emailUi.verification.successTitle")}
            </Typography>
            <Alert severity="success" sx={{ mb: 3, maxWidth: 500 }}>
              {data.messageKey ? t(data.messageKey) : data.message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/settings?tab=email")}
            >
              {t("emailUi.verification.goToSettings")}
            </Button>
          </>
        )}

        {data.status === "error" && (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {t("emailUi.verification.failedTitle")}
            </Typography>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
              {data.messageKey ? t(data.messageKey) : data.message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/settings?tab=email")}
            >
              {t("emailUi.verification.goToSettings")}
            </Button>
          </>
        )}

        {data.status === "invalid" && (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {t("emailUi.verification.invalidTitle")}
            </Typography>
            <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
              {data.messageKey ? t(data.messageKey) : data.message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/settings?tab=email")}
            >
              {t("emailUi.verification.goToSettings")}
            </Button>
          </>
        )}
      </Box>
    </Grid>
  )
}
