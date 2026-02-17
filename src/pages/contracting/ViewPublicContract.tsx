import { useParams } from "react-router-dom"
import { Helmet } from "react-helmet"
import { FRONTEND_URL } from "../../util/constants"
import { Grid } from "@mui/material"
import React, { lazy } from "react"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"
import { ContractDetailsTableSkeleton } from "../../components/skeletons"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { usePagePublicContract } from "../../features/contracting"
import { PublicContract } from "../../store/public_contracts"

// Lazy load content sections
const ContractDetailsArea = lazy(() =>
  import("../../views/contracts/ContractDetailsArea").then((module) => ({
    default: module.ContractDetailsArea,
  })),
)
const ContractOfferForm = lazy(() =>
  import("../../views/contracts/ContractOfferForm").then((module) => ({
    default: module.ContractOfferForm,
  })),
)

export function ViewPublicContractBody(props: { contract: PublicContract }) {
  const { contract } = props
  const { data: profile } = useGetUserProfileQuery()

  return (
    <>
      <ContractDetailsArea contract={contract} />
      {profile && (
        <Grid item xs={12}>
          <ContractOfferForm contract={contract} />
        </Grid>
      )}
    </>
  )
}

export function ViewPublicContract() {
  const { t } = useTranslation()
  const { contract_id } = useParams<{ contract_id: string }>()

  const pageData = usePagePublicContract(contract_id || "")
  const contract = pageData.data?.contract

  return (
    <DetailPageLayout
      title={`${contract?.title || t("contracts.viewContract")} - ${t("contracts.publicOrderTitle")}`}
      breadcrumbs={[
        {
          label: t("contracts.publicContracts"),
          href: "/contracts",
        },
        {
          label:
            contract?.title ||
            t("contracts.contractShort", {
              id: (contract_id || "").substring(0, 8).toUpperCase(),
            }),
        },
      ]}
      entityTitle={contract?.title || t("contracts.viewContract")}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<ContractDetailsTableSkeleton />}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {contract && (
        <>
          <Helmet>
            {/* Open Graph Meta Tags */}
            <meta property="og:type" content="website" />
            <meta
              property="og:url"
              content={`${FRONTEND_URL}/contracts/public/${contract_id}`}
            />
            <meta
              property="og:title"
              content={`${contract.title} - SC Market`}
            />
            <meta property="og:description" content={contract.description} />
            <meta
              property="og:image"
              content={`${FRONTEND_URL}/homepage-preview.webp`}
            />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:url"
              content={`${FRONTEND_URL}/contracts/public/${contract_id}`}
            />
            <meta
              name="twitter:title"
              content={`${contract.title} - SC Market`}
            />
            <meta name="twitter:description" content={contract.description} />
            <meta
              name="twitter:image"
              content={`${FRONTEND_URL}/homepage-preview.webp`}
            />
          </Helmet>
          <ViewPublicContractBody contract={contract} />
        </>
      )}
    </DetailPageLayout>
  )
}
