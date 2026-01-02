/**
 * InlineEdit Component
 * Tap to edit, save on blur
 * Perfect for quick edits on mobile
 */

import {
  Box,
  IconButton,
  TextField,
  TextFieldProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import { EditRounded, CheckRounded, CloseRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface InlineEditProps {
  value: string
  onSave: (value: string) => void | Promise<void>
  onCancel?: () => void
  placeholder?: string
  multiline?: boolean
  variant?: "outlined" | "standard" | "filled"
  TextFieldProps?: TextFieldProps
  displayComponent?: React.ReactNode
  validate?: (value: string) => string | null // Returns error message or null
  autoFocus?: boolean
}

export function InlineEdit({
  value,
  onSave,
  onCancel,
  placeholder = "Click to edit",
  multiline = false,
  variant = "standard",
  TextFieldProps,
  displayComponent,
  validate,
  autoFocus = true,
}: InlineEditProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textFieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing, autoFocus])

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditValue(value)
    setError(null)
  }

  const handleSave = async () => {
    // Validate if validator provided
    if (validate) {
      const validationError = validate(editValue)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    try {
      await onSave(editValue)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
    setError(null)
    onCancel?.()
  }

  const handleBlur = () => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (textFieldRef.current?.contains(document.activeElement)) {
        return // Still focused within the component
      }
      handleSave()
    }, 100)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !multiline) {
      event.preventDefault()
      handleSave()
    } else if (event.key === "Escape") {
      event.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <Box
        ref={textFieldRef}
        sx={{
          display: "flex",
          alignItems: multiline ? "flex-start" : "center",
          gap: 1,
          width: "100%",
        }}
      >
        <TextField
          {...TextFieldProps}
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value)
            setError(null)
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          error={!!error}
          helperText={error}
          placeholder={placeholder}
          multiline={multiline}
          variant={variant}
          fullWidth
          size={isMobile ? "small" : "medium"}
          sx={{
            flex: 1,
            ...TextFieldProps?.sx,
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            mt: multiline ? 0.5 : 0,
          }}
        >
          <IconButton
            size="small"
            color="primary"
            onClick={handleSave}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur
          >
            <CheckRounded fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={handleCancel}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      onClick={handleStartEdit}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        minHeight: 40,
        width: "100%",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          borderRadius: 1,
        },
        px: 1,
        py: 0.5,
      }}
    >
      {displayComponent || (
        <Typography
          variant="body1"
          sx={{
            flex: 1,
            color: value ? "text.primary" : "text.secondary",
            fontStyle: value ? "normal" : "italic",
          }}
        >
          {value || placeholder}
        </Typography>
      )}
      <IconButton size="small" sx={{ opacity: 0.6 }}>
        <EditRounded fontSize="small" />
      </IconButton>
    </Box>
  )
}
