import { Section } from "../../components/paper/Section"
import { Button, Divider, Grid, Typography } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useTranslation } from "react-i18next"

export function MemberBalance() {
  const profile = useGetUserProfileQuery()
  const { t, i18n } = useTranslation()

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("MemberBalance.myBalance")}
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
          {profile.data?.balance &&
            profile.data?.balance.toLocaleString(i18n.language)}{" "}
          aUEC
        </Typography>
      </Grid>
      <Grid item xs={12} container justifyContent={"space-between"}>
        <Link
          to={`/send`}
          style={{
            textDecoration: "none",
            color: "inherit",
            marginBottom: 2,
            marginRight: 2,
          }}
        >
          <Button color={"primary"} variant={"outlined"}>
            {t("MemberBalance.sendAUEC")}
          </Button>
        </Link>
        <Button color={"secondary"} variant={"outlined"}>
          {t("MemberBalance.withdraw")}
        </Button>
      </Grid>
    </Section>
  )
}
