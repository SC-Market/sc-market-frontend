import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageUnsubscribe } from "../../features/email/hooks/usePageUnsubscribe"
import { UnsubscribeContent } from "../../features/email/components/UnsubscribeContent"

/**
 * Unsubscribe Page (no login): opening an email's unsubscribe link turns that
 * email category off at once and confirms it here.
 */
export function UnsubscribePage() {
  const { t } = useTranslation()
  const page = usePageUnsubscribe()

  return (
    <StandardPageLayout
      title={t("emailUi.unsubscribe.pageTitle")}
      maxWidth="sm"
      noSidebar={true}
    >
      <UnsubscribeContent
        data={page.data}
        isLoading={page.isLoading}
        onUnsubscribeAll={page.unsubscribeAll}
        isUnsubscribingAll={page.isUnsubscribingAll}
      />
    </StandardPageLayout>
  )
}
