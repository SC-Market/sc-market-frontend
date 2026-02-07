import React from "react"
import {
  Badge,
  Chip,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { StarRounded, StarBorderRounded } from "@mui/icons-material"
import { useLocation, matchPath } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { useUnreadChatCount } from "../../../features/chats"
import { SidebarLinkProps } from "../types"
import { haptic } from "../../../util/haptics"

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

/**
 * The actual rendered link body with icon, text, badges, and star button
 */
export function SidebarLinkBody(props: SidebarLinkProps) {
  const loc = useLocation()
  const pathOnly = (props.to || "").split("?")[0]
  const selected = isSidebarPathSelected(pathOnly, loc.pathname)
  const { icon, text, chip, isStarred, onToggleStar } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const xs = useMediaQuery(theme.breakpoints.down("sm"))
  const [, setDrawerOpen] = useDrawerOpen()
  const unreadChatCount = useUnreadChatCount()
  const isMessagesLink = props.to === "/messages"

  const contrast = theme.palette.getContrastText(
    theme.palette.background.sidebar || "#000000",
  )

  return (
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
        haptic.light()
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
          color={selected ? "primary" : "#FFFFFF"}
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
  )
}
