import { Link } from "react-router-dom"
import { Button, Grid, useMediaQuery } from "@mui/material"
import { CreateRounded } from "@mui/icons-material"
import React from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ServiceActions() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

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
