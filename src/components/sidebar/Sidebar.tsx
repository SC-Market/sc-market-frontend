import {
  Avatar,
  Badge,
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
  InputAdornment,
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
import SearchRounded from "@mui/icons-material/SearchRounded"
import StarRounded from "@mui/icons-material/StarRounded"
import StarBorderRounded from "@mui/icons-material/StarBorderRounded"
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
import { useCookies } from "react-cookie"

export function SidebarDropdown(
  props: SidebarItemProps & {
    isStarred?: boolean
    onToggleStar?: (path: string) => void
    starredItems?: string[]
  },
) {
  const [open, setOpen] = useState(false)
  const { icon, text, chip, children, starredItems, onToggleStar } = props
  const theme = useTheme<ExtendedTheme>()
  const loc = useLocation()
  const anyChild = props.children?.some((child) => {
    const childPath = (child.to || "").split("?")[0]
    return isSidebarPathSelected(childPath, loc.pathname)
  })
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  const contrast = theme.palette.getContrastText(
    theme.palette.background.sidebar,
  )

  return (
    <>
      <ListItemButton
        color={"primary"}
        sx={{
          padding: xs ? 0.25 : 1,
          paddingLeft: xs ? 1 : 2,
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          marginBottom: xs ? 0.25 : 0.5,
          transition: "0.3s",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        key={text}
        onClick={() => setOpen((open) => !open)}
      >
        <ListItemIcon
          sx={{
            color: anyChild ? theme.palette.primary.main : contrast,
            transition: "0.3s",
            fontSize: xs ? "0.85em" : "0.9em",
            ...(xs && { minWidth: 40 }),
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
              <SidebarLink
                {...child}
                to={child.to || "a"}
                key={child.text}
                isStarred={starredItems?.includes(
                  child.to?.split("?")[0] || "",
                )}
                onToggleStar={onToggleStar}
              />
            ))}
          </Box>
        </Collapse>
      ) : null}
    </>
  )
}

/** Canonical paths for org management routes when visited via /org/:contractor_id/rest */
export const ORG_ROUTE_REST_TO_CANONICAL: Record<string, string> = {
  dashboard: "/dashboard",
  manage: "/org/manage",
  orders: "/org/orders",
  money: "/org/money",
  fleet: "/org/fleet",
  send: "/org/send",
  members: "/org/members",
  listings: "/market/manage",
  services: "/order/services",
}

function isSidebarPathSelected(pathOnly: string, pathname: string): boolean {
  if (matchPath(pathOnly, pathname)) return true
  if (!pathname.startsWith("/org/")) return false
  const m = matchPath("/org/:contractor_id/*", pathname)
  const rest = (m?.params as { contractor_id?: string; "*"?: string })?.["*"]
  return !!(rest && ORG_ROUTE_REST_TO_CANONICAL[rest] === pathOnly)
}

export function SidebarLinkBody(
  props: SidebarItemProps & {
    to: string
    isStarred?: boolean
    onToggleStar?: (path: string) => void
  },
) {
  const loc = useLocation()
  const pathOnly = (props.to || "").split("?")[0]
  const selected = isSidebarPathSelected(pathOnly, loc.pathname)
  const { icon, text, chip, isStarred, onToggleStar } = props
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
          padding: xs ? 0.25 : 0.5,
          paddingLeft: xs ? 1 : 2,
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          marginTop: xs ? 0.25 : 0.5,
          transition: "0.3s",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
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
            fontSize: xs ? "0.85em" : "0.9em",
            ...(xs && { minWidth: 40 }),
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
        {xs && onToggleStar && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleStar(pathOnly)
            }}
            sx={{ ml: "auto", mr: 0.5 }}
          >
            {isStarred ? (
              <StarRounded fontSize="small" color="primary" />
            ) : (
              <StarBorderRounded fontSize="small" />
            )}
          </IconButton>
        )}
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

