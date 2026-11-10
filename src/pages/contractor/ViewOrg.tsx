import { useParams } from "react-router-dom"
import { Suspense } from "react"
import { OrgInfoSkeleton, usePageOrg } from "../../features/contractor"
import { useCookies } from "react-cookie"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { useTranslation } from "react-i18next"
import { BannerPageLayout } from "../../components/layout/BannerPageLayout"
import { orgPageTitle } from "../../seo/entityHeads"
import { lazyWithRetry } from "../../util/lazyWithRetry"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"
import { PATHS } from "../../routes/paths"

// Lazy load OrgInfo component
const OrgInfo = lazyWithRetry(() =>
  import("../../features/contractor").then((module) => ({
    default: module.OrgInfo,
  })),
)

export function ViewOrg() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const pageData = usePageOrg(id!)
  // On an org's white-label domain: no crumb into SC Market's org directory.
  const { isCustomDomain } = useCustomDomain()

  return (
    <BannerPageLayout
      title={
        pageData.data?.contractor.name
          ? orgPageTitle(pageData.data.contractor.name, t("org.orgTitle"))
          : t("org.orgTitle")
      }
      breadcrumbs={[
        ...(isCustomDomain
          ? []
          : [
              {
                label: t("contractors.title", "Contractors"),
                href: PATHS.contractors,
              },
            ]),
        {
          label: pageData.data?.contractor.name || t("org.loading"),
        },
      ]}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<OrgInfoSkeleton />}
      sidebarOpen={true}
    >
      {pageData.data && (
        <Suspense fallback={<OrgInfoSkeleton />}>
          <OrgInfo contractor={pageData.data.contractor} />
        </Suspense>
      )}
    </BannerPageLayout>
  )
}

export function MyOrg() {
  // The org selected in the sidebar (the `current_contractor` cookie), the
  // same one OrgRoute gates /myorg on; its query is already cached by then.
  // Not CurrentOrgContext: only /org/:contractor_id pages fill that, so
  // opening /myorg directly showed the skeleton forever.
  const [cookies] = useCookies(["current_contractor"])
  const {
    data: contractor,
    isLoading,
    error,
  } = useGetContractorBySpectrumIDQuery(cookies.current_contractor, {
    skip: !cookies.current_contractor,
  })
  const { t } = useTranslation()

  return (
    <BannerPageLayout
      title={t("org.myOrgTitle")}
      isLoading={isLoading}
      error={error}
      skeleton={<OrgInfoSkeleton />}
      sidebarOpen={true}
    >
      {contractor && (
        <Suspense fallback={<OrgInfoSkeleton />}>
          <OrgInfo contractor={contractor} />
        </Suspense>
      )}
    </BannerPageLayout>
  )
}
