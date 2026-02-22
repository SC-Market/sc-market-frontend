import React, { ReactElement, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { Grid, IconButton } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import {
  StandardPageLayout,
  StandardPageLayoutProps,
} from "./StandardPageLayout"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export interface DetailPageLayoutProps extends StandardPageLayoutProps {
  // Back navigation
  backButton?: boolean
  backTo?: string

  // Entity-specific
  entityTitle?: string
  entitySubtitle?: ReactNode
  entityActions?: ReactNode
}

export function DetailPageLayout(props: DetailPageLayoutProps): ReactElement {
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()

  const {
    backButton = false,
    backTo,
    entityTitle,
    entitySubtitle,
    entityActions,
    headerTitle,
    headerActions,
    ...standardProps
  } = props

  // Handle back button click
  const handleBackClick = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  // Build entity header content
  const entityHeader = entityTitle ? (
    <div>
      {backButton && (
        <IconButton
          onClick={handleBackClick}
          aria-label="Go back"
          size="large"
          sx={{ mr: 1, ml: -1 }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>
        {entityTitle}
      </span>
      {entitySubtitle && (
        <div
          style={{
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
            marginTop: 4,
          }}
        >
          {entitySubtitle}
        </div>
      )}
    </div>
  ) : (
    headerTitle
  )

  return (
    <StandardPageLayout
      {...standardProps}
      headerTitle={entityHeader}
      headerActions={entityActions || headerActions}
    >
      {props.children}
    </StandardPageLayout>
  )
}
