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
import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { PageBody404 } from "../errors/Error404"
import { ContractDetailsArea } from "../../views/contracts/ContractDetailsArea"
import { ContractOfferForm } from "../../views/contracts/ContractOfferForm"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"
import { ContractDetailsTableSkeleton } from "../../components/skeletons"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';

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
