import React, { useState } from "react"
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { DragIndicator } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetUserProfileQuery } from "../../store/profile"
import { useBottomNavTabs, BottomNavTab, AVAILABLE_TABS } from "../../hooks/settings/useBottomNavTabs"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FlatSection } from "../paper/Section"

export function BottomNavSettings() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"))
  const { data: userProfile } = useGetUserProfileQuery()
  const isLoggedIn = !!userProfile
  const { enabledTabs, availableTabs, saveTabs, maxTabs } = useBottomNavTabs(isLoggedIn, true)
  
  const [localTabs, setLocalTabs] = useState<BottomNavTab[]>(enabledTabs)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  if (!isMobile) {
    return null
  }

  const handleToggle = (tabId: BottomNavTab) => {
    if (localTabs.includes(tabId)) {
      setLocalTabs(localTabs.filter((t: BottomNavTab) => t !== tabId))
    } else if (localTabs.length < maxTabs) {
      setLocalTabs([...localTabs, tabId])
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newTabs = [...localTabs]
    const draggedTab = newTabs[draggedIndex]
    newTabs.splice(draggedIndex, 1)
    newTabs.splice(index, 0, draggedTab)
    setLocalTabs(newTabs)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSave = () => {
    saveTabs(localTabs)
  }

  return (
    <FlatSection title={t("settings.bottomNav.title", "Bottom Navigation")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t("settings.bottomNav.description", "Choose up to 5 tabs and drag to reorder")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          {t("settings.bottomNav.selected", "Selected")} ({localTabs.length}/{maxTabs})
        </Typography>
        <List dense>
          {localTabs.map((tabId, index) => {
            const tab = AVAILABLE_TABS.find(t => t.id === tabId)
            if (!tab) return null
            return (
              <ListItem 
                key={tabId}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                sx={{ 
                  cursor: "grab",
                  "&:active": { cursor: "grabbing" },
                  opacity: draggedIndex === index ? 0.5 : 1,
                }}
              >
                <ListItemIcon>
                  <DragIndicator />
                </ListItemIcon>
                <ListItemText primary={t(tab.labelKey)} />
                <Checkbox
                  edge="end"
                  checked
                  onChange={() => handleToggle(tabId)}
                />
              </ListItem>
            )
          })}
        </List>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          {t("settings.bottomNav.available", "Available")}
        </Typography>
        <List dense>
          {availableTabs
            .filter(tab => !localTabs.includes(tab.id))
            .map((tab) => (
              <ListItem key={tab.id}>
                <ListItemText primary={t(tab.labelKey)} />
                <Checkbox
                  edge="end"
                  checked={false}
                  onChange={() => handleToggle(tab.id)}
                  disabled={localTabs.length >= maxTabs}
                />
              </ListItem>
            ))}
        </List>
      </Grid>
      <Grid item xs={12}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          fullWidth
        >
          {t("common.save", "Save")}
        </Button>
      </Grid>
    </FlatSection>
  )
}
