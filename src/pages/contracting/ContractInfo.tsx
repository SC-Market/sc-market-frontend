import React, { useState, lazy } from "react"
import { useParams } from "react-router-dom"
import { ContractAppOpenContext } from "../../hooks/contract/ContractApp"
import { useTranslation } from "react-i18next"
import { ContractDetailSkeleton } from "../../components/skeletons"
import { Grid } from "@mui/material"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { usePageContract } from "../../features/contracting"

// Lazy load content sections
const ViewContract = lazy(() =>
  import("../../views/contracts/ViewContract").then((module) => ({
    default: module.ViewContract,
  })),
)
const ContractApp = lazy(() =>
  import("../../views/contracts/ContractApp").then((module) => ({
    default: module.ContractApp,
  })),
)

export function ContractInfo(props: {}) {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [appOpen, setAppOpen] = useState(false)

  const pageData = usePageContract(id!)
  const contract = pageData.data?.contract

  return (
    <ContractAppOpenContext.Provider value={[appOpen, setAppOpen]}>
      <DetailPageLayout
        title={t("contracts.contractTitle")}
        entityTitle={t("contracts.contractTitle")}
        isLoading={pageData.isLoading}
        error={pageData.error}
        skeleton={<ContractDetailSkeleton />}
        sidebarOpen={true}
        maxWidth={appOpen ? "lg" : "md"}
      >
        {contract && (
          <>
            <ViewContract listing={contract} />
            {appOpen && (
              <Grid item xs={12} lg={4}>
                <ContractApp />
              </Grid>
            )}
          </>
        )}
      </DetailPageLayout>
    </ContractAppOpenContext.Provider>
  )
}
