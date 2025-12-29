import React from "react"
import { Grid, Link as MuiLink, Paper, Stack, Typography } from "@mui/material"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function LoginArea() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

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
        <Stack spacing={theme.layoutSpacing.compact}>
          <Typography variant="h4">
            {t("auth.signInTitle", "Sign in to SC Market")}
          </Typography>
          {isCitizenIdEnabled && (
            <Typography variant="body1" color="text.secondary">
              {t(
                "auth.citizenIdBlurb",
                "Sign in and verify with your RSI account to simplify your account management across the Star Citizen community tools using identity federation.",
              )}{" "}
              <MuiLink
                href="https://citizenid.space/"
                target="_blank"
                rel="noreferrer"
              >
                Citizen iD
              </MuiLink>
            </Typography>
          )}
        </Stack>

        <Stack spacing={theme.layoutSpacing.layout}>
          {isCitizenIdEnabled && <CitizenIDLoginButton />}
          <DiscordLoginButton />
        </Stack>
      </Paper>
    </Grid>
  )
}
