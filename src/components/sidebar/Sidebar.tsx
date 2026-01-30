import {
  Avatar,
  Badge,
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { matchPath, NavLink, useLocation } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { prefetchModule } from "../../util/prefetch"

import React, { useCallback, useEffect, useMemo, useState } from "react"

// Route-based prefetch mapping for sidebar links
const routePrefetchMap: Record<
  string,
  { importFn: () => Promise<any>; key: string }
> = {
  "/market": {
    importFn: () => import("../../features/market"),
    key: "MarketPage",
  },
  "/contracts": {
    importFn: () => import("../../pages/contracting/Contracts"),
    key: "Contracts",
  },
  "/people": {
    importFn: () => import("../../pages/people/People"),
    key: "People",
  },
  "/recruiting": {
    importFn: () => import("../../pages/recruiting/Recruiting"),
    key: "Recruiting",
  },
  "/contractor": {
    importFn: () => import("../../pages/contractor/Contractors"),
    key: "Contractors",
  },
  "/messages": {
    importFn: () => import("../../pages/messaging/Messages"),
    key: "Messages",
  },
  "/fleet": {
    importFn: () => import("../../pages/fleet/Fleet"),
    key: "Fleet",
  },
}
import ExpandMore from "@mui/icons-material/ExpandMore"
import ExpandLess from "@mui/icons-material/ExpandLess"
import IconButton from "@mui/material/IconButton"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { ChevronLeftRounded } from "@mui/icons-material"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import { all_sidebar_entries } from "./SidebarEntries"
import { SidebarActorSelect } from "./SidebarActorSelect"
import { has_permission } from "../../views/contractor/OrgRoles"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { Stack } from "@mui/system"
import SCMarketLogo from "../../assets/scmarket-logo.png"
import { useTranslation } from "react-i18next"
import { useUnreadChatCount } from "../../features/chats"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"

export function SidebarDropdown(props: SidebarItemProps) {
  const [open, setOpen] = useState(false)
  const { icon, text, chip, children } = props
  const theme = useTheme<ExtendedTheme>()
  const loc = useLocation()
  const anyChild = props.children?.some(
    (child) => !!matchPath(loc.pathname, child.to || ""),
  )
  const { t } = useTranslation()

  const contrast = theme.palette.getContrastText(
    theme.palette.background.sidebar,
  )

  return (
    <>
      <ListItemButton
        color={"primary"}
        sx={{
          padding: 1,
          paddingLeft: 2,
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          marginBottom: 0.5,
          transition: "0.3s",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          // ...makeCut('12px'),
        }}
        // selected={open}
        key={text}
        onClick={() => setOpen((open) => !open)}
      >
        <ListItemIcon
          sx={{
            color: anyChild ? theme.palette.primary.main : contrast,
            transition: "0.3s",
            fontSize: "0.9em",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText sx={{ marginLeft: -2 }}>
          <Typography
            color={anyChild ? "primary" : contrast}
            sx={{
              display: "inline-block",
              position: "relative",
              fontWeight: "bold",
              transition: "0.3s",
            }}
            variant={"subtitle2"}
          >
            {t(text)}
          </Typography>
        </ListItemText>
        {chip ? (
          <Chip
            label={
              <Typography
                sx={{
                  textTransform: "uppercase",
                  fontSize: "0.9em",
                  fontWeight: 700,
                }}
                variant={"button"}
              >
                {chip}
              </Typography>
            }
            color={"primary"}
            size={"small"}
          />
        ) : null}
        {children && open ? <ExpandLess style={{ color: contrast }} /> : null}
        {children && !open ? <ExpandMore style={{ color: contrast }} /> : null}
      </ListItemButton>
      {children ? (
        <Collapse in={open} timeout="auto" unmountOnExit sx={{ marginLeft: 2 }}>
          <Box
            sx={{
              borderLeft: 1,
              borderColor: theme.palette.outline.main,
              paddingLeft: 1,
            }}
          >
            {children.map((child) => (
              <SidebarLink {...child} to={child.to || "a"} key={child.text} />
            ))}
          </Box>
        </Collapse>
      ) : null}
    </>
  )
}

export function SidebarLinkBody(props: SidebarItemProps & { to: string }) {
  const loc = useLocation()
  const selected = !!matchPath(loc.pathname, props.to || "")
  const { icon, text, chip } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const xs = useMediaQuery(theme.breakpoints.down("sm"))
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const unreadChatCount = useUnreadChatCount()
  const isMessagesLink = props.to === "/messages"

  const contrast = theme.palette.getContrastText(
    theme.palette.background.sidebar || "#000000",
  )

  return (
    <React.Fragment>
      <ListItemButton
        color={"primary"}
        sx={{
          padding: 0.5,
          paddingLeft: 2,
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          marginTop: 0.5,
          transition: "0.3s",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          // ...makeCut('12px'),
        }}
        selected={selected}
        key={text}
        onClick={() => {
          if (xs) {
            setDrawerOpen(false)
          }
        }}
      >
        <ListItemIcon
          sx={{
            color: selected ? theme.palette.primary.main : contrast,
            transition: "0.3s",
            fontSize: "0.9em",
          }}
        >
          {isMessagesLink && unreadChatCount > 0 ? (
            <Badge
              badgeContent={unreadChatCount}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.7rem",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 6px",
                },
              }}
            >
              {icon}
            </Badge>
          ) : (
            icon
          )}
        </ListItemIcon>
        <ListItemText sx={{ marginLeft: -2 }}>
          <Typography
            color={selected ? "primary" : contrast}
            sx={{
              display: "inline-block",
              position: "relative",
              fontWeight: "bold",
              transition: "0.3s",
            }}
            variant={"subtitle2"}
          >
            {t(text)}
          </Typography>
        </ListItemText>
        {chip ? (
          <Chip
            label={
              <Typography
                sx={{
                  textTransform: "uppercase",
                  fontSize: "0.9em",
                  fontWeight: 700,
                }}
                variant={"button"}
              >
                {chip}
              </Typography>
            }
            color={"primary"}
            size={"small"}
          />
        ) : null}
      </ListItemButton>
    </React.Fragment>
  )
}

