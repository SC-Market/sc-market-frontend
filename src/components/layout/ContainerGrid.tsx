import React, { ReactElement, useEffect, useRef } from "react"
import {
  Box,
  Container,
  ContainerProps,
  Grid,
  GridProps,
  Theme,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { Footer } from "../footer/Footer"
import { MainRefContext } from "../../hooks/layout/MainRef"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"

export function ContainerGrid(
  props: {
    sidebarOpen: boolean
    noFooter?: boolean
    noSidebar?: boolean
    GridProps?: GridProps
    noTopSpacer?: boolean
    noMobilePadding?: boolean // If true, removes padding on mobile (for market listings)
  } & ContainerProps,
): ReactElement {
  const theme = useTheme<ExtendedTheme>()
  const bottomNavHeight = useBottomNavHeight()

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const {
    sidebarOpen,
    noFooter,
    noSidebar,
    GridProps,
    noMobilePadding,
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
        }}
        ref={ref}
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
            display: props.noTopSpacer
              ? "none"
              : theme.navKind === "outlined"
                ? "block"
                : "none",
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
            paddingBottom: { xs: theme.spacing(2) + bottomNavHeight, sm: theme.spacing(2) }, // Bottom padding accounts for bottom nav (dynamically adjusts)
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
            {!props.noFooter && <Footer />}
          </Grid>
        </Container>
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

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

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
  }, [setDrawerOpen, props.sidebarOpen, noSidebar])

  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <MainRefContext.Provider value={ref}>
      <main
        {...mainProps}
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100vh",
          position: "relative",
          ...mainProps?.style,
        }}
        ref={ref}
      >
        <Box
          sx={{
            ...theme.mixins.toolbar,
            position: "relative",
            display: theme.navKind === "outlined" ? "block" : "none",
          }}
        />
        <Grid
          container
          spacing={theme.layoutSpacing.layout * 4}
          justifyContent={"center"}
          sx={{
            paddingBottom: `${bottomNavHeight}px`, // Bottom spacer for mobile bottom nav (dynamically adjusts when keyboard opens)
          }}
          {...gridProps}
        >
          {props.children}
          {!props.noFooter && <Footer />}
        </Grid>
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
  const theme: Theme = useTheme()
  const bottomNavHeight = useBottomNavHeight()

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
          height: "100vh",
          position: "relative",
          ...mainProps?.style,
        }}
        ref={ref}
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
            display: theme.navKind === "outlined" ? "block" : "none",
            height: 64,
          }}
        />
        <Box
          sx={{
            paddingLeft: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            paddingRight: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            paddingTop: theme.spacing(4),
            paddingBottom: { xs: theme.spacing(10), sm: theme.spacing(2) }, // Extra bottom padding on mobile for bottom nav
          }}
        >
          {children}
        </Box>
        {!noFooter && <Footer />}
      </main>
    </MainRefContext.Provider>
  )
}
