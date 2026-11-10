import { useEffect, useState } from "react"
import { useAppDispatch } from "../../store/hooks"
import { contractorsApi } from "../../store/api/contractors"
import {
  cacheDomainOrg,
  clearDomainOrg,
  getWhiteLabelConfig,
  type CustomDomain,
} from "./CustomDomain"

type DomainAnswer = {
  spectrum_id: string
  name: string
  focus_mode?: string
  homepage_path?: string | null
  require_membership?: boolean
}

/** Whether the API's answer is what the cache (and so this page) already has. */
function sameAsCached(answer: DomainAnswer): boolean {
  const cached = getWhiteLabelConfig()
  return (
    !!cached &&
    cached.spectrum_id === answer.spectrum_id &&
    cached.name === answer.name &&
    cached.focus_mode === (answer.focus_mode || "public") &&
    cached.homepage_path === (answer.homepage_path || null) &&
    cached.require_membership === (answer.require_membership || false)
  )
}

/**
 * The white-label domain the page is on, for HookProvider to provide.
 *
 * It starts from `initial()` (the request's answer on a server render, the
 * domain cache in the browser), so the first render matches the HTML. On an
 * org's host the browser then asks `GET /api/domain/:hostname` and applies
 * the answer to this page: a first visit has no cache, and without this the
 * whole visit was the main site (landing page, SC Market's sidebar, an
 * unscoped market) with only the org's colours. A host the API says is no
 * org's (404) drops a stale cached org; other errors keep what the page has.
 */
export function useResolvedCustomDomain(
  initial: () => CustomDomain,
): CustomDomain {
  const [customDomain, setCustomDomain] = useState(initial)
  const dispatch = useAppDispatch()
  const { isCustomDomain } = customDomain

  useEffect(() => {
    if (!isCustomDomain) return
    const hostname = window.location.hostname
    const request = dispatch(
      contractorsApi.endpoints.resolveDomain.initiate(hostname),
    )
    let cancelled = false
    request.then((result) => {
      if (cancelled) return
      const answer = result.data?.data
      if (answer?.spectrum_id) {
        if (sameAsCached(answer)) {
          // Same org, same settings: only a missing context value to fill
          // (cache seeded after the first render).
          setCustomDomain((prev) =>
            prev.customOrg === answer.spectrum_id
              ? prev
              : { isCustomDomain: true, customOrg: answer.spectrum_id },
          )
          return
        }
        cacheDomainOrg(answer)
        // A new object even for the same org: its settings (focus mode,
        // landing page) changed and readers of getWhiteLabelConfig re-render.
        setCustomDomain({ isCustomDomain: true, customOrg: answer.spectrum_id })
        return
      }
      const error = result.error as { status?: unknown } | undefined
      if (error?.status === 404) {
        clearDomainOrg()
        setCustomDomain((prev) =>
          prev.customOrg === undefined
            ? prev
            : { isCustomDomain: true, customOrg: undefined },
        )
      }
    })
    return () => {
      cancelled = true
      request.unsubscribe()
    }
  }, [dispatch, isCustomDomain])

  return customDomain
}
