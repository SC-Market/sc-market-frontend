import React, { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"

/** Delay before typed text / number filters are applied. */
export const FILTER_DEBOUNCE_MS = 400

/**
 * Legacy (V1) URL param names that carry the same filter as the V2 key.
 * The listings page reads `V2 || legacy`, so the sidebar shows that value and,
 * when it writes a filter, drops the legacy alias so the URL holds one value.
 */
export const MARKET_PARAM_ALIASES: Record<string, string[]> = {
  text: ["query"],
  price_min: ["minCost"],
  price_max: ["maxCost"],
  item_type: ["type"],
  quantity_min: ["quantityAvailable"],
  sort_by: ["sort"],
  status: ["statuses"],
}

/** Pagination params reset whenever a filter changes. */
const PAGE_PARAM = "page"
const PAGE_ALIASES = ["index"]

export type FilterChanges = Record<string, string>

export interface AutoApplySearchParams {
  /** Value to show in the control: the pending draft, else the applied URL value. */
  value: (key: string) => string
  /** The value currently applied in the URL (ignores pending drafts). */
  applied: (key: string) => string
  /** Text / number input: apply after the user pauses typing. */
  setDebounced: (key: string, value: string) => void
  /** Selects, toggles, sorting, picked options: apply now (with any pending drafts). */
  setNow: (changes: FilterChanges) => void
  /** Apply pending drafts (plus `changes`) now and end the typing burst (Enter / blur / picked option). */
  flush: (changes?: FilterChanges) => void
  /** Props for a plain TextField that should be debounced. */
  bindText: (key: string) => {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onKeyDown: (e: React.KeyboardEvent) => void
    onBlur: () => void
  }
}

/**
 * Auto-applies sidebar filters to the URL search params, which drive the
 * search request.
 *
 * - Text / number inputs are debounced (`FILTER_DEBOUNCE_MS`).
 * - Discrete changes (selects, sorting, picked options) apply immediately and
 *   carry any pending debounced drafts with them, so rapid changes collapse
 *   into a single URL update (= a single request).
 * - Changes are compared against the applied URL values; nothing is written
 *   (and nothing refetched) when the effective value didn't change.
 * - History: a discrete change pushes an entry. A typing burst pushes one
 *   entry on its first apply and replaces it on later applies, so typing
 *   doesn't spam history; Enter / blur end the burst.
 */
export function useAutoApplySearchParams({
  delay = FILTER_DEBOUNCE_MS,
  aliases = MARKET_PARAM_ALIASES,
}: { delay?: number; aliases?: Record<string, string[]> } = {}): AutoApplySearchParams {
  const [searchParams, setSearchParams] = useSearchParams()

  // Latest applied params, readable from timers without re-creating callbacks.
  const paramsRef = useRef(searchParams)
  paramsRef.current = searchParams

  /**
   * Values typed but not yet visible in the URL, with the URL value each draft
   * started from. A draft is kept until the URL catches up with it (the
   * router may apply the navigation in a transition, so clearing it on commit
   * would flash the old value), or until the URL moves to something else.
   */
  const [drafts, setDraftsState] = useState<FilterChanges>({})
  const draftsRef = useRef<FilterChanges>({})
  const draftBaseRef = useRef<FilterChanges>({})
  const setDrafts = (next: FilterChanges) => {
    draftsRef.current = next
    setDraftsState(next)
  }
  const dropDrafts = (keys: string[]) => {
    if (keys.length === 0) return
    const next = { ...draftsRef.current }
    for (const key of keys) {
      delete next[key]
      delete draftBaseRef.current[key]
    }
    setDrafts(next)
  }
  /** Drafts not applied yet (written on the next commit). */
  const pendingRef = useRef<FilterChanges>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Whether the current typing burst has already pushed a history entry. */
  const burstPushedRef = useRef(false)

  const readFrom = useCallback(
    (params: URLSearchParams, key: string) => {
      const direct = params.get(key)
      if (direct) return direct
      for (const alias of aliases[key] ?? []) {
        const v = params.get(alias)
        if (v) return v
      }
      return ""
    },
    [aliases],
  )

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  /**
   * Write `changes` (merged over pending drafts) to the URL.
   * mode "debounce": typing burst continues; "finish": burst ends (Enter/blur);
   * "discrete": a separate user action (select/sort/option).
   */
  const commit = useCallback(
    (changes: FilterChanges, mode: "debounce" | "finish" | "discrete") => {
      clearTimer()
      const all = { ...pendingRef.current, ...changes }
      pendingRef.current = {}

      const current = paramsRef.current
      const effective = Object.entries(all).filter(
        ([key, value]) => readFrom(current, key) !== value,
      )
      // A draft being committed now shows the committed value and expects the
      // URL to become it (it's dropped when the update lands, see below).
      // Drafts already equal to the applied value are done.
      const nextDrafts = { ...draftsRef.current }
      for (const [key, value] of effective) {
        if (key in nextDrafts) {
          nextDrafts[key] = value
          draftBaseRef.current[key] = value
        }
      }
      for (const key of Object.keys(nextDrafts)) {
        if (readFrom(current, key) === nextDrafts[key]) {
          delete nextDrafts[key]
          delete draftBaseRef.current[key]
        }
      }
      setDrafts(nextDrafts)

      const continuesBurst = mode !== "discrete" && burstPushedRef.current
      burstPushedRef.current = mode === "debounce" && (effective.length > 0 || burstPushedRef.current)

      if (effective.length === 0) return

      const next = new URLSearchParams(current)
      for (const [key, value] of effective) {
        for (const alias of aliases[key] ?? []) next.delete(alias)
        if (value) next.set(key, value)
        else next.delete(key)
      }
      for (const alias of PAGE_ALIASES) next.delete(alias)
      next.set(PAGE_PARAM, "1")

      // Later calls in the same tick build on this, before the re-render lands.
      paramsRef.current = next
      setSearchParams(next, { replace: continuesBurst })
    },
    [aliases, readFrom, setSearchParams],
  )

  const commitRef = useRef(commit)
  commitRef.current = commit

  const setDebounced = useCallback(
    (key: string, value: string) => {
      if (!(key in draftBaseRef.current)) {
        draftBaseRef.current[key] = readFrom(paramsRef.current, key)
      }
      pendingRef.current = { ...pendingRef.current, [key]: value }
      setDrafts({ ...draftsRef.current, [key]: value })
      clearTimer()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        commitRef.current({}, "debounce")
      }, delay)
    },
    [delay, readFrom],
  )

  const setNow = useCallback(
    (changes: FilterChanges) => commit(changes, "discrete"),
    [commit],
  )

  const flush = useCallback(
    (changes: FilterChanges = {}) => commit(changes, "finish"),
    [commit],
  )

  // Reconcile drafts with the URL: a draft is done once the URL shows its
  // value; if the URL moved to anything else (back/forward, another control
  // writing the same filter) the URL wins and the draft is discarded.
  useEffect(() => {
    const done = Object.keys(draftsRef.current).filter((key) => {
      const url = readFrom(searchParams, key)
      return url === draftsRef.current[key] || url !== draftBaseRef.current[key]
    })
    if (done.length === 0) return
    for (const key of done) {
      if (key in pendingRef.current) {
        const { [key]: _dropped, ...rest } = pendingRef.current
        pendingRef.current = rest
      }
    }
    if (Object.keys(pendingRef.current).length === 0) clearTimer()
    dropDrafts(done)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, readFrom])

  // Don't write to the URL after unmount (we may be on another page by then).
  useEffect(() => clearTimer, [])

  const applied = useCallback(
    (key: string) => readFrom(searchParams, key),
    [readFrom, searchParams],
  )

  const value = useCallback(
    (key: string) => (key in drafts ? drafts[key] : readFrom(searchParams, key)),
    [drafts, readFrom, searchParams],
  )

  const bindText = useCallback(
    (key: string) => ({
      value: value(key),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDebounced(key, e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter") flush()
      },
      onBlur: () => flush(),
    }),
    [value, setDebounced, flush],
  )

  return { value, applied, setDebounced, setNow, flush, bindText }
}
