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
          {t("auth.title")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.email")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.username")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.password")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.repeatPassword")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12} alignItems={"center"} container>
        <Typography display={"inline"}>{t("auth.loginWith")}</Typography>
        <ButtonGroup
          variant="outlined"
          aria-label={t("auth.aria.outlinedGroup")}
        >
          <IconButton aria-label={t("auth.google", "Google")} color={"primary"}>
            <Google />
          </IconButton>
          <IconButton aria-label={t("auth.discord", "Discord")} color={"primary"}>
            <Discord />
          </IconButton>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={8}>
        <Typography>
          <Checkbox inputProps={{ "aria-label": t("auth.terms") }} />
          {t("auth.terms")}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Button variant={"outlined"}>{t("auth.submit")}</Button>
      </Grid>
    </Section>
  )
}
