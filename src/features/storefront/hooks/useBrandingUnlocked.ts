import { useGetOrgStorefrontStatusQuery } from "../../../store/api/v2/market"

/**
 * Whether an org's branding (theme, white-label site and sidebar settings)
 * can be used: a staff white_label grant, or the unlock criteria (backend
 * services/storefront/branding.ts). Only the org's members can ask; the
 * status query is skipped when the grant already answers it.
 */
export function useBrandingUnlocked(
  contractor:
    | { spectrum_id: string; premium_tier?: string | null }
    | undefined
    | null,
): boolean {
  const granted = contractor?.premium_tier === "white_label"
  const { data } = useGetOrgStorefrontStatusQuery(
    { spectrumId: contractor?.spectrum_id ?? "" },
    { skip: !contractor || granted },
  )
  return granted || !!data?.branding.unlocked
}
