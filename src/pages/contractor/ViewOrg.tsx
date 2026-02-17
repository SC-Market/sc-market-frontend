import { Suspense } from "react"
import { Navigate, useParams } from "react-router-dom"
import { OrgInfo, OrgInfoSkeleton, usePageOrg } from "../../features/contractor"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { ErrorPage } from "../errors/ErrorPage"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { SerializedError } from "@reduxjs/toolkit"

export function ViewOrg() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const pageData = usePageOrg(id!)

  return (
    <Page
      title={
        pageData.data?.contractor.name
          ? `${pageData.data.contractor.name} - ${t("org.orgTitle")}`
          : t("org.orgTitle")
      }
    >
      {pageData.isLoading ? (
        <OrgInfoSkeleton />
      ) : shouldRedirectTo404(
          pageData.error as FetchBaseQueryError | SerializedError,
        ) ? (
        <Navigate to={"/404"} />
      ) : shouldShowErrorPage(
          pageData.error as FetchBaseQueryError | SerializedError,
        ) ? (
        <ErrorPage />
      ) : pageData.data ? (
        <Suspense fallback={<OrgInfoSkeleton />}>
          <OrgInfo contractor={pageData.data.contractor} />
        </Suspense>
      ) : null}
    </Page>
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
