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

  // Build the header content with entity information
  const detailHeader = (
    <Grid
      container
      spacing={theme.layoutSpacing.layout}
      alignItems="center"
      justifyContent="space-between"
    >
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

      <Grid item xs={12} sm style={{ minWidth: 0 }}>
        {entityTitle && (
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
              {entityTitle}
            </div>
            {entitySubtitle && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: theme.palette.text.secondary,
                }}
              >
                {entitySubtitle}
              </div>
            )}
          </div>
        )}
        {!entityTitle && headerTitle}
      </Grid>

      {entityActions && (
        <Grid
          item
          xs={12}
          sm="auto"
          sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" } }}
        >
          {entityActions}
        </Grid>
      )}
    </Grid>
  )

  return (
    <StandardPageLayout
      {...standardProps}
      headerTitle={detailHeader}
      headerActions={!entityActions ? headerActions : undefined}
    >
      {props.children}
    </StandardPageLayout>
  )
}
