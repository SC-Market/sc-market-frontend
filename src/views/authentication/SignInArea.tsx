import React from "react"
import {
  Alert,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export interface SignInAreaProps {
  errorMessage?: string | null
  onClearError?: () => void
}

export function SignInArea({ errorMessage, onClearError }: SignInAreaProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: "100%",
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

      {errorMessage && (
        <Alert severity="error" onClose={onClearError}>
          {errorMessage}
        </Alert>
      )}

      <Stack spacing={theme.layoutSpacing.layout}>
        {isCitizenIdEnabled && <CitizenIDLoginButton />}
        <DiscordLoginButton />
      </Stack>
    </Paper>
  )
}
