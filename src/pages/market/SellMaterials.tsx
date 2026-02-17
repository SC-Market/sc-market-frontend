import React from "react"
import { SellMaterialsList } from "../../features/market/components/SellMaterialsList"
import { Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function SellMaterials(props: {}) {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("sellMaterials.commodities")}
      headerTitle={
        <>
          <div>{t("sellMaterials.title")}</div>
          <div style={{ fontSize: "1rem", fontWeight: 500, marginTop: "0.5rem" }}>
            {t("sellMaterials.subtitle")}
          </div>
        </>
      }
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item container xs={12} lg={12}>
        <SellMaterialsList {...props} />
      </Grid>
    </StandardPageLayout>
  )
}
