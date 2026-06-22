import { Section } from "../../components/paper/Section"
import { Button, Divider, Grid, Typography } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"
import { ORG_PATHS } from "../../routes/paths"

export function OrgBalance() {
  const [contractor] = useCurrentOrg()
  const { t, i18n } = useTranslation()

  return (
    <Section>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("orgBalance.balance")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"h4"}
          align={"left"}
          color={"primary"}
          sx={{ fontWeight: "bold", transition: "0.3s" }}
        >
          {contractor &&
            contractor?.balance &&
            contractor?.balance.toLocaleString(i18n.language)}{" "}
          aUEC
        </Typography>
      </Grid>
      <Grid item xs={12} container justifyContent={"space-between"}>
        <Link
          to={contractor?.spectrum_id ? ORG_PATHS.send(contractor.spectrum_id) : "/org/send"}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Button color={"primary"} variant={"outlined"}>
            {t("orgBalance.send")}
          </Button>
        </Link>
        <Button color={"secondary"} variant={"outlined"}>
          {t("orgBalance.withdraw")}
        </Button>
      </Grid>
    </Section>
  )
}
