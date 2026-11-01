import React from "react"
import { Link as RouterLink } from "react-router-dom"
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
  const manage = (
    <Button
      variant="outlined"
      color="primary"
      component={RouterLink}
      to={MANAGE_URL}
    >
      Manage preferences
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
              Unsubscribing...
            </Typography>
          </>
        )}

        {data.status === "success" && (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              You're unsubscribed
            </Typography>
            <Alert severity="success" sx={{ mb: 3, maxWidth: 500 }}>
              {data.message}
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {!data.all && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onUnsubscribeAll}
                  disabled={isUnsubscribingAll}
                >
                  Turn off all emails
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
              Couldn't unsubscribe
            </Typography>
            <Alert
              severity={data.status === "error" ? "error" : "warning"}
              sx={{ mb: 3, maxWidth: 500 }}
            >
              {data.message}
            </Alert>
            {manage}
          </>
        )}
      </Box>
    </Grid>
  )
}
