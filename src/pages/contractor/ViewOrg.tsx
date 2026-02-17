import React, { lazy, Suspense } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { Navigate, useParams } from "react-router-dom"
import { Contractor } from "../../datatypes/Contractor"
import { OrgInfoSkeleton, usePageOrg } from "../../features/contractor"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Skeleton } from "@mui/material"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { Page } from "../../components/metadata/Page"
import { PageBreadcrumbs } from "../../components/navigation"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { LazySection } from "../../components/layout/LazySection"

const OrgInfoLazy = lazy(() =>
  import("../../features/contractor/components/OrgInfo").then((module) => ({
    default: module.OrgInfo,
  })),
)

export function ViewOrg() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const pageData = usePageOrg(id!)

  return (
    <DetailPageLayout
      title={
        pageData.data?.contractor.name
          ? `${pageData.data.contractor.name} - ${t("org.orgTitle")}`
          : t("org.orgTitle")
      }
      breadcrumbs={[
        {
          label: t("contractors.title", "Contractors"),
          href: "/contractors",
        },
        {
          label: pageData.data?.contractor.name || t("org.orgTitle"),
        },
      ]}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<OrgInfoSkeleton />}
      sidebarOpen={true}
      maxWidth={false}
      noFooter={false}
    >
      {pageData.data && (
        <LazySection
          component={OrgInfoLazy}
          componentProps={{ contractor: pageData.data.contractor }}
          skeleton={OrgInfoSkeleton}
        />
      )}
    </DetailPageLayout>
  )
}

export function MyOrg() {
  const [contractor] = useCurrentOrg()
  const { t } = useTranslation()

  return (
    <Page title={t("org.myOrgTitle")}>
      {!contractor ? (
        <Navigate to={"/404"} />
      ) : (
        <OrgInfo contractor={contractor} />
      )}
    </Page>
  )
}

export function OrgSectionSkeleton() {
  return (
    <React.Fragment>
      <HeaderTitle>
        <Skeleton width={500} variant={"text"} />
      </HeaderTitle>
      <OrgInfoSkeleton />
    </React.Fragment>
  )
}
