import React from "react"
import { Navigate } from "react-router-dom"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { Section } from "../../components/paper/Section"
import { useTranslation } from "react-i18next"
import { usePageSendMoney } from "../../features/money/hooks/usePageSendMoney"
import { SendMoneyRecipientSection } from "../../features/money/components/SendMoneyRecipientSection"
import { SendMoneyDetailsSection } from "../../features/money/components/SendMoneyDetailsSection"

export function SendMoney(props: { org?: boolean }) {
  const { t } = useTranslation()
  const pageData = usePageSendMoney(props.org)

  return (
    <FormPageLayout
      title={t("sendMoney.title")}
      breadcrumbs={[
        {
          label: t("dashboard.title"),
          href: props.org ? "/org/money" : "/dashboard",
        },
        { label: t("sendMoney.title") },
      ]}
      formTitle={t("sendMoney.title")}
      sidebarOpen={true}
      maxWidth="sm"
    >
      {pageData.isSuccess && (
        <Navigate to={props.org ? "/org/money" : "/dashboard"} />
      )}

      {pageData.step === "recipient" ? (
        <Section xs={12} title={t("sendMoney.recipient")}>
          <SendMoneyRecipientSection
            recipientType={pageData.recipientType}
            setRecipientType={pageData.setRecipientType}
            options={pageData.options}
            target={pageData.target}
            setTarget={pageData.setTarget}
            targetObject={pageData.targetObject}
            setTargetObject={pageData.setTargetObject}
            error={pageData.error}
            onNext={() => pageData.setStep("details")}
          />
        </Section>
      ) : (
        <Section
          xs={12}
          title={t("sendMoney.recipient")}
          justifyContent={"space-between"}
        >
          <SendMoneyDetailsSection
            targetObject={pageData.targetObject}
            amount={pageData.amount}
            setAmount={pageData.setAmount}
            note={pageData.note}
            setNote={pageData.setNote}
            onBack={() => pageData.setStep("recipient")}
            onSubmit={pageData.submitTransaction}
            isSubmitting={pageData.isSubmitting}
          />
        </Section>
      )}
    </FormPageLayout>
  )
}
