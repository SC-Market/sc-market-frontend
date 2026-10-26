import React from "react"
import { Link as MuiLink, Typography } from "@mui/material"
import { Trans } from "react-i18next"

/** "Free to join — sign in with your RSI account (Citizen iD) or your Discord account." */
export function SignInBlurb() {
  return (
    <Typography variant="body1" color="text.secondary">
      <Trans
        i18nKey="auth.signInBlurb"
        defaults="Free to join — sign in with your RSI account (<citizenIdLink>Citizen iD</citizenIdLink>) or your Discord account."
        components={{
          citizenIdLink: (
            <MuiLink
              href="https://citizenid.space/"
              target="_blank"
              rel="noreferrer"
            />
          ),
        }}
      />
    </Typography>
  )
}
