import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  useAcceptContractorInviteCodeMutation,
  useGetContractorBySpectrumIDQuery,
  useGetContractorInviteCodeQuery,
} from "../../../store/contractor"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

interface UsePageAcceptOrgInviteResult {
  inviteDetails: ReturnType<typeof useGetContractorInviteCodeQuery>["data"]
  contractor: ReturnType<typeof useGetContractorBySpectrumIDQuery>["data"]
  isLoading: boolean
  isAccepting: boolean
  error: unknown
  acceptInvite: () => Promise<void>
}

export function usePageAcceptOrgInvite(
  inviteId: string,
): UsePageAcceptOrgInviteResult {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()

  const inviteQuery = useGetContractorInviteCodeQuery(inviteId)
  const contractorQuery = useGetContractorBySpectrumIDQuery(
    inviteQuery.data?.spectrum_id || "",
    { skip: !inviteQuery.data?.spectrum_id },
  )

  const [acceptInviteMutation, { isLoading: isAccepting }] =
    useAcceptContractorInviteCodeMutation()

  const acceptInvite = useCallback(async () => {
    try {
      await acceptInviteMutation(inviteId).unwrap()
      issueAlert({
        message: t("org.invite.accepted"),
        severity: "success",
      })
      navigate("/")
    } catch (error) {
      issueAlert(error)
    }
  }, [acceptInviteMutation, inviteId, issueAlert, navigate, t])

  return {
    inviteDetails: inviteQuery.data,
    contractor: contractorQuery.data,
    isLoading: inviteQuery.isLoading || contractorQuery.isLoading,
    isAccepting,
    error: inviteQuery.error || contractorQuery.error,
    acceptInvite,
  }
}
