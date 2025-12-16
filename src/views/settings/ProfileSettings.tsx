import React from "react"
import { Grid } from "@mui/material"
import { useGetUserProfileQuery, useProfileGetLinksQuery } from "../../store/profile"
import { AuthenticateRSI } from "../authentication/AuthenticateRSI"
import { ReVerifyProfile } from "./ReVerifyProfile"
import { UnlinkProfile } from "./UnlinkProfile"
import { AccountLinks } from "./AccountLinks"

export function ProfileSettings() {
  const { data: profile } = useGetUserProfileQuery()
  const { data: links } = useProfileGetLinksQuery()

  if (!profile?.rsi_confirmed) {
    return <AuthenticateRSI />
  }

  // Check if Citizen ID is linked - if so, hide unlink section
  // Citizen ID is the authoritative source for RSI details when linked
  const hasCitizenID = Array.isArray(links)
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
