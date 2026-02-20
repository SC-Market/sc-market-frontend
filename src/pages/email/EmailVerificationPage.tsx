import React from "react"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageEmailVerification } from "../../features/email/hooks/usePageEmailVerification"
import { EmailVerificationContent } from "../../features/email/components/EmailVerificationContent"
import { EmailVerificationContentSkeleton } from "../../features/email/components/EmailVerificationContent.skeleton"

/**
 * Email Verification Page
 * Handles email verification via token from URL
 */
export function EmailVerificationPage() {
  const pageData = usePageEmailVerification()

  return (
    <StandardPageLayout
      title="Email Verification"
      maxWidth="sm"
      noSidebar={true}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<EmailVerificationContentSkeleton />}
    >
      {pageData.data && (
        <EmailVerificationContent
          data={pageData.data}
          isLoading={pageData.isLoading}
        />
      )}
    </StandardPageLayout>
  )
}
