import React from "react"
import { Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { FlatSection } from "../../../components/paper/Section"
import { PushSetupPanel } from "./PushSetupPanel"

/**
 * Settings -> Notifications -> Push notifications: the same FlatSection
 * frame as the Email Address section below it (title on the left, content
 * left-aligned on the right from lg up, stacked on phones). Which events
 * send a push is the preferences matrix above; this is the device setup.
 */
export function PushNotificationSettings() {
  const { t } = useTranslation()
  return (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid item xs={12}>
        <FlatSection title={t("settings.pushNotifications.title")}>
          <Grid item xs={12}>
            <PushSetupPanel />
          </Grid>
        </FlatSection>
      </Grid>
    </Grid>
  )
}
