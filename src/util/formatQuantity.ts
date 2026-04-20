/**
 * Format a quantity with its unit for display.
 *
 * For SCU items, quantities are stored as cSCU (1 SCU = 100 cSCU).
 * Display converts to the most readable unit:
 *   - >= 100 cSCU → show as SCU (e.g., 250 → "2.5 SCU")
 *   - < 100 cSCU → show as cSCU (e.g., 50 → "50 cSCU")
 *
 * For discrete items, just shows the number.
 */
export function formatQuantity(
  value: number,
  unit: "unit" | "scu" | string = "unit",
): string {
  if (unit === "scu") {
    if (value >= 100) {
      const scu = value / 100
      return `${scu % 1 === 0 ? scu.toFixed(0) : scu.toFixed(2)} SCU`
    }
    return `${value} cSCU`
  }
  return value.toLocaleString()
}

/**
 * Get the unit label for display (e.g., in price-per-unit contexts).
 */
export function getUnitLabel(unit: "unit" | "scu" | string = "unit"): string {
  return unit === "scu" ? "SCU" : "unit"
}

/**
 * Determine the default quantity unit for a game item type.
 * Commodities are measured in SCU, everything else in discrete units.
 */
export function defaultUnitForItemType(
  gameItemType: string | null | undefined,
): "unit" | "scu" {
  return gameItemType === "Commodity" ? "scu" : "unit"
}
