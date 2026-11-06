/**
 * Org invites: create and delete invite codes, and invite members by
 * username. Each sends the request and alerts.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useCreateContractorInviteMutation,
  useDeleteContractorInviteMutation,
  useInviteContractorMembersMutation,
} from "../api/contractorApi"

/** The API's reason from a failed invite-code request, if it gave one. */
function inviteErrorReason(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    if ("data" in error && error.data) {
      const errData = error.data as { error?: string; message?: string }
      return errData.error || errData.message || fallback
    }
    if ("message" in error) {
      return (error as { message?: string }).message ?? fallback
    }
  }
  return fallback
}

/** Create an invite code. Resolves to whether it was created. */
export function useCreateOrgInviteCode(spectrumId: string | undefined) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createContractorInvite] = useCreateContractorInviteMutation()

  return useCallback(
    async (maxUses: number): Promise<boolean> => {
      const res = await createContractorInvite({
        contractor: spectrumId!,
        body: { max_uses: maxUses },
      })

      if (res?.data && !res?.error) {
        issueAlert({
          message: t("inviteCodes.submitted"),
          severity: "success",
        })
        return true
      }
      let reason = t("sharedUi.errors.unknown")
      if (res.error && "data" in res.error && res.error.data) {
        const errData = res.error.data as { error?: string; message?: string }
        reason = errData.error ?? errData.message ?? reason
      } else if (res.error && "message" in res.error) {
        reason = res.error.message ?? reason
      }
      issueAlert({
        message: t("inviteCodes.failed_submit", { reason }),
        severity: "error",
      })
      return false
    },
    [createContractorInvite, spectrumId, issueAlert, t],
  )
}

/** Delete an invite code. */
export function useDeleteOrgInviteCode(spectrumId: string | undefined) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [deleteContractorInvite] = useDeleteContractorInviteMutation()

  return useCallback(
    async (inviteId: string) => {
      const res = await deleteContractorInvite({
        contractor: spectrumId!,
        invite_id: inviteId,
      })

      if (res?.data && !res?.error) {
        issueAlert({
          message: t("inviteCodes.submitted"),
          severity: "success",
        })
      } else {
        const reason = inviteErrorReason(res.error, String(res.error || ""))
        issueAlert({
          message: t("inviteCodes.failed_submit", { reason }),
          severity: "error",
        })
      }
    },
    [deleteContractorInvite, spectrumId, issueAlert, t],
  )
}

/** Invite users to the org with a message. Resolves to whether it sent. */
export function useInviteOrgMembers(spectrumId: string | undefined) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [sendInvites] = useInviteContractorMembersMutation()

  return useCallback(
    async (usernames: string[], message: string): Promise<boolean> => {
      if (!spectrumId) return false
      try {
        await sendInvites({
          contractor: spectrumId,
          users: usernames,
          message,
        }).unwrap()
        issueAlert({
          message: t("orgInvite.submitted"),
          severity: "success",
        })
        return true
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
        return false
      }
    },
    [sendInvites, spectrumId, issueAlert, t],
  )
}
