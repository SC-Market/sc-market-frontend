import React, { useEffect, useState } from "react"
import {
  Alert,
  Grid,
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
import { useSearchParams } from "react-router-dom"

export function SignInArea() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) {
      setErrorMessage(null)
      return
    }

    let message: string | null = null

    // Handle specific error codes
    if (error === "account_not_found") {
      message =
        searchParams.get("error_description") ||
        t("auth.accountNotFound", "No account found. Please sign up first.")
    } else if (
      isCitizenIdEnabled &&
      error === "citizenid_account_not_verified"
    ) {
      message =
        searchParams.get("error_description") ||
        t(
          "auth.citizenidAccountNotVerified",
          "Your Citizen iD account must be verified to sign up or log in.",
        )
    } else if (isCitizenIdEnabled && error === "citizenid_auth_failed") {
      message =
        searchParams.get("error_description") ||
        t("auth.authFailed", "Authentication failed. Please try again.")
    } else if (isCitizenIdEnabled && error === "citizenid_login_failed") {
      message =
        searchParams.get("error_description") ||
        t("auth.loginFailed", "Failed to sign in. Please try again.")
    } else if (isCitizenIdEnabled && error === "citizenid_oauth_error") {
      message =
        searchParams.get("error_description") ||
        t(
          "auth.oauthError",
          "An error occurred during authentication. Please try again.",
        )
    } else {
      // Fallback for any unhandled errors
      const errorDescription = searchParams.get("error_description")
      if (errorDescription) {
        message = errorDescription
      } else if (error.startsWith("citizenid_")) {
        message = t(
          "auth.genericAuthError",
          "An authentication error occurred. Please try again or contact support if the problem persists.",
        )
      } else {
        message = t("auth.genericError", "An error occurred. Please try again.")
      }
    }

    if (message) {
      setErrorMessage(message)
      // Clear error from URL after displaying
      searchParams.delete("error")
      searchParams.delete("error_description")
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, t, isCitizenIdEnabled])

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
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={theme.layoutSpacing.layout}>
          {isCitizenIdEnabled && <CitizenIDLoginButton />}
          <DiscordLoginButton />
        </Stack>
      </Paper>
    </Grid>
  )
}
