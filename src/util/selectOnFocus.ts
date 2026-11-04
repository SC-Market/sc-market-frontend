import type { FocusEvent } from "react"

/**
 * onFocus for number inputs that edit an existing value: selects it, so
 * typing replaces the value instead of appending to it ("1" then typing "3"
 * gave "13").
 */
export function selectOnFocus(
  event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
): void {
  event.target.select()
}
