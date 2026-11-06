import { useState } from "react"
import {
  Box,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material"
import { ExpandLessRounded, ExpandMoreRounded } from "@mui/icons-material"
import { type WikiLocationNode } from "../../store/api/v2/market"
import {
  LocationDetail,
  SYSTEM_COLORS,
  getAmenityIcon,
  getAmenityColor,
} from "./WikiLocationDetail"

export function filterTree(
  nodes: WikiLocationNode[],
  search: string,
  typeFilter: string,
  systemFilter: string,
): WikiLocationNode[] {
  const s = search.toLowerCase()
  const matchesFilter = (n: WikiLocationNode): boolean => {
    const nameMatch = !s || n.name.toLowerCase().includes(s)
    const typeMatch =
      typeFilter === "All" || n.type?.toLowerCase() === typeFilter.toLowerCase()
    const sysMatch = systemFilter === "All" || n.jurisdiction === systemFilter
    if (nameMatch && typeMatch && sysMatch) return true
    return n.children.some(matchesFilter)
  }
  const prune = (nodes: WikiLocationNode[]): WikiLocationNode[] =>
    nodes
      .filter(matchesFilter)
      .map((n) => ({ ...n, children: prune(n.children) }))
  return prune(nodes)
}

export function LocationTreeItem({
  node,
  level,
}: {
  node: WikiLocationNode
  level: number
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = node.children.length > 0
  const typeLower = node.type?.toLowerCase() || ""
  const systemColor = node.jurisdiction
    ? SYSTEM_COLORS[node.jurisdiction]
    : undefined

  const typeColor = ((): "primary" | "info" | "warning" | "default" => {
    switch (typeLower) {
      case "planet":
        return "info"
      case "moon":
        return "default"
      case "station":
        return "primary"
      case "outpost":
        return "warning"
      default:
        return "primary"
    }
  })()

  return (
    <>
      <ListItem disablePadding sx={{ pl: level * 2 }}>
        <ListItemButton onClick={() => setOpen(!open)} sx={{ borderRadius: 1 }}>
          {/* System color dot for top-level items */}
          {level === 0 && systemColor && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: systemColor,
                mr: 1.5,
                flexShrink: 0,
              }}
            />
          )}
          {node.navIcon && (
            <Typography sx={{ mr: 1, fontSize: 16 }}>{node.navIcon}</Typography>
          )}
          <ListItemText
            primary={node.name}
            primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
          />
          <Chip
            label={node.type}
            size="small"
            color={typeColor}
            sx={{ mr: 1, height: 20, fontSize: "0.65rem" }}
          />
          {node.amenities.slice(0, 2).map((a) => (
            <Chip
              key={a}
              icon={getAmenityIcon(a) || undefined}
              label={a}
              size="small"
              color={getAmenityColor(a)}
              variant="outlined"
              sx={{
                mr: 0.5,
                height: 18,
                fontSize: "0.6rem",
                display: { xs: "none", md: "flex" },
              }}
            />
          ))}
          {open ? (
            <ExpandLessRounded fontSize="small" />
          ) : (
            <ExpandMoreRounded fontSize="small" />
          )}
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pl: level * 2 }}>
          <LocationDetail node={node} />
        </Box>
        {hasChildren && (
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <LocationTreeItem key={child.id} node={child} level={level + 1} />
            ))}
          </List>
        )}
      </Collapse>
    </>
  )
}
