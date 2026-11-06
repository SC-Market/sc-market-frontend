import React, { ReactElement, useEffect, useRef } from "react"
import { Box, Container, ContainerProps, Grid, GridProps } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { useTheme } from "@mui/material/styles"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { Footer } from "../footer/Footer"
import { MainRefContext } from "../../hooks/layout/MainRef"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { FloatingActionsRoom } from "./FloatingActions"
import { PAGE_SCROLL_ATTRIBUTE } from "./pageScroll"

/**
 * The page area under the top bar: grows to fill the rest of the scrolling
 * <main> (a flex column), and is a column itself, so FOOTER_AT_BOTTOM_SX
 * can push the footer to the bottom of the screen on a short page. Never
 * shrinks: a long page still scrolls <main>, not this box.
 */
const PAGE_SHELL_SX = {
  flexGrow: 1,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
} as const

/** The footer's wrapper: takes the page area's spare height above it. */
const FOOTER_AT_BOTTOM_SX = { marginTop: "auto", flexShrink: 0 } as const

export function ContainerGrid(
  props: {
    sidebarOpen: boolean
    sidebarWidth?: number // Width of the sidebar in pixels (e.g., marketDrawerWidth)
    noFooter?: boolean
    noSidebar?: boolean
    GridProps?: GridProps
    noTopSpacer?: boolean
    noMobilePadding?: boolean // If true, removes padding on mobile (for market listings)
  } & Omit<ContainerProps, "maxWidth"> & {
      maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | false
    },
): ReactElement {
  const theme = useTheme<ExtendedTheme>()
  const bottomNavHeight = useBottomNavHeight()
  const isMobile = useIsMobile()

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const {
    sidebarOpen,
    sidebarWidth = 0,
    noFooter,
    noSidebar,
    GridProps,
    noMobilePadding,
    noTopSpacer,
    ...containerProps
  } = props

  useEffect(() => {
    if (noSidebar) {
      setDrawerOpen(!noSidebar)
    }
  }, [setDrawerOpen, props.sidebarOpen, noSidebar])

  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <MainRefContext.Provider value={ref}>
      <main
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100%", // Use 100% of parent instead of 100vh
          position: "relative",
          // A column whose page area grows (PAGE_SHELL_SX), so the footer
          // sits at the bottom of the screen on a short page.
          display: "flex",
          flexDirection: "column",
          marginLeft:
            !isMobile && sidebarOpen && sidebarWidth > 0 ? sidebarWidth : 0,
          transition:
            !isMobile && sidebarWidth > 0
              ? theme.transitions.create("marginLeft", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                })
              : undefined,
        }}
        ref={ref}
        {...{ [PAGE_SCROLL_ATTRIBUTE]: "" }}
      >
        <Box
          sx={{
            ...theme.mixins.toolbar,
            position: "relative",
            [theme.breakpoints.up("sm")]: {
              width: drawerOpen ? sidebarDrawerWidth : 1,
            },
            [theme.breakpoints.down("sm")]: {
              width: drawerOpen ? "100%" : 1,
            },
            display: noTopSpacer ? "none" : "block",
            flexShrink: 0,
          }}
        />
        <Container
          {...containerProps}
          maxWidth={
            containerProps.maxWidth !== undefined
              ? containerProps.maxWidth
              : "lg"
          }
          sx={{
            paddingTop: theme.spacing(4),
            paddingBottom: {
              xs: theme.spacing(2) + bottomNavHeight,
              sm: theme.spacing(2),
            }, // Bottom padding accounts for bottom nav (dynamically adjusts)
            paddingLeft: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            paddingRight: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            // Override maxWidth on mobile to allow full width
            [theme.breakpoints.down("sm")]: {
              maxWidth: "100%",
            },
            ...PAGE_SHELL_SX,
            ...props.sx,
          }}
        >
          <Grid
            container
            spacing={{
              xs: theme.layoutSpacing.component,
              sm: theme.layoutSpacing.layout,
            }}
            justifyContent={"center"}
            {...GridProps}
          >
            {props.children}
          </Grid>
          {!noFooter && (
            // The Grid's negative top margin (its spacing) can't be
            // overridden on the Grid itself (the breakpoint rule wins), so a
            // wrapper takes the spare height; its top padding restores the
            // gap the footer had as an item of the content grid.
            <Box
              sx={{
                ...FOOTER_AT_BOTTOM_SX,
                paddingTop: {
                  xs: theme.spacing(theme.layoutSpacing.component),
                  sm: theme.spacing(theme.layoutSpacing.layout),
                },
              }}
            >
              <Grid
                container
                spacing={{
                  xs: theme.layoutSpacing.component,
                  sm: theme.layoutSpacing.layout,
                }}
                justifyContent={"center"}
              >
                <Footer />
              </Grid>
            </Box>
          )}
        </Container>
        <FloatingActionsRoom />
      </main>
    </MainRefContext.Provider>
  )
}

