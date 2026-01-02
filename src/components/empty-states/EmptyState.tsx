import React from "react"
import { Box, Typography, Button, Stack, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export interface EmptyStateProps {
  /**
   * Main title/heading for the empty state
   */
  title: string
  /**
   * Descriptive text explaining why the state is empty
   */
  description?: string
  /**
   * Optional icon to display (Material-UI icon component)
   */
  icon?: React.ReactNode
  /**
   * Primary action button
   */
  action?: {
    label: string
    onClick: () => void
    variant?: "contained" | "outlined" | "text"
  }
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /**
   * Custom illustration/image component
   */
  illustration?: React.ReactNode
  /**
   * Additional content to display below the description
   */
  children?: React.ReactNode
  /**
   * Custom styling
   */
  sx?: object
}

/**
 * Base empty state component with consistent styling and theme support
 *
 * Provides a reusable empty state pattern with:
 * - Icon/illustration support
 * - Title and description
 * - Primary and secondary action buttons
 * - Theme-aware styling (light/dark mode)
 * - Responsive layout
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  illustration,
  children,
  sx,
}: EmptyStateProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: { xs: 3, sm: 4, md: 6 },
        minHeight: { xs: 300, sm: 400 },
        ...sx,
      }}
    >
      {/* Icon or Illustration */}
      {(icon || illustration) && (
        <Box
          sx={{
            marginBottom: 3,
            color:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(0, 0, 0, 0.4)",
            "& svg": {
              fontSize: { xs: 64, sm: 80, md: 96 },
            },
          }}
        >
          {illustration || icon}
        </Box>
      )}

      {/* Title */}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          marginBottom: description ? 1 : 3,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body1"
          sx={{
            marginBottom: action || secondaryAction || children ? 3 : 0,
            color: "text.secondary",
            maxWidth: 500,
          }}
        >
          {description}
        </Typography>
      )}

      {/* Additional content */}
      {children && (
        <Box
          sx={{
            marginBottom: action || secondaryAction ? 3 : 0,
            width: "100%",
            maxWidth: 500,
          }}
        >
          {children}
        </Box>
      )}

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            width: "100%",
            maxWidth: 400,
            "& > *": {
              width: { xs: "100%", sm: "auto" },
            },
          }}
        >
          {action && (
            <Button
              variant={action.variant || "contained"}
              color="primary"
              onClick={action.onClick}
              size="large"
              sx={{
                flex: { xs: 1, sm: "none" },
              }}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outlined"
              color="primary"
              onClick={secondaryAction.onClick}
              size="large"
              sx={{
                flex: { xs: 1, sm: "none" },
              }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  )
}
