import React, { ReactElement, ReactNode } from "react"
import { Box, Container, Divider, Grid, Stack, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  StandardPageLayout,
  StandardPageLayoutProps,
} from "./StandardPageLayout"

export interface SidebarPageLayoutProps extends StandardPageLayoutProps {
  sidebar: ReactNode
  contentMaxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl"
}

/**
 * Layout for pages with a persistent sidebar on desktop and bottom sheet on mobile.
 * Used by Market, Contractors, Recruiting, Services, etc.
 * Matches the market page layout structure.
 */
export function SidebarPageLayout(
  props: SidebarPageLayoutProps,
): ReactElement {
  const { sidebar, contentMaxWidth = "md", children, ...standardProps } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <StandardPageLayout {...standardProps} maxWidth="xxl">
      <Container
        maxWidth="xxl"
        sx={{
          padding: 0,
          paddingTop: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {isMobile ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              {sidebar}

              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                {children}
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxl" }}
            >
              {sidebar}

              <Box sx={{ flex: 1, maxWidth: contentMaxWidth }}>
                {children}
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </StandardPageLayout>
  )
}
