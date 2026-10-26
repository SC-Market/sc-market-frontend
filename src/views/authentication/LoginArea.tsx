import React, { useState } from "react"
import { Grid, Paper, Stack, Typography, Tabs, Tab, Box } from "@mui/material"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import { DiscordSignUpButton } from "../../components/button/DiscordSignUpButton"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { CitizenIDSignUpButton } from "../../components/button/CitizenIDSignUpButton"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { SignInBlurb } from "./SignInBlurb"
import { LegalAgreementNotice } from "./LegalAgreementNotice"

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
          <Typography variant="h4" component="h2">
            {tabValue === "signin"
              ? t("auth.signInTitle", "Sign in to SC Market")
              : t("auth.signUpTitle", "Sign up for SC Market")}
          </Typography>
          {isCitizenIdEnabled && <SignInBlurb />}
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

        <LegalAgreementNotice action={tabValue} />
      </Paper>
    </Grid>
  )
}
