/**
 * Hints dismissed while signed out, kept in this browser's localStorage.
 * Signed-in users' dismissals live on their account instead
 * (useHintDismissal).
 */

export const DISMISSED_HINTS_STORAGE_KEY = "scm.dismissed-hints"

const listeners = new Set<() => void>()
// Dismissals made while localStorage is unavailable (blocked or full): they
// still hold for the rest of the page's lifetime.
const unpersisted = new Set<string>()

function parse(raw: string | null): string[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value)
      ? value.filter((k): k is string => typeof k === "string")
      : []
  } catch {
    return []
  }
}

let cachedSignature: string | null | undefined
let cachedKeys: readonly string[] = []

/** The locally dismissed hint keys. Stable between calls until one is added. */
export function readLocalDismissedHints(): readonly string[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(DISMISSED_HINTS_STORAGE_KEY)
  } catch {
    raw = null
  }
  const signature = `${raw}|${unpersisted.size}`
  if (signature !== cachedSignature) {
    cachedSignature = signature
    cachedKeys = [...new Set([...parse(raw), ...unpersisted])]
  }
  return cachedKeys
}

export function addLocalDismissedHint(hintKey: string): void {
  const keys = readLocalDismissedHints()
  if (!keys.includes(hintKey)) {
    try {
      localStorage.setItem(
        DISMISSED_HINTS_STORAGE_KEY,
        JSON.stringify([...keys, hintKey]),
      )
    } catch {
      unpersisted.add(hintKey)
    }
  }
  listeners.forEach((notify) => notify())
}

export function subscribeLocalDismissedHints(notify: () => void): () => void {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}
