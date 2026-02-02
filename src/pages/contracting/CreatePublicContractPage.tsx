import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import { CreatePublicContract } from "../../views/contracts/CreatePublicContract"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Button } from "@mui/material"
import { ArrowBackRounded } from "@mui/icons-material"

export function CreatePublicContractPage() {
  const { t } = useTranslation()

  return (
    <Page title={t("contracts.createOpenContract")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <Link
          to="/contracts"
          style={{ color: "inherit", textDecoration: "none", marginBottom: 8 }}
        >
          <Button startIcon={<ArrowBackRounded />} size="small" sx={{ mb: 1 }}>
            {t("contracts.backToOpenContracts", "Back to Open Contracts")}
          </Button>
        </Link>
        <HeaderTitle lg={12} xl={12}>
          {t("contracts.createOpenContract")}
        </HeaderTitle>
        <CreatePublicContract />
      </ContainerGrid>
    </Page>
  )
}
