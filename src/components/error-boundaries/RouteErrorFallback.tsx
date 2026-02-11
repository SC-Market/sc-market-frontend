import React from "react"
import { useRouteError, isRouteErrorResponse } from "react-router-dom"
import { ErrorFallback } from "./ErrorFallback"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
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

/**
 * Error fallback component for React Router errorElement
 *
 * This component is used as the errorElement in route definitions.
 * It extracts the error from React Router's useRouteError hook
 * and displays it using the ErrorFallback component.
 */
export function RouteErrorFallback() {
  const error = useRouteError()
  const navigate = () => {
    // Reset by navigating to the same route
    window.location.reload()
  }

  // Handle React Router error responses
  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        error={new Error(error.statusText || `Error ${error.status}`)}
        resetErrorBoundary={navigate}
        isRouteError={true}
        showDetails={import.meta.env.DEV}
        title={`Error ${error.status}`}
        message={error.data?.message || error.statusText || "An error occurred"}
      />
    )
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return (
      <ErrorFallback
        error={error}
        resetErrorBoundary={navigate}
        isRouteError={true}
        showDetails={import.meta.env.DEV}
      />
    )
  }

  // Fallback for unknown error types
  return (
    <ErrorFallback
      error={new Error(String(error))}
      resetErrorBoundary={navigate}
      isRouteError={true}
      showDetails={import.meta.env.DEV}
    />
  )
}
