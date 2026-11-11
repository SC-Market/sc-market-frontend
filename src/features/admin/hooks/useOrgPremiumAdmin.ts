import { useCallback } from "react"
import {
  useRevokeOrgPremiumTierMutation,
  useSetOrgPremiumTierMutation,
  type PremiumTierName,
} from "../../../store/api/v2/market"

/**
 * Admin premium management: grant an org a premium tier (optionally with a
 * custom domain) or revoke it. Settles once the request does, either way.
 */
export function useOrgPremiumAdmin() {
  const [setOrgPremium, { isLoading: isSetting }] =
    useSetOrgPremiumTierMutation()
  const [revokeOrgPremium, { isLoading: isRevoking }] =
    useRevokeOrgPremiumTierMutation()

  const grant = useCallback(
    async (spectrumId: string, tier: PremiumTierName, customDomain: string) => {
      await setOrgPremium({
        spectrumId,
        setOrgPremiumRequest: { tier, custom_domain: customDomain || null },
      })
    },
    [setOrgPremium],
  )

  const revoke = useCallback(
    async (spectrumId: string) => {
      await revokeOrgPremium({ spectrumId })
    },
    [revokeOrgPremium],
  )

  return { grant, revoke, isSetting, isRevoking }
}
