import { useCallback } from "react"

/**
 * A callback ref that moves focus to the element when it mounts.
 *
 * Only for a field that appears because the user asked for it: a dialog they
 * opened, a grid cell they started editing, a step they advanced to, a form
 * revealed by the button they pressed. Leaving focus on the dialog shell or
 * on a button that just disappeared would strand keyboard users there.
 *
 * Never for a field that is on the page when it loads: moving focus on load
 * skips everything above it for screen-reader users (jsx-a11y/no-autofocus).
 * Those fields don't take focus at all.
 */
export function useFocusOnReveal<T extends HTMLElement>(enabled = true) {
  return useCallback(
    (element: T | null) => {
      if (enabled && element) element.focus()
    },
    [enabled],
  )
}
