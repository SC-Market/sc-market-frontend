/**
 * Star Citizen crafting system constants.
 * Source: game data (dismantleParams from p4k extraction).
 */

/** Fraction of crafting materials recovered when disassembling (0-1) */
export const DISASSEMBLY_EFFICIENCY = 0.5

/** Time in seconds to disassemble one item */
export const DISASSEMBLY_TIME_SECONDS = 15

/**
 * Format crafting/disassembly time from seconds to human-readable string.
 * e.g. 45 → "45s", 180 → "3m", 3665 → "1h 1m 5s"
 */
export function formatCraftingTime(seconds: number | undefined): string {
  if (!seconds) return "—"
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}