export function SidebarLink(props: SidebarItemProps & { to: string }) {
  const handleMouseEnter = useCallback(() => {
    // Find matching route for prefetching
    const matchingRoute = Object.keys(routePrefetchMap).find((route) =>
      props.to.startsWith(route),
    )

    if (matchingRoute) {
      const { importFn, key } = routePrefetchMap[matchingRoute]
      prefetchModule(importFn, key)
    }
  }, [props.to])

  return props.external ? (
    <a
      href={props.to}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={handleMouseEnter}
    >
      <SidebarLinkBody {...props} />
    </a>
  ) : (
    <NavLink
      to={props.to + (props.params ? "?" + props.params : "")}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={handleMouseEnter}
    >
      <SidebarLinkBody {...props} />
    </NavLink>
  )
}

export function SidebarItem(props: SidebarItemProps) {
  return (
    <React.Fragment>
      {props.children ? (
        <SidebarDropdown {...props} />
      ) : (
        <SidebarLink {...props} to={props.to || "a"} />
      )}
    </React.Fragment>
  )
}

export interface SidebarItemProps {
  to?: string
  params?: string
  text: string
  icon?: React.ReactNode
  chip?: string
  children?: SidebarItemProps[]
  hidden?: boolean
  logged_in?: boolean
  org?: boolean
  org_admin?: boolean
  site_admin?: boolean
  custom?: boolean
  external?: boolean
}

export interface SidebarSectionProps {
  title: string
  items: SidebarItemProps[]
}

