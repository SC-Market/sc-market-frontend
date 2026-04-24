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
  Grid,
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
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useGetLocationsQuery, type WikiLocationNode } from "../../store/api/v2/market"
import { ExpandLess, ExpandMore, Public, Language, Terrain } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { TableSkeleton } from "../../components/game-data/GameDataSkeletons"

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
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: locations, isLoading, error } = useGetLocationsQuery({})

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wiki.locations.title", "Star Map & Locations")}
        headerTitle={t("wiki.locations.title", "Star Map & Locations")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}><TableSkeleton rows={12} /></Grid>
      </StandardPageLayout>
    )
  }

  if (error) {
    return (
      <StandardPageLayout
        title={t("wiki.locations.title", "Star Map & Locations")}
        headerTitle={t("wiki.locations.title", "Star Map & Locations")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">Failed to load locations. Please try again.</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={t("wiki.locations.title", "Star Map & Locations")}
      headerTitle={t("wiki.locations.title", "Star Map & Locations")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
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
      </Grid>
    </StandardPageLayout>
  )
}
