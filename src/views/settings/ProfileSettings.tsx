import React from "react"
import { Grid, Typography, Divider } from "@mui/material"
import { useGetUserProfileQuery, useProfileGetLinksQuery } from "../../store/profile"
import { AuthenticateRSI } from "../authentication/AuthenticateRSI"
import { ReVerifyProfile } from "./ReVerifyProfile"
import { UnlinkProfile } from "./UnlinkProfile"
import { AccountLinks } from "./AccountLinks"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTranslation } from "react-i18next"

export function ProfileSettings() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const { data: links } = useProfileGetLinksQuery()

  // Check if Citizen iD is linked - if so, hide unlink section
  // Citizen iD is the authoritative source for RSI details when linked
  // Only check if feature is enabled
  const hasCitizenID = isCitizenIdEnabled && Array.isArray(links)
    ? links.some((link) => link.provider_type === "citizenid")
    : false

  // If user is not verified, show both verification options
  if (!profile?.rsi_confirmed) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            {t("settings.profile.verifyAccount", "Verify Your Account")}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "settings.profile.verifyAccountDescription",
              "You need to verify your account to access all features. Choose one of the following methods:",
            )}
          </Typography>
        </Grid>
        
        {isCitizenIdEnabled && (
          <>
            <Grid item xs={12}>
              <AccountLinks />
            </Grid>
            <Grid item xs={12}>
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.profile.or", "OR")}
                </Typography>
              </Divider>
            </Grid>
          </>
        )}
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t("settings.profile.manualVerification", "Manual Verification")}
          </Typography>
          <AuthenticateRSI />
        </Grid>
      </Grid>
    )
  }

  // User is verified - show normal settings
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <AccountLinks />
      </Grid>
      <Grid item xs={12}>
        <ReVerifyProfile />
      </Grid>
      {!hasCitizenID && (
        <Grid item xs={12}>
          <UnlinkProfile />
        </Grid>
      )}
    </Grid>
  )
}