export function SidebarLink(
  props: SidebarItemProps & {
    to: string
    isStarred?: boolean
    onToggleStar?: (path: string) => void
  },
) {
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

export function SidebarItem(
  props: SidebarItemProps & {
    isStarred?: boolean
    onToggleStar?: (path: string) => void
    starredItems?: string[]
  },
) {
  return (
    <React.Fragment>
      {props.children ? (
        <SidebarDropdown
          {...props}
          starredItems={props.starredItems}
          onToggleStar={props.onToggleStar}
        />
      ) : (
        <SidebarLink
          {...props}
          to={props.to || "a"}
          isStarred={props.isStarred}
          onToggleStar={props.onToggleStar}
        />
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
  /** When true, link goes to current org's public page; only shown when org is selected. */
  toOrgPublic?: boolean
  /** When set and pathname is /org/:contractor_id/*, link becomes /org/:contractor_id/orgRouteRest. */
  orgRouteRest?: string
}

export interface SidebarSectionProps {
  title: string
  items: SidebarItemProps[]
}

export function Sidebar() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()
  const location = useLocation()
  const { data: profile, error: profile_error } = useGetUserProfileQuery()
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const [currentOrgObj, setCurrentOrgObj] = useCurrentOrg()
  const orgRouteContractorId = useMemo(() => {
    const m = matchPath("/org/:contractor_id/*", location.pathname)
    return (m?.params as { contractor_id?: string; "*"?: string })?.[
      "contractor_id"
    ]
  }, [location.pathname])
  /** Use explicit org path when on org route or when an org is selected in the sidebar. */
  const effectiveOrgId = orgRouteContractorId ?? currentOrgObj?.spectrum_id
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
      } else if (item.toOrgPublic && !currentOrgObj) {
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

  const [searchQuery, setSearchQuery] = useState("")
  const [cookies, setCookie] = useCookies(["starred_sidebar"])
  const starredItems: string[] = cookies.starred_sidebar || []

  const toggleStar = (itemPath: string) => {
    const newStarred = starredItems.includes(itemPath)
      ? starredItems.filter((p) => p !== itemPath)
      : [...starredItems, itemPath]
    setCookie("starred_sidebar", newStarred, { path: "/", maxAge: 31536000 })
  }

  const xs = useMediaQuery(theme.breakpoints.down("sm"))
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

        [theme.breakpoints.up("sm")]: {
          width: drawerOpen ? sidebarDrawerWidth : 0,
        },
        [theme.breakpoints.down("sm")]: {
          width: 0, // Always 0 on mobile so content doesn't shift
        },

        "& .MuiDrawer-paper": {
          [theme.breakpoints.up("sm")]: {
            width: drawerOpen ? sidebarDrawerWidth : 0,
          },
          [theme.breakpoints.down("sm")]: {
            width: "85%", // 85% width on mobile, not full width
            maxWidth: 320,
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
        {xs && (
          <TextField
            size="small"
            placeholder={t("sidebar.search", "Search...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 1 }}
          />
        )}
      </Stack>
      <Stack
        direction={"column"}
        spacing={xs ? 0 : theme.layoutSpacing.component}
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          borderTop: 1,
          padding: xs ? 0.5 : 1,
          paddingBottom: `calc(${theme.spacing(1)} + ${bottomNavHeight}px)`,
          borderColor: theme.palette.outline.main,
          overflow: "auto",
        }}
      >
        {/* Starred items section (mobile only) */}
        {xs && starredItems.length > 0 && (
          <List
            sx={{ padding: xs ? 0.5 : 1 }}
            subheader={
              <ListSubheader
                sx={{
                  marginBottom: xs ? 0 : 0.5,
                  backgroundColor: "inherit",
                }}
              >
                <Typography
                  sx={{
                    bgcolor: "inherit",
                    fontWeight: "bold",
                    opacity: 0.7,
                    textTransform: "uppercase",
                    fontSize: xs ? "0.75em" : "0.85em",
                    color: theme.palette.getContrastText(
                      theme.palette.background.sidebar,
                    ),
                  }}
                  variant={"body2"}
                >
                  {t("sidebar.starred", "Starred")}
                </Typography>
              </ListSubheader>
            }
          >
            {all_sidebar_entries
              .flatMap((section) =>
                section.items.flatMap((item) => [
                  item,
                  ...(item.children || []),
                ]),
              )
              .filter(filterItems)
              .filter((entry) => entry.to)
              .filter((entry) => {
                const path =
                  entry.orgRouteRest && effectiveOrgId
                    ? `/org/${effectiveOrgId}/${entry.orgRouteRest}`
                    : entry.to
                return starredItems.includes(path?.split("?")[0] || "")
              })
              .map((entry) => {
                let resolved = entry
                if (entry.toOrgPublic && currentOrgObj) {
                  resolved = {
                    ...entry,
                    to: `/contractor/${currentOrgObj.spectrum_id}`,
                  }
                } else if (entry.orgRouteRest && effectiveOrgId) {
                  resolved = {
                    ...entry,
                    to: `/org/${effectiveOrgId}/${entry.orgRouteRest}`,
                  }
                }
                return (
                  <SidebarItem
                    {...resolved}
                    key={`starred-${resolved.text}`}
                    isStarred={true}
                    onToggleStar={toggleStar}
                  />
                )
              })}
          </List>
        )}
        {all_sidebar_entries
          .filter((item) => item.items.filter(filterItems).length)
          .map((item) => {
            const filteredItems = item.items
              .filter(filterItems)
              .filter((entry) => {
                if (!searchQuery) return true
                const query = searchQuery.toLowerCase()
                const text = t(entry.text).toLowerCase()
                const childrenMatch = entry.children?.some((child) =>
                  t(child.text).toLowerCase().includes(query),
                )
                return text.includes(query) || childrenMatch
              })

            if (!filteredItems.length) return null

            return (
              <List
                key={item.title}
                sx={{
                  padding: xs ? 0.5 : 1,
                  transition: "0.3s",
                }}
                subheader={
                  <ListSubheader
                    sx={{
                      marginBottom: xs ? 0 : 0.5,
                      backgroundColor: "inherit",
                    }}
                  >
                    <Typography
                      sx={{
                        bgcolor: "inherit",
                        fontWeight: "bold",
                        opacity: 0.7,
                        textTransform: "uppercase",
                        fontSize: xs ? "0.75em" : "0.85em",
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
                {filteredItems.map((entry) => {
                  let resolved = entry
                  if (entry.toOrgPublic && currentOrgObj) {
                    resolved = {
                      ...entry,
                      to: `/contractor/${currentOrgObj.spectrum_id}`,
                    }
                  } else if (entry.orgRouteRest && effectiveOrgId) {
                    resolved = {
                      ...entry,
                      to: `/org/${effectiveOrgId}/${entry.orgRouteRest}`,
                    }
                  }
                  if (resolved.children?.length && effectiveOrgId) {
                    resolved = {
                      ...resolved,
                      children: resolved.children.map((child) =>
                        child.orgRouteRest
                          ? {
                              ...child,
                              to: `/org/${effectiveOrgId}/${child.orgRouteRest}`,
                            }
                          : child,
                      ),
                    }
                  }
                  return (
                    <SidebarItem
                      {...resolved}
                      key={resolved.text}
                      isStarred={starredItems.includes(
                        resolved.to?.split("?")[0] || "",
                      )}
                      onToggleStar={toggleStar}
                      starredItems={starredItems}
                    />
                  )
                })}
              </List>
            )
          })}
      </Stack>
    </Drawer>
  )
}
