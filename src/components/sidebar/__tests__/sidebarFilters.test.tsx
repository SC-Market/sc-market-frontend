/**
 * Tests for createItemFilter's feature-flag gating.
 *
 * This filter decides whether a flagged sidebar entry renders. It used to read
 * `localStorage.getItem("feature_flags")` directly instead of taking the flags
 * useFeatureFlag had already resolved, so it saw neither the hook's
 * DEFAULT_FLAGS nor anything synced from the server. On a browser that had
 * never written that key — a first visit, or after clearing site data — every
 * flagged entry was hidden regardless of the server's rollout.
 */

import { describe, it, expect, beforeEach } from "vitest"
import { createItemFilter } from "../utils/sidebarFilters"
import type { SidebarItemProps } from "../types"
import type { UserProfileState } from "../../../hooks/login/UserProfile"

/** A logged-in profile, so login gating never masks a flag result. */
const profile = { username: "tester", role: "user" } as UserProfileState

function filterWith(flags: Record<string, boolean>) {
  return createItemFilter(profile, undefined, null, null, flags)
}

const wikiItem: SidebarItemProps = {
  text: "sidebar.wiki.title",
  feature_flag: "wiki",
}

const unflaggedItem: SidebarItemProps = { text: "sidebar.home.title" }

beforeEach(() => {
  localStorage.clear()
})

describe("createItemFilter — feature flag gating", () => {
  it("shows a flagged item when the flag is on", () => {
    expect(filterWith({ wiki: true })(wikiItem)).toBe(true)
  })

  it("hides a flagged item when the flag is off", () => {
    expect(filterWith({ wiki: false })(wikiItem)).toBe(false)
  })

  it("hides a flagged item when the flag is absent from the resolved set", () => {
    expect(filterWith({ nav_v2: true })(wikiItem)).toBe(false)
  })

  it("leaves unflagged items alone", () => {
    expect(filterWith({})(unflaggedItem)).toBe(true)
  })

  it("still respects the hidden property", () => {
    expect(filterWith({ wiki: true })({ ...wikiItem, hidden: true })).toBe(false)
  })

  it("ignores localStorage entirely", () => {
    // The old implementation read this key. A stale or absent value must no
    // longer be able to contradict the flags the hook resolved.
    localStorage.setItem("feature_flags", JSON.stringify({ wiki: false }))

    expect(filterWith({ wiki: true })(wikiItem)).toBe(true)
  })

  it("shows a flagged item on a browser that never stored any flags", () => {
    // This is the regression: with no `feature_flags` key, the old code parsed
    // `{}` and hid the item even though the hook's default for wiki is true.
    expect(localStorage.getItem("feature_flags")).toBeNull()

    expect(filterWith({ wiki: true })(wikiItem)).toBe(true)
  })

  it("gates each flag independently", () => {
    const filter = filterWith({ wiki: true, other_feature: false })

    expect(filter(wikiItem)).toBe(true)
    expect(filter({ text: "other", feature_flag: "other_feature" })).toBe(false)
  })
})
