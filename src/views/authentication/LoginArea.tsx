import React from "react"
import { Grid, Link as MuiLink, Paper, Stack, Typography } from "@mui/material"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { useTranslation } from "react-i18next"

export function LoginArea() {
  const { t } = useTranslation()

  return (
    <Grid
      item
      xs={12}
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4">
            {t("auth.signInTitle", "Sign in to SC Market")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t(
              "auth.citizenIdBlurb",
              "Sign in and verify with your RSI account to simplify your account management across the Star Citizen community tools using identity federation.",
            )}
            {" "}
            <MuiLink
              href="https://citizenid.space/"
              target="_blank"
              rel="noreferrer"
            >
              Citizen ID
            </MuiLink>
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <CitizenIDLoginButton />
          <DiscordLoginButton />
        </Stack>
      </Paper>
    </Grid>
  )
}
