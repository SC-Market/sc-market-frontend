import React, { ReactElement, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { Grid, IconButton } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { StandardPageLayout, StandardPageLayoutProps } from "./StandardPageLayout"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export interface FormPageLayoutProps extends StandardPageLayoutProps {
  // Form-specific
  formTitle: string
  backButton?: boolean
  submitButton?: ReactNode
  cancelButton?: ReactNode
}

export function FormPageLayout(
  props: FormPageLayoutProps,
): ReactElement {
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()

  const {
    formTitle,
    backButton = false,
    submitButton,
    cancelButton,
    headerTitle,
    headerActions,
    maxWidth = "lg",
    ...standardProps
  } = props

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1)
  }

  // Build the form header with back button
  const formHeader = (
    <Grid container spacing={theme.layoutSpacing?.layout ?? 1} alignItems="center">
      {backButton && (
        <Grid item>
          <IconButton
            onClick={handleBackClick}
            aria-label="Go back"
            size="large"
          >
            <ArrowBackIcon />
          </IconButton>
        </Grid>
      )}

      <Grid item xs>
        <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          {formTitle}
        </div>
      </Grid>
    </Grid>
  )

  // Build form actions
  const formActions = (submitButton || cancelButton) && (
    <Grid container spacing={theme.layoutSpacing?.component ?? 1.5} justifyContent="flex-end">
      {cancelButton && (
        <Grid item>
          {cancelButton}
        </Grid>
      )}
      {submitButton && (
        <Grid item>
          {submitButton}
        </Grid>
      )}
    </Grid>
  )

  return (
    <StandardPageLayout
      {...standardProps}
      maxWidth={maxWidth}
      headerTitle={formHeader}
      headerActions={headerActions}
    >
      {props.children}
      
      {/* Form actions at the bottom */}
      {formActions && (
        <Grid item xs={12} style={{ marginTop: theme.spacing(3) }}>
          {formActions}
        </Grid>
      )}
    </StandardPageLayout>
  )
}
