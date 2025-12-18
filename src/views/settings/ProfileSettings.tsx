import React from "react"
import { Grid } from "@mui/material"
import { useGetUserProfileQuery, useProfileGetLinksQuery } from "../../store/profile"
import { AuthenticateRSI } from "../authentication/AuthenticateRSI"
import { ReVerifyProfile } from "./ReVerifyProfile"
import { UnlinkProfile } from "./UnlinkProfile"
import { AccountLinks } from "./AccountLinks"
import { isCitizenIdEnabled } from "../../util/constants"

export function ProfileSettings() {
  const { data: profile } = useGetUserProfileQuery()
  const { data: links } = useProfileGetLinksQuery()

  if (!profile?.rsi_confirmed) {
    return <AuthenticateRSI />
  }

  // Check if Citizen iD is linked - if so, hide unlink section
  // Citizen iD is the authoritative source for RSI details when linked
  // Only check if feature is enabled
  const hasCitizenID = isCitizenIdEnabled && Array.isArray(links)
    ? links.some((link) => link.provider_type === "citizenid")
    : false

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
