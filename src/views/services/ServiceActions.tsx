import { Link } from "react-router-dom"
import { Button, Grid } from "@mui/material"
import { CreateRounded } from "@mui/icons-material"
import React from "react"
import { useTranslation } from "react-i18next" // added localisation

export function ServiceActions() {
  const { t } = useTranslation()

  return (
    <Grid item>
      <Link
        to={"/order/service/create"}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        <Button
          color={"secondary"}
          startIcon={<CreateRounded />}
          variant={"contained"}
          size={"large"}
        >
          {t("service_actions.create_service")}
        </Button>
      </Link>
    </Grid>
  )
}
