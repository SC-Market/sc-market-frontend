// Import API to ensure it's registered (side effect)
import "./api/emailApi"

// API exports
export {
  emailApi,
  useAddEmailMutation,
  useUpdateEmailMutation,
  useDeleteEmailMutation,
  useRequestVerificationMutation,
  useGetNotificationTypesQuery,
  useGetEmailPreferencesQuery,
  useUpdateEmailPreferencesMutation,
  useVerifyEmailMutation,
  useUnsubscribeMutation,
} from "./api/emailApi"

// Domain exports
export type {
  UserEmail,
  EmailPreference,
  GroupedEmailPreferences,
  NotificationType,
  AddEmailRequest,
  UpdateEmailRequest,
  UpdateEmailPreferencesRequest,
} from "./domain/types"

export { formatActionName } from "./domain/formatters"

// Hooks exports
export { useEmailSettings } from "./hooks/useEmailSettings"
export { useEmailActions } from "./hooks/useEmailActions"
export { usePageEmailVerification } from "./hooks/usePageEmailVerification"
export type {
  UsePageEmailVerificationResult,
  EmailVerificationPageData,
} from "./hooks/usePageEmailVerification"
export { usePageUnsubscribe } from "./hooks/usePageUnsubscribe"
export type {
  UsePageUnsubscribeResult,
  UnsubscribePageData,
} from "./hooks/usePageUnsubscribe"

// Component exports
export { EmailSettings } from "./components/EmailSettings"
export { EmailStatus } from "./components/EmailStatus"
export { AddEmailDialog } from "./components/AddEmailDialog"
export { EditEmailDialog } from "./components/EditEmailDialog"
export { DeleteEmailDialog } from "./components/DeleteEmailDialog"
export { EmailVerificationContent } from "./components/EmailVerificationContent"
export { EmailVerificationContentSkeleton } from "./components/EmailVerificationContent.skeleton"
export { UnsubscribeContent } from "./components/UnsubscribeContent"
export { UnsubscribeContentSkeleton } from "./components/UnsubscribeContent.skeleton"
