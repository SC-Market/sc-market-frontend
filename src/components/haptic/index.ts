/**
 * Haptic Feedback Components
 *
 * Thin wrappers around MUI components that add haptic feedback on interaction.
 * Only the wrappers in real use are kept; use plain MUI components for
 * everything else (e.g. MUI `Button`).
 *
 * Haptic patterns:
 * - light() - IconButtons
 * - selection() - Tabs, Pagination
 */

export { HapticIconButton } from "./HapticIconButton"
export { HapticTab } from "./HapticTab"
export { HapticTablePagination } from "./HapticTablePagination"
