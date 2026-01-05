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
import { useVerifyEmailQuery } from "../../store/email"

/**
 * Email Verification Page
 * Handles email verification via token from URL
 */
export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const params = useParams<{ token?: string }>()
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading")
  const [message, setMessage] = useState<string>("")

  // Support both path parameter (/email/verify/:token) and query parameter (?token=...)
  const token = params.token || searchParams.get("token")
  const error = searchParams.get("error")
  const success = searchParams.get("success")

  // Use RTK Query to verify email (with ?json=true to get JSON response instead of redirect)
  const {
    data: verifyResult,
    isLoading: isVerifying,
    isError: verifyError,
    error: verifyErrorData,
  } = useVerifyEmailQuery(token || "", {
    skip: !token || !!success || !!error, // Skip if no token, or already have success/error from redirect
  })

  useEffect(() => {
    // If redirected from backend with success/error params (legacy support)
    if (success === "true") {
      setStatus("success")
      setMessage("Your email address has been verified successfully!")
    } else if (error) {
      setStatus("error")
      if (error === "invalid_token") {
        setMessage("Invalid or expired verification token.")
      } else if (error === "verification_failed") {
        setMessage("Email verification failed. Please try again.")
      } else {
        setMessage("An error occurred during verification.")
      }
    } else if (!token) {
      setStatus("invalid")
      setMessage("No verification token provided.")
    }
  }, [searchParams, token, error, success])

  // Handle RTK Query result
  useEffect(() => {
    if (verifyResult) {
      setStatus("success")
      setMessage(verifyResult.message || "Your email address has been verified successfully!")
    } else if (verifyError) {
      setStatus("error")
      const errorMessage =
        (verifyErrorData as any)?.data?.error?.message ||
        "Verification failed. The token may be invalid or expired."
      setMessage(errorMessage)
    } else if (isVerifying && token) {
      setStatus("loading")
    }
  }, [verifyResult, verifyError, verifyErrorData, isVerifying, token])

  return (
    <Page title="Email Verification">
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
            {(status === "loading" || isVerifying) && (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Verifying your email address...
                </Typography>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircleIcon
                  sx={{ fontSize: 60, color: "success.main", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Email Verified!
                </Typography>
                <Alert severity="success" sx={{ mb: 3, maxWidth: 500 }}>
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

            {status === "error" && (
              <>
                <ErrorIcon
                  sx={{ fontSize: 60, color: "error.main", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Verification Failed
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
