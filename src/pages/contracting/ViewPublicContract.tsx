import {
  PublicContract,
  useGetPublicContractQuery,
} from "../../store/public_contracts"
import { Link, useParams } from "react-router-dom"
import { Helmet } from "react-helmet"
import { Page } from "../../components/metadata/Page"
import { FRONTEND_URL } from "../../util/constants"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { PageBreadcrumbs } from "../../components/navigation"
import { Grid } from "@mui/material"
import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { PageBody404 } from "../errors/Error404"
import { ContractDetailsArea } from "../../views/contracts/ContractDetailsArea"
import { ContractOfferForm } from "../../views/contracts/ContractOfferForm"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"
import { ContractDetailsTableSkeleton } from "../../components/skeletons"

export function ViewPublicContractBody(props: { contract: PublicContract }) {
  const { contract } = props
  const { data: profile } = useGetUserProfileQuery()

  return (
    <>
      <ContractDetailsArea contract={contract} />
      {profile && <ContractOfferForm contract={contract} />}
    </>
  )
}

export function ViewPublicContract() {
  const { t } = useTranslation()
  const { contract_id } = useParams<{ contract_id: string }>()
  const {
    data: contract,
    isError,
    isLoading,
    isFetching,
  } = useGetPublicContractQuery(contract_id || "")

  return (
    <Page title={`${contract?.title} - ${t("contracts.publicOrderTitle")}`}>
      {contract && (
        <Helmet>
          {/* Open Graph Meta Tags */}
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={`${FRONTEND_URL}/contracts/public/${contract_id}`}
          />
          <meta property="og:title" content={`${contract.title} - SC Market`} />
          <meta property="og:description" content={contract.description} />
          <meta
            property="og:image"
            content={`${FRONTEND_URL}/homepage-preview.png`}
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
            content={`${FRONTEND_URL}/homepage-preview.png`}
          />
        </Helmet>
      )}
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <Grid item xs={12}>
          <PageBreadcrumbs
            items={[
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
          />
        </Grid>
        <HeaderTitle>
          {contract?.title || t("contracts.viewContract")}
        </HeaderTitle>

        {isError ? (
          <PageBody404 />
        ) : contract ? (
          <ViewPublicContractBody contract={contract} />
        ) : isLoading || isFetching ? (
          <ContractDetailsTableSkeleton />
        ) : null}
      </ContainerGrid>
    </Page>
  )
}
