import React, { ReactNode } from "react"
import {
  Box,
  Container,
  Divider,
  Grid,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material"
import { HapticTab } from "../../components/haptic"
import { OpenLayout } from "./ContainerGrid"
import { a11yProps } from "../tabs/Tabs"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export interface MarketTabsLayoutTab {
  value: number
  label: string
}

export interface MarketTabsLayoutProps {
  /** Page title in the header */
  title: string
  /** Current tab index (0-based) */
  tabIndex: number
  /** Called when user selects a tab */
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void
  /** Tab definitions (value + label) */
  tabs: MarketTabsLayoutTab[]
  /** Actions shown in the header for the current tab */
  headerActions: ReactNode
  /** Tab panel content (one per tab, in order) */
  children: ReactNode
  /** Optional FAB to show when on mobile (e.g. filter toggle); typically one per active tab */
  fab?: ReactNode
}

/**
 * Shared layout for /market, /market/services, and /contracts:
 * OpenLayout + header (title, tabs, actions) + divider + tab panels.
 * Use the same structure so padding and behaviour match across all three.
 */
export function MarketTabsLayout({
  title,
  tabIndex,
  onTabChange,
  tabs,
  headerActions,
  children,
  fab,
}: MarketTabsLayoutProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      <OpenLayout sidebarOpen={true} noMobilePadding={true}>
        <Container
          maxWidth="xxl"
          sx={{
            paddingTop: { xs: 2, sm: 8 },
            paddingX: { xs: theme.spacing(1), sm: theme.spacing(3) },
            marginX: "auto",
          }}
        >
          <Grid
            container
            spacing={{
              xs: theme.layoutSpacing?.component ?? 1,
              sm: theme.layoutSpacing?.layout ?? 2,
            }}
            sx={{ marginBottom: { xs: 2, sm: 4 } }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item xs={12} sm="auto">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2.125rem" },
                  }}
                  color="text.secondary"
                >
                  {title}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Tabs
                value={tabIndex}
                onChange={onTabChange}
                aria-label="Market and contracts tabs"
                variant="scrollable"
                scrollButtons="auto"
                textColor="secondary"
                indicatorColor="secondary"
                sx={{
                  minHeight: { xs: 48, sm: 64 },
                  "& .MuiTab-root": {
                    minHeight: { xs: 48, sm: 64 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    padding: { xs: "12px 16px", sm: "12px 24px" },
                  },
                }}
              >
                {tabs.map((tab) => (
                  <HapticTab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                    {...a11yProps(tab.value)}
                  />
                ))}
              </Tabs>
            </Grid>
            <Grid
              item
              xs={12}
              sm="auto"
              sx={{
                display: "flex",
                justifyContent: { xs: "stretch", sm: "flex-end" },
              }}
            >
              {headerActions}
            </Grid>
          </Grid>

          <Divider light sx={{ mt: 2, mb: 2 }} />
        </Container>

        {children}
      </OpenLayout>
      {fab}
    </>
  )
}
