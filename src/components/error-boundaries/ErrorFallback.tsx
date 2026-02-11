import React from "react"
import { ErrorInfo } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import useTheme1 from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';

export interface ErrorFallbackProps {
  /**
   * The error that was caught
   */
  error: Error
  /**
   * Error info from React
   */
  errorInfo?: ErrorInfo | null
  /**
   * Function to reset the error boundary
   */
  resetErrorBoundary: () => void
  /**
   * Whether to show error details (useful for development)
   */
  showDetails?: boolean
  /**
   * Custom title
   */
  title?: string
  /**
   * Custom message
   */
  message?: string
  /**
   * Whether to show a "Go Home" button
   */
  showHomeButton?: boolean
  /**
   * Custom home path (defaults to "/dashboard")
   */
  homePath?: string
  /**
   * Whether this is a route-level error
   */
  isRouteError?: boolean
}

/**
 * Error Fallback component with retry functionality
 *
 * Displays a user-friendly error message with options to retry or navigate home.
 * Supports both route-level and component-level errors.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, errorInfo, reset) => (
 *     <ErrorFallback
 *       error={error}
 *       errorInfo={errorInfo}
 *       resetErrorBoundary={reset}
 *       showDetails={process.env.NODE_ENV === "development"}
 *     />
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export function ErrorFallback({
  error,
  errorInfo,
  resetErrorBoundary,
  showDetails = import.meta.env.DEV,
  title,
  message,
  showHomeButton = true,
  homePath = "/dashboard",
  isRouteError = false,
}: ErrorFallbackProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme<ExtendedTheme>()

  const defaultTitle = isRouteError
    ? t("errorBoundary.routeError.title", {
        defaultValue: "Something went wrong",
      })
    : t("errorBoundary.componentError.title", {
        defaultValue: "An error occurred",
      })

  const defaultMessage = isRouteError
    ? t("errorBoundary.routeError.message", {
        defaultValue:
          "We encountered an error while loading this page. This could be due to a temporary server issue or network problem.",
      })
    : t("errorBoundary.componentError.message", {
        defaultValue:
          "This component encountered an error. You can try again or continue using other parts of the application.",
      })

  const handleGoHome = () => {
    navigate(homePath)
    // Reset error boundary after navigation
    setTimeout(() => {
      resetErrorBoundary()
    }, 100)
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: isRouteError ? "60vh" : "300px",
        padding: { xs: 3, sm: 4, md: 6 },
        textAlign: "center",
      }}
    >
      <Alert
        severity="error"
        icon={<ReportProblemRounded />}
        sx={{
          maxWidth: 600,
          width: "100%",
          marginBottom: 3,
        }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          {title || defaultTitle}
        </AlertTitle>
        {message || defaultMessage}
      </Alert>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          width: "100%",
          maxWidth: 400,
          "& > *": {
            width: { xs: "100%", sm: "auto" },
            flex: { xs: 1, sm: "none" },
          },
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshRounded />}
          onClick={resetErrorBoundary}
          size="large"
        >
          {t("errorBoundary.retry", { defaultValue: "Try Again" })}
        </Button>

        {showHomeButton && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<HomeRounded />}
            onClick={handleGoHome}
            size="large"
          >
            {t("errorBoundary.goHome", { defaultValue: "Go Home" })}
          </Button>
        )}
      </Stack>

      {showDetails && (
        <Box
          sx={{
            marginTop: 4,
            padding: 2,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
            borderRadius: 1,
            maxWidth: 800,
            width: "100%",
            textAlign: "left",
            overflow: "auto",
            maxHeight: "400px",
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("errorBoundary.errorDetails", { defaultValue: "Error Details" })}
            :
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: "text.secondary",
            }}
          >
            {error.toString()}
            {errorInfo?.componentStack && (
              <>
                {"\n\n"}
                <strong>Component Stack:</strong>
                {"\n"}
                {errorInfo.componentStack}
              </>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
