import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

/** URL parameter of Admin › Orders' "Show test orders" toggle. */
export const SHOW_TEST_ORDERS_PARAM = "include_test"

/**
 * Admin › Orders' "Show test orders" toggle, kept in the URL
 * (?include_test=true) so it survives reloads and shared links. Off by
 * default: orders involving test accounts, orgs or shops are left out.
 */
export function useShowTestOrders(): [boolean, (show: boolean) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const show = searchParams.get(SHOW_TEST_ORDERS_PARAM) === "true"
  const setShow = useCallback(
    (next: boolean) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          if (next) params.set(SHOW_TEST_ORDERS_PARAM, "true")
          else params.delete(SHOW_TEST_ORDERS_PARAM)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )
  return [show, setShow]
}
