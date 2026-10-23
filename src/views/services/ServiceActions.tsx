import { Link } from "react-router-dom"
import { Button, Grid } from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { CreateRounded } from "@mui/icons-material"
import React from "react"
import { useTranslation } from "react-i18next"

export function ServiceActions() {
  const { t } = useTranslation()
  const isMobile = useBreakpointDown("sm")

  return (
    <Grid container justifyContent={{ xs: "stretch", sm: "flex-end" }}>
      <Grid item xs={12} sm="auto">
        <Link
          to={"/order/service/create"}
          style={{ color: "inherit", textDecoration: "none", display: "block" }}
        >
          <Button
            color={"secondary"}
            startIcon={<CreateRounded />}
            variant={"contained"}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
          >
            {t("service_actions.create_service", {
              defaultValue: "Create Service",
            })}
          </Button>
        </Link>
      </Grid>
    </Grid>
  )
}