export function Sidebar() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()
  const { data: profile, error: profile_error } = useGetUserProfileQuery()
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const [currentOrgObj, setCurrentOrgObj] = useCurrentOrg()
  const { data: customOrgData } = useGetContractorBySpectrumIDQuery(
    CURRENT_CUSTOM_ORG!,
    { skip: !CURRENT_CUSTOM_ORG },
  )

  const avatar = useMemo(() => {
    if (CURRENT_CUSTOM_ORG) {
      return customOrgData?.avatar || SCMarketLogo
    } else {
      return SCMarketLogo
    }
  }, [customOrgData])

  const filterItems = useCallback(
    (item: SidebarItemProps) => {
      if (item.hidden) {
        return false
      } else if (
        (item.logged_in || item.org || item.org_admin || item.site_admin) &&
        (profile_error || !profile)
      ) {
        return false
      } else if (
        item.org === false &&
        (currentOrgObj !== null || CURRENT_CUSTOM_ORG)
      ) {
        return false
      } else if ((item.org || item.org_admin) && !currentOrgObj) {
        return false
      } else if (item.org_admin) {
        if (
          !(
            [
              "manage_org_details",
              "manage_invites",
              "manage_roles",
              "manage_webhooks",
              "manage_orders",
            ] as const
          ).some((perm) =>
            has_permission(currentOrgObj, profile, perm, profile?.contractors),
          )
        ) {
          return false
        }
      } else if (CURRENT_CUSTOM_ORG && item.custom === false) {
        return false
      } else if (!CURRENT_CUSTOM_ORG && item.custom) {
        return false
      } else if (item.site_admin && profile?.role !== "admin") {
        return false
      }

      return true
    },
    [currentOrgObj, profile?.role, profile?.username, profile_error, profile],
  )

  const xs = useMediaQuery(theme.breakpoints.down("sm"))
  const location = useLocation()
  const bottomNavHeight = useBottomNavHeight()
  const prevXs = React.useRef<boolean | undefined>(undefined)

  // Auto-close drawer on mobile when screen size changes
  useEffect(() => {
    // Only update drawer state when screen size changes, not on every render
    if (prevXs.current === undefined) {
      // Initial mount: set based on screen size
      setDrawerOpen(!xs)
      prevXs.current = xs
    } else if (prevXs.current !== xs) {
      // Screen size changed: update drawer state accordingly
      setDrawerOpen(!xs)
      prevXs.current = xs
    }
  }, [setDrawerOpen, xs])

  // Close drawer on mobile when navigating to a new route
  const prevPathname = React.useRef<string>(location.pathname)
  useEffect(() => {
    // Only close if the pathname actually changed (user navigated)
    if (xs && prevPathname.current !== location.pathname) {
      // Close drawer when navigating on mobile
      setDrawerOpen(false)
      prevPathname.current = location.pathname
    } else if (prevPathname.current !== location.pathname) {
      // Update ref to track pathname changes (for non-mobile or when drawer already closed)
      prevPathname.current = location.pathname
    }
  }, [location.pathname, xs, setDrawerOpen])

  return (
    <Drawer
      elevation={1}
      PaperProps={{ elevation: 8 }}
      variant={xs ? "temporary" : "permanent"}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.easeOut,
          duration: "0.3s",
        }),
        // width: (drawerOpen ? sidebarDrawerWidth : 0),

        [theme.breakpoints.up("sm")]: {
          width: drawerOpen ? sidebarDrawerWidth : 0,
        },
        [theme.breakpoints.down("sm")]: {
          width: drawerOpen ? "100%" : 0,
        },

        "& .MuiDrawer-paper": {
          // width: (drawerOpen ? sidebarDrawerWidth : 0),
          [theme.breakpoints.up("sm")]: {
            width: drawerOpen ? sidebarDrawerWidth : 0,
          },
          [theme.breakpoints.down("sm")]: {
            width: drawerOpen ? "100%" : 0,
            borderRight: 0,
          },

          boxSizing: "border-box",
          backgroundColor: theme.palette.background.sidebar,
          overflow: "hidden",
          borderRight: drawerOpen ? 1 : 0,
          borderColor: drawerOpen ? theme.palette.outline.main : "transparent",
          scrollPadding: 0,
          display: "flex",
          flexDirection: "column",

          transition: theme.transitions.create(
            ["width", "borderRight", "borderColor"],
            {
              easing: theme.transitions.easing.easeOut,
              duration: "0.3s",
            },
          ),
        },
        position: "relative",
        whiteSpace: "nowrap",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Stack
        direction={"column"}
        spacing={theme.layoutSpacing.compact}
        sx={{
          width: "100%",
          display: "flex",
          padding: 2,
          borderColor: theme.palette.outline.main,
        }}
      >
        <Grid container sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <NavLink
              to={"/"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Stack
                direction={"row"}
                spacing={theme.layoutSpacing.compact}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Avatar
                  src={avatar}
                  aria-label={t("ui.aria.currentContractor")}
                  variant={"rounded"}
                  sx={{
                    maxHeight: theme.spacing(6),
                    maxWidth: theme.spacing(6),
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                <Typography
                  color={theme.palette.getContrastText(
                    theme.palette.background.sidebar,
                  )}
                  fontWeight={600}
                >
                  {t("sidebar.sc_market")}
                </Typography>
              </Stack>
            </NavLink>
          </Grid>

          <IconButton
            color={"secondary"}
            onClick={() => setDrawerOpen(false)}
            sx={{ height: 40, width: 40 }}
          >
            <ChevronLeftRounded />
          </IconButton>
        </Grid>
        {profile && <SidebarActorSelect />}
      </Stack>
      <Stack
        direction={"column"}
        spacing={theme.layoutSpacing.component}
        sx={{
          // backgroundColor: 'rgb(0,0,0,.6)',
          width: "100%",
          flex: 1,
          // justifyContent: 'space-between',
          display: "flex",
          // borderRight: 0,
          // borderLeft: 0,
          borderTop: 1,
          padding: 1,
          paddingBottom: `calc(${theme.spacing(1)} + ${bottomNavHeight}px)`, // Account for bottom nav (dynamically adjusts when keyboard opens)
          borderColor: theme.palette.outline.main,
          overflow: "auto",
        }}
      >
        {all_sidebar_entries
          .filter((item) => item.items.filter(filterItems).length)
          .map((item) => {
            return (
              <List
                key={item.title}
                sx={{
                  // height: '100%',
                  padding: 1,
                  transition: "0.3s",
                }}
                subheader={
                  <ListSubheader
                    sx={{
                      marginBottom: 0.5,
                      backgroundColor: "inherit",
                    }}
                  >
                    <Typography
                      sx={{
                        bgcolor: "inherit",
                        fontWeight: "bold",
                        opacity: 0.7,
                        textTransform: "uppercase",
                        fontSize: "0.85em",
                        color: theme.palette.getContrastText(
                          theme.palette.background.sidebar,
                        ),
                        transition: "0.3s",
                      }}
                      variant={"body2"}
                    >
                      {t(item.title)}
                    </Typography>
                  </ListSubheader>
                }
              >
                {item.items.filter(filterItems).map((item) => (
                  <SidebarItem {...item} key={item.text} />
                ))}
              </List>
            )
          })}
      </Stack>
    </Drawer>
  )
}
