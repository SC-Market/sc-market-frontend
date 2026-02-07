import React from "react"
import {
  Grid,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetUserProfileQuery } from "../../store/profile"
import { useBottomNavTabs, BottomNavTab } from "../../hooks/settings/useBottomNavTabs"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FlatSection } from "../layout/FlatSection"

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
    <FlatSection title={t("settings.bottomNav.title", "Bottom Navigation")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t("settings.bottomNav.description", "Choose which tabs appear in your mobile bottom navigation")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
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
      </Grid>
    </FlatSection>
  )
}
