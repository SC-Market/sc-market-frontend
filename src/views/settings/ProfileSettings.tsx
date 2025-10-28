import React from "react"
import { Grid } from "@mui/material"
import { useGetUserProfileQuery } from "../../store/profile"
import { AuthenticateRSI } from "../authentication/AuthenticateRSI"
import { ReVerifyProfile } from "./ReVerifyProfile"
import { UnlinkProfile } from "./UnlinkProfile"

export function ProfileSettings() {
  const { data: profile } = useGetUserProfileQuery()

  if (!profile?.rsi_confirmed) {
    return <AuthenticateRSI />
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <ReVerifyProfile />
      </Grid>
      <Grid item xs={12}>
        <UnlinkProfile />
      </Grid>
    </Grid>
  )
}
