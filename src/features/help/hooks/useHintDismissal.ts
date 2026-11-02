import { useCallback, useSyncExternalStore } from "react"
import { useAppDispatch } from "../../../store/hooks"
import { useIsAuthenticated, useSession } from "../../../hooks/login/useSession"
import {
  marketV2Api,
  useDismissHintMutation,
  useGetDismissedHintsQuery,
} from "../../../store/api/v2/market"
import {
  addLocalDismissedHint,
  readLocalDismissedHints,
  subscribeLocalDismissedHints,
} from "../dismissedHintsStorage"

const NO_KEYS: readonly string[] = []
const serverSnapshot = () => NO_KEYS

/**
 * Whether the hint `hintKey` should show, and how to dismiss it for good.
 *
 * - Signed in: dismissals are stored on the account (GET/PUT
 *   /api/v2/hints/dismissed), so they hold on every device. The hint stays
 *   hidden until that list has loaded, and hides at once when dismissed.
 * - Signed out: dismissals are kept in this browser's localStorage.
 * - While the session is still unknown (server render, hydration, first
 *   request), nothing shows, so a hint never flashes up and away.
 */
export function useHintDismissal(hintKey: string): {
  visible: boolean
  dismiss: () => void
} {
  const session = useSession()
  const isAuthenticated = useIsAuthenticated()
  const dispatch = useAppDispatch()
  const signedIn = session.status === "authenticated"

  const { data } = useGetDismissedHintsQuery(undefined, {
    skip: !signedIn || !isAuthenticated,
  })
  const [dismissOnAccount] = useDismissHintMutation()
  const localKeys = useSyncExternalStore(
    subscribeLocalDismissedHints,
    readLocalDismissedHints,
    serverSnapshot,
  )

  let visible = false
  if (session.status === "anonymous") visible = !localKeys.includes(hintKey)
  else if (signedIn && data) visible = !data.hint_keys.includes(hintKey)

  const dismiss = useCallback(() => {
    if (!signedIn) {
      addLocalDismissedHint(hintKey)
      return
    }
    // Hide it now; undo if the account didn't take it.
    const patch = dispatch(
      marketV2Api.util.updateQueryData("getDismissedHints", undefined, (draft) => {
        if (!draft.hint_keys.includes(hintKey)) draft.hint_keys.push(hintKey)
      }),
    )
    dismissOnAccount({ hintKey })
      .unwrap()
      .catch(() => patch.undo())
  }, [signedIn, hintKey, dispatch, dismissOnAccount])

  return { visible, dismiss }
}