export function OpenGrid(
  props: {
    sidebarOpen: boolean
    noFooter?: boolean
    noSidebar?: boolean
    mainProps?: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
  } & GridProps,
) {
  const theme = useTheme<ExtendedTheme>()
  const bottomNavHeight = useBottomNavHeight()

  const [, setDrawerOpen] = useDrawerOpen()

  const {
    sidebarOpen,
    noFooter,
    noSidebar,
    children,
    mainProps,
    ...gridProps
  } = props

  useEffect(() => {
    if (noSidebar) {
      setDrawerOpen(!noSidebar)
    }
  }, [setDrawerOpen, sidebarOpen, noSidebar])

  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <MainRefContext.Provider value={ref}>
      <main
        {...mainProps}
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          // Bottom spacer for mobile bottom nav (dynamically adjusts when keyboard opens)
          paddingBottom: bottomNavHeight,
          ...mainProps?.style,
        }}
        ref={ref}
        {...{ [PAGE_SCROLL_ATTRIBUTE]: "" }}
      >
        <Box
          sx={{
            ...theme.mixins.toolbar,
            position: "relative",
            display: "block",
            flexShrink: 0,
          }}
        />
        <Grid
          container
          spacing={theme.layoutSpacing.layout * 4}
          justifyContent={"center"}
          sx={{ flexShrink: 0 }}
          {...gridProps}
        >
          {children}
        </Grid>
        {!noFooter && (
          // See ContainerGrid: the wrapper takes the spare height.
          <Box
            sx={{
              ...FOOTER_AT_BOTTOM_SX,
              paddingTop: theme.spacing(theme.layoutSpacing.layout * 4),
            }}
          >
            <Grid
              container
              spacing={theme.layoutSpacing.layout * 4}
              justifyContent={"center"}
            >
              <Footer />
            </Grid>
          </Box>
        )}
        <FloatingActionsRoom />
      </main>
    </MainRefContext.Provider>
  )
}

export function OpenLayout(
  props: {
    sidebarOpen: boolean
    noFooter?: boolean
    noSidebar?: boolean
    children: React.ReactNode
    noMobilePadding?: boolean // If true, removes padding on mobile (for market listings)
  } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
) {
  const theme = useTheme<ExtendedTheme>()
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const {
    sidebarOpen,
    noFooter,
    noSidebar,
    children,
    noMobilePadding,
    ...mainProps
  } = props

  useEffect(() => {
    if (noSidebar) {
      setDrawerOpen(!noSidebar)
    }
  }, [setDrawerOpen, sidebarOpen, noSidebar])

  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <MainRefContext.Provider value={ref}>
      <main
        {...mainProps}
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100%", // Use 100% of parent instead of 100vh
          position: "relative",
          display: "flex",
          flexDirection: "column",
          ...mainProps?.style,
        }}
        ref={ref}
        {...{ [PAGE_SCROLL_ATTRIBUTE]: "" }}
      >
        <Box
          sx={{
            ...theme.mixins.toolbar,
            position: "relative",
            [theme.breakpoints.up("sm")]: {
              width: drawerOpen ? sidebarDrawerWidth : 1,
            },
            [theme.breakpoints.down("sm")]: {
              width: drawerOpen ? "100%" : 1,
            },
            display: "block",
            height: 64,
            flexShrink: 0,
          }}
        />
        <Box
          sx={{
            flexShrink: 0,
            paddingLeft: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: noMobilePadding ? 0 : theme.spacing(3),
            },
            paddingRight: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: noMobilePadding ? 0 : theme.spacing(3),
            },
            paddingTop: theme.spacing(2),
            paddingBottom: { xs: theme.spacing(10), sm: theme.spacing(2) }, // Extra bottom padding on mobile for bottom nav
          }}
        >
          {children}
        </Box>
        {!noFooter && (
          <Box sx={FOOTER_AT_BOTTOM_SX}>
            <Footer />
          </Box>
        )}
        <FloatingActionsRoom />
      </main>
    </MainRefContext.Provider>
  )
}
