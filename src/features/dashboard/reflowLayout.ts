/**
 * reflowLayout — derives a narrow-breakpoint layout from the saved 12-column
 * dashboard layout.
 *
 * react-grid-layout's own fallback keeps each widget's x and clamps its width,
 * so a 3-of-12 sidebar widget stays 3 columns wide on a 6-column grid and the
 * full-width widget beside it is pushed below, leaving the other half of the
 * row empty. Instead, widths are scaled to the new column count (anything wider
 * than half becomes full width), widgets are packed in reading order into the
 * first spot they fit, and each one then widens into any columns left empty
 * beside it — so every row is filled edge to edge.
 */

/** The fields of a react-grid-layout item this function reads and writes. */
export interface ReflowItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

/** Column count the saved dashboard layout is authored in. */
export const BASE_COLS = 12

export function reflowLayout<T extends ReflowItem>(
  items: T[],
  cols: number,
): T[] {
  if (cols >= BASE_COLS) return items

  const ordered = [...items].sort((a, b) => a.y - b.y || a.x - b.x)
  // occupied[row][col] — grows downward as widgets are placed.
  const occupied: boolean[][] = []

  const isFree = (x: number, y: number, w: number, h: number) => {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (occupied[row]?.[col]) return false
      }
    }
    return true
  }
  const fill = (x: number, y: number, w: number, h: number) => {
    for (let row = y; row < y + h; row++) {
      occupied[row] ??= []
      for (let col = x; col < x + w; col++) occupied[row][col] = true
    }
  }

  const placed = ordered.map((item) => {
    const minW = Math.min(item.minW ?? 1, cols)
    let w = Math.max(
      minW,
      Math.min(cols, Math.round((item.w * cols) / BASE_COLS)),
    )
    if (w > cols / 2) w = cols

    // First fit: the topmost row, then leftmost column, where the widget fits.
    for (let y = 0; ; y++) {
      for (let x = 0; x + w <= cols; x++) {
        if (isFree(x, y, w, item.h)) {
          fill(x, y, w, item.h)
          return { ...item, x, y, w }
        }
      }
    }
  })

  // Widen each widget into empty columns beside it (across all of its rows).
  for (const item of placed) {
    while (
      item.x + item.w < cols &&
      isFree(item.x + item.w, item.y, 1, item.h)
    ) {
      fill(item.x + item.w, item.y, 1, item.h)
      item.w += 1
    }
    while (item.x > 0 && isFree(item.x - 1, item.y, 1, item.h)) {
      fill(item.x - 1, item.y, 1, item.h)
      item.x -= 1
      item.w += 1
    }
  }

  return placed.map((item) =>
    item.minW !== undefined && item.minW > item.w
      ? { ...item, minW: item.w }
      : item,
  )
}
