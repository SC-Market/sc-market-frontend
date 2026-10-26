import React from "react"
import { Alert, Paper, Stack, Typography } from "@mui/material"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { SignInBlurb } from "./SignInBlurb"
import { LegalAgreementNotice } from "./LegalAgreementNotice"

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
        {isCitizenIdEnabled && <SignInBlurb />}
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

      <LegalAgreementNotice />
    </Paper>
  )
}
