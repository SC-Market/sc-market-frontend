import type { MouseEvent } from "react"

/**
 * onClick for a card or row that is a real link (`<a href>`: crawlable,
 * prerendered, middle-click / new-tab work) but opens in-app on a plain left
 * click (e.g. a detail modal). Modified clicks follow the href as usual.
 */
export function inAppClick(handler: () => void) {
  return (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    handler()
  }
}
