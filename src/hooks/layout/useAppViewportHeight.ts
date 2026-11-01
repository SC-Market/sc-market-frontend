import { useEffect } from "react"

/**
 * Sizes the app shell to the part of the screen the user can actually see.
 *
 * Root's height is `var(--app-height, 100dvh)`. CSS alone (`100dvh`) already
 * tracks the mobile URL bar, and on Chrome Android, where the viewport meta
 * asks for `interactive-widget=resizes-content`, the on-screen keyboard too.
 * iOS Safari ignores that setting: its keyboard covers the bottom of the
 * layout viewport and pans the document instead, which hid the message
 * composer behind the keyboard. The visual viewport is the visible area in
 * every browser, so this writes its height to `--app-height` and puts the
 * document scroll back to the top (pages scroll inside `<main>`, the
 * document never does, so any document scroll is the keyboard pan).
 *
 * The variable is set on <html>, outside React: server and hydration renders
 * use the CSS fallback, and nothing re-renders when it changes.
 */
export function useAppViewportHeight(): void {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const html = document.documentElement
    let frame = 0

    const apply = () => {
      frame = 0
      // Pinch-zoom shrinks the visual viewport too: keep the layout as it was.
      if (Math.abs(viewport.scale - 1) > 0.01) return
      html.style.setProperty("--app-height", `${Math.round(viewport.height)}px`)
      if (window.scrollY !== 0) window.scrollTo(0, 0)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }

    apply()
    viewport.addEventListener("resize", schedule)
    viewport.addEventListener("scroll", schedule)
    return () => {
      viewport.removeEventListener("resize", schedule)
      viewport.removeEventListener("scroll", schedule)
      if (frame) cancelAnimationFrame(frame)
      html.style.removeProperty("--app-height")
    }
  }, [])
}
