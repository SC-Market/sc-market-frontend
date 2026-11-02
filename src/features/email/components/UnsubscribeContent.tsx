import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { UnsubscribePageData } from "../hooks/usePageUnsubscribe"
import { PATHS } from "../../../routes/paths"

interface UnsubscribeContentProps {
  data: UnsubscribePageData
  isLoading: boolean
  onUnsubscribeAll: () => void
  isUnsubscribingAll: boolean
}

/** Settings → Notifications (asks to sign in when signed out). */
const MANAGE_URL = `${PATHS.settings}?tab=notifications`

export function UnsubscribeContent({
  data,
  isLoading,
  onUnsubscribeAll,
  isUnsubscribingAll,
}: UnsubscribeContentProps) {
  const { t } = useTranslation()
  const manage = (
    <Button
      variant="outlined"
      color="primary"
      component={RouterLink}
      to={MANAGE_URL}
    >
      {t("emailUi.unsubscribe.managePreferences")}
    </Button>
  )

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
              {t("emailUi.unsubscribe.unsubscribing")}
            </Typography>
          </>
        )}

        {data.status === "success" && (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {t("emailUi.unsubscribe.successTitle")}
            </Typography>
            <Alert severity="success" sx={{ mb: 3, maxWidth: 500 }}>
              {data.messageKey ? t(data.messageKey) : data.message}
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {!data.all && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onUnsubscribeAll}
                  disabled={isUnsubscribingAll}
                >
                  {t("emailUi.unsubscribe.turnOffAll")}
                </Button>
              )}
              {manage}
            </Stack>
          </>
        )}

        {(data.status === "error" || data.status === "invalid") && (
          <>
            <ErrorIcon
              sx={{
                fontSize: 60,
                color: data.status === "error" ? "error.main" : "warning.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom>
              {t("emailUi.unsubscribe.failedTitle")}
            </Typography>
            <Alert
              severity={data.status === "error" ? "error" : "warning"}
              sx={{ mb: 3, maxWidth: 500 }}
            >
              {data.messageKey ? t(data.messageKey) : data.message}
            </Alert>
            {manage}
          </>
        )}
      </Box>
    </Grid>
  )
}
