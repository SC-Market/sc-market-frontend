import React, { useEffect, useRef } from "react"
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

export function ContainerGrid(
  props: {
    sidebarOpen: boolean
    noFooter?: boolean
    noSidebar?: boolean
    GridProps?: GridProps
    noTopSpacer?: boolean
  } & ContainerProps,
): JSX.Element {
  const theme: Theme = useTheme()

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const { sidebarOpen, noFooter, noSidebar, GridProps, ...containerProps } =
    props

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
          height: "100vh",
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
          sx={{
            paddingTop: theme.spacing(10),
            paddingBottom: theme.spacing(4),
            ...props.sx,
          }}
        >
          <Grid container spacing={2} justifyContent={"center"} {...GridProps}>
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
  const theme: Theme = useTheme()

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
        <Grid container spacing={4} justifyContent={"center"} {...gridProps}>
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
  } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
) {
  const theme: Theme = useTheme()

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const { sidebarOpen, noFooter, noSidebar, children, ...mainProps } = props

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
        {children}
        {!noFooter && <Footer />}
      </main>
    </MainRefContext.Provider>
  )
}
