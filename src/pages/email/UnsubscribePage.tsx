import React from "react"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageUnsubscribe } from "../../features/email/hooks/usePageUnsubscribe"
import { UnsubscribeContent } from "../../features/email/components/UnsubscribeContent"
import { UnsubscribeContentSkeleton } from "../../features/email/components/UnsubscribeContent.skeleton"

/**
 * Unsubscribe Page
 * Handles email unsubscribe via token from URL
 */
export function UnsubscribePage() {
  const pageData = usePageUnsubscribe()

  return (
    <StandardPageLayout
      title="Unsubscribe from Emails"
      maxWidth="sm"
      noSidebar={true}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<UnsubscribeContentSkeleton />}
    >
      {pageData.data && (
        <UnsubscribeContent
          data={pageData.data}
          isLoading={pageData.isLoading}
        />
      )}
    </StandardPageLayout>
  )
}
