import React from "react"
import { Button, Divider, Grid, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function PageBody404() {
  const { t } = useTranslation()
  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant={"h3"}
          sx={{ fontWeight: "bold" }}
          color={"text.secondary"}
          align={"center"}
        >
          {t("error404.title")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t("error404.subtitle")}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
        <Link
          to={"/dashboard"}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Button color={"secondary"} variant={"outlined"}>
            {t("error404.returnToDashboard")}
          </Button>
        </Link>
      </Grid>
    </>
  )
}

export function Error404() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      title={"404"}
      maxWidth={"md"}
      sidebarOpen={true}
      noTopSpacer={false}
    >
      <PageBody404 />
    </StandardPageLayout>
  )
}
