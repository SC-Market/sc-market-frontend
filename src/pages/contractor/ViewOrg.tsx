import { Suspense, lazy } from "react"
import { useParams } from "react-router-dom"
import { OrgInfoSkeleton, usePageOrg } from "../../features/contractor"

const OrgInfo = lazy(() =>
  import("../../features/contractor").then((module) => ({
    default: module.OrgInfo,
  })),
)
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"
import { BannerPageLayout } from "../../components/layout/BannerPageLayout"

export function ViewOrg() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const pageData = usePageOrg(id!)

  return (
    <BannerPageLayout
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
  const [contractor] = useCurrentOrg()
  const { t } = useTranslation()

  return (
    <BannerPageLayout
      title={t("org.myOrgTitle")}
      isLoading={!contractor}
      skeleton={<OrgInfoSkeleton />}
      sidebarOpen={true}
    >
      {contractor && <OrgInfo contractor={contractor} />}
    </BannerPageLayout>
  )
}
