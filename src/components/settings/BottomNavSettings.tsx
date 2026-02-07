import React from "react"
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetUserProfileQuery } from "../../store/profile"
import { useBottomNavTabs, AVAILABLE_TABS, BottomNavTab } from "../../hooks/settings/useBottomNavTabs"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function BottomNavSettings() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"))
  const { data: userProfile } = useGetUserProfileQuery()
  const isLoggedIn = !!userProfile
  const { enabledTabs, availableTabs, setTabs } = useBottomNavTabs(isLoggedIn)

  if (!isMobile) {
    return null
  }

  const handleToggle = (tabId: string) => {
    if (enabledTabs.includes(tabId as BottomNavTab)) {
      setTabs(enabledTabs.filter((t: BottomNavTab) => t !== tabId))
    } else {
      setTabs([...enabledTabs, tabId as BottomNavTab])
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("settings.bottom_nav_tabs", "Bottom Navigation Tabs")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("settings.bottom_nav_tabs_description", "Choose which tabs appear in your mobile bottom navigation")}
      </Typography>
      <FormGroup>
        {availableTabs.map((tab) => (
          <FormControlLabel
            key={tab.id}
            control={
              <Checkbox
                checked={enabledTabs.includes(tab.id)}
                onChange={() => handleToggle(tab.id)}
              />
            }
            label={t(tab.labelKey)}
          />
        ))}
      </FormGroup>
    </Box>
  )
}
