import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams, useParams } from "react-router-dom"
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Container,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import {
  useUnsubscribeMutation,
  useGetEmailPreferencesQuery,
} from "../../features/email"

/**
 * Unsubscribe Page
 * Handles email unsubscribe via token from URL
 */
export function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const params = useParams<{ token?: string }>()
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading")
  const [message, setMessage] = useState<string>("")

  // Support both path parameter (/email/unsubscribe/:token) and query parameter (?token=...)
  const token = params.token || searchParams.get("token")
  const error = searchParams.get("error")
  const success = searchParams.get("success")

  // Use RTK Query mutation to unsubscribe
  const [
    unsubscribe,
    {
      isLoading: isUnsubscribing,
      isError: unsubscribeError,
      error: unsubscribeErrorData,
    },
  ] = useUnsubscribeMutation()

  // Refetch preferences after unsubscribe to ensure cache is updated
  const { refetch: refetchPreferences } = useGetEmailPreferencesQuery(
    undefined,
    {
      skip: true, // Don't auto-fetch, only refetch when needed
    },
  )

  useEffect(() => {
    // If redirected from backend with success/error params (legacy support)
    if (success === "true") {
      setStatus("success")
      setMessage(
        "You have been successfully unsubscribed from all email notifications.",
      )
    } else if (error) {
      setStatus("error")
      if (error === "invalid_token") {
        setMessage("Invalid unsubscribe token.")
      } else if (error === "already_used") {
        setMessage("This unsubscribe link has already been used.")
      } else if (error === "unsubscribe_failed") {
        setMessage("Unsubscribe failed. Please try again.")
      } else {
        setMessage("An error occurred during unsubscribe.")
      }
    } else if (token && !success && !error) {
      // Trigger unsubscribe mutation when token is present
      unsubscribe(token)
        .unwrap()
        .then(async (result) => {
          console.log("Unsubscribe success result:", result)
          // Refetch preferences to ensure cache is updated
          await refetchPreferences()
          setStatus("success")
          setMessage(
            result?.message ||
              "You have been successfully unsubscribed from all email notifications.",
          )
        })
        .catch((err) => {
          console.error("Unsubscribe error caught:", err)
          setStatus("error")
          // Check if error has the expected structure
          // Sometimes RTK Query wraps errors differently
          const errorMessage =
            err?.data?.error?.message ||
            err?.data?.message ||
            err?.error?.message ||
            err?.message ||
            (typeof err === "string"
              ? err
              : "Unsubscribe failed. The token may be invalid or already used.")
          setMessage(errorMessage)
        })
    } else if (!token) {
      setStatus("invalid")
      setMessage("No unsubscribe token provided.")
    }
  }, [searchParams, token, error, success, unsubscribe])

  return (
    <Page title="Unsubscribe from Emails">
      <ContainerGrid sidebarOpen={true} maxWidth="sm">
        <Container>
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
            {status === "loading" && (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Processing unsubscribe request...
                </Typography>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircleIcon
                  sx={{ fontSize: 60, color: "success.main", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Unsubscribed Successfully
                </Typography>
                <Alert severity="success" sx={{ mb: 3, maxWidth: 500 }}>
                  {message}
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

            {status === "error" && (
              <>
                <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Unsubscribe Failed
                </Typography>
                <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
                  {message}
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

            {status === "invalid" && (
              <>
                <ErrorIcon
                  sx={{ fontSize: 60, color: "warning.main", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Invalid Request
                </Typography>
                <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
                  {message}
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
        </Container>
      </ContainerGrid>
    </Page>
  )
}
