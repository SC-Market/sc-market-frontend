import React, { useState } from "react"
import {
  Box,
  Chip,
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { SidebarLink } from "./SidebarLink"
import { SidebarItemWithStarProps } from "../types"
import { isSidebarPathSelected } from "../utils/pathMatching"
import { haptic } from "../../../util/haptics"

/**
 * Collapsible dropdown for sidebar items with children
 */
export function SidebarDropdown(props: SidebarItemWithStarProps) {
  const [open, setOpen] = useState(false)
  const { icon, text, chip, children, starredItems, onToggleStar } = props
  const theme = useTheme<ExtendedTheme>()
  const loc = useLocation()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  const anyChild = props.children?.some((child) => {
    const childPath = (child.to || "").split("?")[0]
    return isSidebarPathSelected(childPath, loc.pathname)
  })

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
        onClick={() => {
          haptic.selection()
          setOpen((open) => !open)
        }}
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
            size={"small"}
            color={"primary"}
            sx={{
              marginRight: 1,
              height: 20,
            }}
          />
        ) : null}
        {open ? <ExpandLess sx={{ color: contrast }} /> : <ExpandMore sx={{ color: contrast }} />}
      </ListItemButton>
      {children ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
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
