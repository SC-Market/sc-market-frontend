import React from "react"
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material"
import { DragHandle } from "@mui/icons-material"
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
  const { enabledTabs, availableTabs, setTabs, maxTabs } = useBottomNavTabs(isLoggedIn)

  if (!isMobile) {
    return null
  }

  const handleToggle = (tabId: BottomNavTab) => {
    if (enabledTabs.includes(tabId)) {
      setTabs(enabledTabs.filter((t: BottomNavTab) => t !== tabId))
    } else if (enabledTabs.length < maxTabs) {
      setTabs([...enabledTabs, tabId])
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newTabs = [...enabledTabs]
    ;[newTabs[index - 1], newTabs[index]] = [newTabs[index], newTabs[index - 1]]
    setTabs(newTabs)
  }

  const handleMoveDown = (index: number) => {
    if (index === enabledTabs.length - 1) return
    const newTabs = [...enabledTabs]
    ;[newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]]
    setTabs(newTabs)
  }

  return (
    <FlatSection title={t("settings.bottomNav.title", "Bottom Navigation")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t("settings.bottomNav.description", "Choose up to 5 tabs and reorder them")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          {t("settings.bottomNav.selected", "Selected")} ({enabledTabs.length}/{maxTabs})
        </Typography>
        <List dense>
          {enabledTabs.map((tabId, index) => {
            const tab = AVAILABLE_TABS.find(t => t.id === tabId)
            if (!tab) return null
            return (
              <ListItem key={tabId}>
                <ListItemIcon>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <DragHandle sx={{ transform: "rotate(-90deg)" }} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleMoveDown(index)}
                      disabled={index === enabledTabs.length - 1}
                    >
                      <DragHandle sx={{ transform: "rotate(90deg)" }} />
                    </IconButton>
                  </Box>
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
            .filter(tab => !enabledTabs.includes(tab.id))
            .map((tab) => (
              <ListItem key={tab.id}>
                <ListItemText primary={t(tab.labelKey)} />
                <Checkbox
                  edge="end"
                  checked={false}
                  onChange={() => handleToggle(tab.id)}
                  disabled={enabledTabs.length >= maxTabs}
                />
              </ListItem>
            ))}
        </List>
      </Grid>
    </FlatSection>
  )
}
