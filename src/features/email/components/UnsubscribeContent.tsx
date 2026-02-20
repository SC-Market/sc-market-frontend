import React from "react"
import { useNavigate } from "react-router-dom"
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
import { UnsubscribePageData } from "../hooks/usePageUnsubscribe"

interface UnsubscribeContentProps {
  data: UnsubscribePageData
  isLoading: boolean
}

export function UnsubscribeContent({
  data,
  isLoading,
}: UnsubscribeContentProps) {
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
              Processing unsubscribe request...
            </Typography>
          </>
        )}

        {data.status === "success" && (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              Unsubscribed Successfully
            </Typography>
            <Alert severity="success" sx={{ mb: 3, maxWidth: 500 }}>
              {data.message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/settings?tab=email")}
            >
              Manage Email Preferences
            </Button>
          </>
        )}

        {data.status === "error" && (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Unsubscribe Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
              {data.message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/settings?tab=email")}
            >
              Go to Email Settings
            </Button>
          </>
        )}

        {data.status === "invalid" && (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invalid Request
            </Typography>
            <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
              {data.message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/settings?tab=email")}
            >
              Go to Email Settings
            </Button>
          </>
        )}
      </Box>
    </Grid>
  )
}
