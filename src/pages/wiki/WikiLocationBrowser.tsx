/**
 * Wiki Location Browser
 * 
 * Hierarchical starmap (System → Planet → Moon → Outpost)
 * Task 8.10.7
 */

import React, { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Chip,
} from "@mui/material"
import { useGetWikiLocationsQuery, WikiLocationNode } from "../../store/wikiApi"
import { ExpandLess, ExpandMore, Public, Language, Terrain } from "@mui/icons-material"

interface LocationTreeItemProps {
  node: WikiLocationNode
  level: number
}

function LocationTreeItem({ node, level }: LocationTreeItemProps) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    if (node.children.length > 0) {
      setOpen(!open)
    }
  }

  const getIcon = () => {
    switch (node.type) {
      case "system":
        return <Public />
      case "planet":
        return <Language />
      case "moon":
        return <Terrain />
      default:
        return null
    }
  }

  const getTypeColor = () => {
    switch (node.type) {
      case "system":
        return "primary"
      case "planet":
        return "secondary"
      case "moon":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <>
      <ListItem disablePadding sx={{ pl: level * 2 }}>
        <ListItemButton onClick={handleClick}>
          {getIcon()}
          <ListItemText
            primary={node.name}
            sx={{ ml: 1 }}
            primaryTypographyProps={{
              fontWeight: level === 0 ? "bold" : "normal",
            }}
          />
          <Chip
            label={node.type}
            size="small"
            color={getTypeColor()}
            sx={{ mr: 1 }}
          />
          {node.children.length > 0 && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>
      {node.children.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <LocationTreeItem key={child.id} node={child} level={level + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}

export function WikiLocationBrowser() {
  const { data: locations, isLoading, error } = useGetWikiLocationsQuery({})

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load locations. Please try again.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Star Map & Locations
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Explore the Star Citizen universe hierarchy
      </Typography>

      <Card>
        <CardContent>
          {locations && locations.length > 0 ? (
            <List>
              {locations.map((location) => (
                <LocationTreeItem key={location.id} node={location} level={0} />
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No locations found
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
