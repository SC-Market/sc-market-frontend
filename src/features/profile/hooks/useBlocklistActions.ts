/**
 * Blocking and unblocking a user, for yourself or for your org. Each sends
 * the request and alerts (the API's reason on failure); resolves to whether
 * it worked.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useProfileBlockUserMutation,
  useProfileUnblockUserMutation,
} from "../api/profileApi"
import {
  useBlockUserForOrgMutation,
  useUnblockUserForOrgMutation,
} from "../../contractor/api/contractorApi"

/** The failure text: the error's or the API's message, else `fallback`. */
function blockErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, Record<string, string>>
    if (err.error?.message) return err.error.message
    if (err.data?.message) return err.data.message
  }
  return fallback
}

function useBlockAlerts(kind: "blockUser" | "unblockUser") {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  return useCallback(
    async (username: string, send: () => Promise<void>): Promise<boolean> => {
      try {
        await send()
        issueAlert({
          message: t(`${kind}.success`, { username }),
          severity: "success",
        })
        return true
      } catch (error: unknown) {
        issueAlert({
          message: blockErrorMessage(error, t(`${kind}.error`)),
          severity: "error",
        })
        return false
      }
    },
    [kind, issueAlert, t],
  )
}

/** Block a user for yourself, optionally with a reason. */
export function useBlockUser() {
  const run = useBlockAlerts("blockUser")
  const [blockUser, { isLoading }] = useProfileBlockUserMutation()
  const block = useCallback(
    (username: string, reason?: string) =>
      run(username, () => blockUser({ username, reason }).unwrap()),
    [run, blockUser],
  )
  return { block, isLoading }
}

/** Unblock a user you blocked. */
export function useUnblockUser() {
  const run = useBlockAlerts("unblockUser")
  const [unblockUser, { isLoading }] = useProfileUnblockUserMutation()
  const unblock = useCallback(
    (username: string) => run(username, () => unblockUser(username).unwrap()),
    [run, unblockUser],
  )
  return { unblock, isLoading }
}

/** Block a user for an org. */
export function useBlockUserForOrg(spectrumId: string) {
  const run = useBlockAlerts("blockUser")
  const [blockUserForOrg, { isLoading }] = useBlockUserForOrgMutation()
  const block = useCallback(
    (username: string) =>
      run(username, () =>
        blockUserForOrg({ spectrum_id: spectrumId, username }).unwrap(),
      ),
    [run, blockUserForOrg, spectrumId],
  )
  return { block, isLoading }
}

/** Unblock a user for an org. */
export function useUnblockUserForOrg(spectrumId: string) {
  const run = useBlockAlerts("unblockUser")
  const [unblockUserForOrg, { isLoading }] = useUnblockUserForOrgMutation()
  const unblock = useCallback(
    (username: string) =>
      run(username, () =>
        unblockUserForOrg({ spectrum_id: spectrumId, username }).unwrap(),
      ),
    [run, unblockUserForOrg, spectrumId],
  )
  return { unblock, isLoading }
}
