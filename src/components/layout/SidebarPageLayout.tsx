import React, { ReactElement, ReactNode } from "react"
import {
  Box,
  Container,
  Divider,
  Grid,
  Stack,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
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
export function SidebarPageLayout(props: SidebarPageLayoutProps): ReactElement {
  const { sidebar, contentMaxWidth = "md", children, ...standardProps } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <StandardPageLayout {...standardProps} maxWidth="xxl">
        <SidebarPageMobileBody sidebar={sidebar}>
          {children}
        </SidebarPageMobileBody>
      </StandardPageLayout>
    )
  }

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
          <Stack
            direction="row"
            justifyContent="center"
            spacing={theme.layoutSpacing.layout}
            sx={{ width: "100%", maxWidth: "xxl" }}
          >
            {sidebar}

            <Box sx={{ flex: 1, maxWidth: contentMaxWidth }}>{children}</Box>
          </Stack>
        </Box>
      </Container>
    </StandardPageLayout>
  )
}

/**
 * SidebarPageLayout's mobile body: the `sidebar` slot (Grid items such as an
 * inline search field; the filters BottomSheet is a portal), a divider, then
 * the content. The route skeletons render it too, so they lay out the same.
 *
 * It is a Grid item of StandardPageLayout's spacing grid. As a bare child of
 * that container (it used to be a Container) it started at the container's
 * negative margin: the whole column sat 4px left of the screen edge, clipped,
 * with an 8px gap on the right.
 */
export function SidebarPageMobileBody({
  sidebar,
  children,
}: {
  sidebar: ReactNode
  children: ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid item xs={12} sx={{ minWidth: 0 }}>
      <Grid container spacing={theme.layoutSpacing.layout}>
        {sidebar}

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <Grid item xs={12} sx={{ minWidth: 0 }}>
          {children}
        </Grid>
      </Grid>
    </Grid>
  )
}
