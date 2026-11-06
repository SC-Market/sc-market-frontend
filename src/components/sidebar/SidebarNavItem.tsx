import {
  Box,
  Chip,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StarBorderRounded, StarRounded } from "@mui/icons-material"
import { haptic } from "../../util/haptics"
import type { NavItem } from "./sidebarNavItems"
import type { useSidebarStyles } from "./sidebarStyles"

type SidebarStyles = ReturnType<typeof useSidebarStyles>

/** A single nav link with its pin (star) toggle. */
export function SidebarNavItem({
  item,
  nested,
  selected,
  starred,
  pinReady,
  onToggleStar,
  onNavigate,
  itemSx,
  pinSx,
}: {
  item: NavItem
  nested: boolean
  selected: boolean
  starred: boolean
  /** The real pin buttons; until then a static look-alike icon. */
  pinReady: boolean
  onToggleStar: (path: string) => void
  onNavigate: () => void
  itemSx: SidebarStyles["itemSx"]
  pinSx: SidebarStyles["pinSx"]
}) {
  const { t } = useTranslation()
  return (
    <ListItemButton
      component={Link}
      to={item.to}
      selected={selected}
      sx={itemSx}
      onClick={() => {
        haptic.light()
        onNavigate()
      }}
    >
      <ListItemIcon sx={{ minWidth: nested ? 32 : 36 }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText
        sx={{ flex: 1, minWidth: 0 }}
        primary={item.label}
        primaryTypographyProps={{ variant: "subtitle2", noWrap: true }}
      />
      {item.badge && item.badge > 0 ? (
        <Chip
          label={item.badge}
          size="small"
          color="primary"
          sx={{
            ml: 1,
            height: 20,
            minWidth: 20,
            "& .MuiChip-label": { px: 0.75, fontSize: "0.7rem" },
          }}
        />
      ) : null}
      {pinReady ? (
        <Tooltip
          title={starred ? t("nav.unstar", "Unpin") : t("nav.star", "Pin")}
        >
          <IconButton
            className="nav-star"
            size="small"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleStar(item.to)
            }}
            sx={pinSx(starred)}
          >
            {starred ? (
              <StarRounded fontSize="small" />
            ) : (
              <StarBorderRounded fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      ) : (
        <Box
          component="span"
          aria-hidden
          className="nav-star"
          sx={{ ...pinSx(starred), display: "inline-flex" }}
        >
          {starred ? (
            <StarRounded fontSize="small" />
          ) : (
            <StarBorderRounded fontSize="small" />
          )}
        </Box>
      )}
    </ListItemButton>
  )
}
