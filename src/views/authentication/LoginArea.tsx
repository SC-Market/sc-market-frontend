import React, { useState } from "react"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import { DiscordSignUpButton } from "../../components/button/DiscordSignUpButton"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { CitizenIDSignUpButton } from "../../components/button/CitizenIDSignUpButton"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';

export function LoginArea() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [tabValue, setTabValue] = useState<"signin" | "signup">("signin")

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: "signin" | "signup",
  ) => {
    setTabValue(newValue)
  }

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
            {tabValue === "signin"
              ? t("auth.signInTitle", "Sign in to SC Market")
              : t("auth.signUpTitle", "Sign up for SC Market")}
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

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label={t("auth.authTabs", "Authentication tabs")}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={t("auth.signIn", "Sign in")}
            value="signin"
            aria-label={t("auth.signInTab", "Sign in tab")}
          />
          <Tab
            label={t("auth.signUp", "Sign up")}
            value="signup"
            aria-label={t("auth.signUpTab", "Sign up tab")}
          />
        </Tabs>

        <Box sx={{ pt: 2 }}>
          <Stack spacing={theme.layoutSpacing.layout}>
            {tabValue === "signin" ? (
              <>
                {isCitizenIdEnabled && <CitizenIDLoginButton />}
                <DiscordLoginButton />
              </>
            ) : (
              <>
                {isCitizenIdEnabled && <CitizenIDSignUpButton />}
                <DiscordSignUpButton />
              </>
            )}
          </Stack>
        </Box>
      </Paper>
    </Grid>
  )
}
