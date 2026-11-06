import { useCallback } from "react"
import {
  useRevokeOrgPremiumMutation,
  useSetOrgPremiumMutation,
} from "../../../store/api/premium"

/**
 * Admin premium management: grant an org a premium tier (optionally with a
 * custom domain) or revoke it. Settles once the request does, either way.
 */
export function useOrgPremiumAdmin() {
  const [setOrgPremium, { isLoading: isSetting }] = useSetOrgPremiumMutation()
  const [revokeOrgPremium, { isLoading: isRevoking }] =
    useRevokeOrgPremiumMutation()

  const grant = useCallback(
    async (spectrumId: string, tier: string, customDomain: string) => {
      await setOrgPremium({
        spectrum_id: spectrumId,
        tier,
        custom_domain: customDomain || null,
      })
    },
    [setOrgPremium],
  )

  const revoke = useCallback(
    async (spectrumId: string) => {
      await revokeOrgPremium(spectrumId)
    },
    [revokeOrgPremium],
  )

  return { grant, revoke, isSetting, isRevoking }
}
