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

// Component exports
export { EmailSettings } from "./components/EmailSettings"
export { EmailStatus } from "./components/EmailStatus"
export { AddEmailDialog } from "./components/AddEmailDialog"
export { EditEmailDialog } from "./components/EditEmailDialog"
export { DeleteEmailDialog } from "./components/DeleteEmailDialog"
