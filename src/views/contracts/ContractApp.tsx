import { Section } from "../../components/paper/Section"
import React from "react"
import { Button, Grid, TextField, Typography } from "@mui/material"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useTranslation } from "react-i18next"

export function ContractApp(props: {}) {
  const { data: profile } = useGetUserProfileQuery()
  const { t } = useTranslation()

  const orgName = profile?.contractors?.[0]?.name

  return (
    <Section xs={12} lg={4} title={t("contractApp.apply")}>
      <Grid item xs={12}>
        <Typography variant={"subtitle1"}>
          {t("contractApp.applying_as")}{" "}
          <Typography color={"secondary"} display={"inline"}>
            {orgName || profile?.username}
          </Typography>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="order-type"
          multiline
          maxRows={5}
          minRows={5}
          color={"primary"}
          label={t("contractApp.note")}
        ></TextField>
      </Grid>
      <Grid item xs={12} container justifyContent={"center"}>
        <Button color={"primary"} variant={"outlined"}>
          {t("contractApp.submit")}
        </Button>
      </Grid>
    </Section>
  )
}
