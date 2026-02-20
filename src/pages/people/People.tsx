import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { CustomerList } from "../../views/people/Customers"
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
      title={t("customerList.customers")}
      headerTitle={t("people.title")}
      maxWidth="xl"
      sidebarOpen={true}
    >
      <CustomerList {...props} />
    </StandardPageLayout>
  )
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
