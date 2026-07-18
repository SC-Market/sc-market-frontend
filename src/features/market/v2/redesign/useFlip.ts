import { useLayoutEffect, useRef } from "react"

/**
 * Minimal FLIP (First-Last-Invert-Play) animation for grid reordering — no
 * external dependency. When the render ORDER of tiles changes (e.g. a card
 * expands and earlier cards in its row are bumped below the full-width panel),
 * React moves the DOM nodes instantly. FLIP makes that movement *animate*:
 *
 *   First  — remember each tile's screen position before the change
 *   Last   — read its new position after the DOM update
 *   Invert — transform it back to where it was (so it visually hasn't moved)
 *   Play   — clear the transform with a transition, so it slides to the new spot
 *
 * Usage: keep one ref map keyed by a stable id per tile; register each tile's
 * DOM node via `register(key)`; call the hook with a `deps` value that changes
 * whenever the order changes (e.g. the expanded key). Tiles animate on reorder;
 * mounts/unmounts are ignored (only nodes present both before and after move).
 */
export function useFlip(deps: unknown) {
  const nodes = useRef(new Map<string, HTMLElement>())
  const prevRects = useRef(new Map<string, DOMRect>())

  // Capture positions synchronously before the browser paints the new order.
  useLayoutEffect(() => {
    const currentRects = new Map<string, DOMRect>()
    for (const [key, node] of nodes.current) {
      currentRects.set(key, node.getBoundingClientRect())
    }

    for (const [key, node] of nodes.current) {
      const prev = prevRects.current.get(key)
      const next = currentRects.get(key)
      if (!prev || !next) continue
      const dx = prev.left - next.left
      const dy = prev.top - next.top
      if (dx === 0 && dy === 0) continue

      // Invert: jump the node back to its old position with no transition…
      node.style.transition = "none"
      node.style.transform = `translate(${dx}px, ${dy}px)`

      // …then Play: on the next frame, release to the real position.
      requestAnimationFrame(() => {
        node.style.transition = "transform 300ms cubic-bezier(0.2, 0, 0, 1)"
        node.style.transform = ""
      })
    }

    prevRects.current = currentRects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps])

  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(key, el)
    else nodes.current.delete(key)
  }

  return { register }
}
