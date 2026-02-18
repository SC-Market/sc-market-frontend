import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { CreateServiceForm } from "../../views/orders/CreateService"
import { useParams } from "react-router-dom"
import { useGetServiceByIdQuery } from "../../store/services"
import { useTranslation } from "react-i18next"

export function CreateService(props: {}) {
  const { t } = useTranslation()
  return (
    <FormPageLayout
      title={t("services.createService")}
      formTitle={t("services.createService")}
      maxWidth="md"
      sidebarOpen={true}
    >
      <CreateServiceForm />
    </FormPageLayout>
  )
}

export function UpdateService() {
  const { t } = useTranslation()
  const { service_id } = useParams<{ service_id: string }>()
  const {
    data: service,
    isLoading,
    error,
  } = useGetServiceByIdQuery(service_id!)

  return (
    <FormPageLayout
      title={t("services.updateService")}
      formTitle={t("services.updateService")}
      maxWidth="md"
      sidebarOpen={true}
      isLoading={isLoading}
      error={error}
    >
      {service && <CreateServiceForm service={service} />}
    </FormPageLayout>
  )
}
