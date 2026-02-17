import React from "react"
import { Button, Divider, Grid } from "@mui/material"
import { CreateRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { MyServices } from "../../views/orders/Services"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageMyServices } from "../../features/contracting/hooks/usePageMyServices"

export function MyServicesPage(props: {}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const pageData = usePageMyServices()

  const headerActions = (
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
        {t("services.createService")}
      </Button>
    </Link>
  )

  return (
    <StandardPageLayout
      title={t("services.myServices")}
      sidebarOpen={true}
      maxWidth="lg"
      isLoading={pageData.isLoading}
      error={pageData.error}
      headerTitle={t("services.myServices")}
      headerActions={headerActions}
    >
      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid
        item
        container
        xs={12}
        lg={12}
        spacing={theme.layoutSpacing.layout}
        sx={{ transition: "0.3s" }}
      >
        <MyServices status={"active"} />
      </Grid>

      <Grid
        item
        container
        xs={12}
        lg={12}
        spacing={theme.layoutSpacing.layout}
        sx={{ transition: "0.3s" }}
      >
        <MyServices status={"inactive"} />
      </Grid>
    </StandardPageLayout>
  )
}
