import { Section } from "../../components/paper/Section"
import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material"
import React from "react"
import Checkbox from "@mui/material/Checkbox"
import { Google } from "@mui/icons-material"
import { Discord } from "../../components/icon/DiscordIcon"
import { useTranslation } from "react-i18next"

export function Authenticate(props: {}) {
  const { t } = useTranslation()

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("auth.title", "Sign Up")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.email", "Email")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.username", "Username")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.password", "Password")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t("auth.repeatPassword", "Repeat Password")}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12} alignItems={"center"} container>
        <Typography display={"inline"}>
          {t("auth.loginWith", "Login with")}
        </Typography>
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <IconButton color={"primary"}>
            <Google />
          </IconButton>
          <IconButton color={"primary"}>
            <Discord />
          </IconButton>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={8}>
        <Typography>
          <Checkbox />
          {t(
            "auth.terms",
            "By clicking here you agree to our terms of service",
          )}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Button variant={"outlined"}>{t("auth.submit", "Submit")}</Button>
      </Grid>
    </Section>
  )
}
