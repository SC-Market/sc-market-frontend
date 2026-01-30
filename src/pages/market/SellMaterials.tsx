import React from "react"
import { SellMaterialsList } from "../../features/market/components/SellMaterialsList"
import { Grid } from "@mui/material"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"

export function SellMaterials(props: {}) {
  const { t } = useTranslation()

  return (
    <Page title={t("sellMaterials.commodities")}>
      <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
        <HeaderTitle>{t("sellMaterials.title")}</HeaderTitle>
        <HeaderTitle variant={"h6"} sx={{ fontWeight: "500" }}>
          {t("sellMaterials.subtitle")}
        </HeaderTitle>

        <Grid item container xs={12} lg={12}>
          <SellMaterialsList {...props} />
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
