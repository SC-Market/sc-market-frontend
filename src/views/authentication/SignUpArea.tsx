import React, { useEffect, useState } from "react"
import { DiscordSignUpButton } from "../../components/button/DiscordSignUpButton"
import { CitizenIDSignUpButton } from "../../components/button/CitizenIDSignUpButton"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useSearchParams } from "react-router-dom"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';

export function SignUpArea() {
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
    if (isCitizenIdEnabled && error === "citizenid_account_not_verified") {
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
            {t("auth.signUpTitle", "Sign up for SC Market")}
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
          {isCitizenIdEnabled && <CitizenIDSignUpButton />}
          <DiscordSignUpButton />
        </Stack>
      </Paper>
    </Grid>
  )
}
