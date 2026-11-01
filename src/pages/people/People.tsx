import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useParams } from "react-router-dom"
import { CustomerList } from "../../views/people/Customers"
import { MemberList } from "../../views/contractor/OrgMembers"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import {
  AdminDailyActivity,
  AdminMembershipAnalytics,
  AdminUserList,
} from "../../views/people/AllUsers"
import { AdminExpressVerify } from "../../views/authentication/AdminExpressVerify"

export function CustomerPage(props: {
  contractors?: boolean
  members?: boolean
  customers?: boolean
  users?: boolean
}) {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={
        props.members ? t("manageMemberList.members") : t("customerList.customers")
      }
      headerTitle={t("people.title")}
      maxWidth="xl"
      sidebarOpen={true}
    >
      {props.members && <OrgMemberSection />}
      <CustomerList />
    </StandardPageLayout>
  )
}

/** The org's members (the page is the sidebar's "Members"), above its customers. */
function OrgMemberSection() {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { data: contractor } = useGetContractorBySpectrumIDQuery(
    contractor_id ?? "",
    { skip: !contractor_id },
  )
  return contractor ? <MemberList contractor={contractor} /> : null
}

export function AdminUserListPage() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("customerList.customers")}
      headerTitle={t("people.title")}
      maxWidth="xl"
      sidebarOpen={true}
    >
      <AdminDailyActivity />
      <AdminMembershipAnalytics />
      <AdminUserList />
      <AdminExpressVerify />
    </StandardPageLayout>
  )
}
