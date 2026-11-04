import { describe, it, expect } from "vitest"
import { canEditReview, canRequestReviewRevision } from "../reviewPermissions"

const none = { customer: false, assigned: false, orgManager: false }
const user = (username: string) => ({
  username,
  avatar: "",
  display_name: username,
  rating: { avg_rating: 0, rating_count: 0, total_rating: 0, streak: 0 },
})
const org = {
  spectrum_id: "ORG",
  name: "Org",
  avatar: "",
  rating: { avg_rating: 0, rating_count: 0, total_rating: 0, streak: 0 },
}

describe("canRequestReviewRevision", () => {
  it.each([
    ["customer, seller's review", "contractor", { customer: true }, true],
    ["customer, own review", "customer", { customer: true }, false],
    ["assignee, customer's review", "customer", { assigned: true }, true],
    ["assignee, own review", "contractor", { assigned: true }, false],
    ["org manager, customer's review", "customer", { orgManager: true }, true],
    ["org manager, org's review", "contractor", { orgManager: true }, false],
    ["nobody", "customer", {}, false],
  ] as const)("%s", (_name, role, roles, expected) => {
    expect(canRequestReviewRevision({ role }, { ...none, ...roles })).toBe(
      expected,
    )
  })
})

describe("canEditReview", () => {
  const requested = {
    revision_requested: true,
    user_author: user("me"),
    contractor_author: null,
  }

  it("lets the author edit once a revision is requested", () => {
    expect(canEditReview(requested, "me", { orgManager: false })).toBe(true)
  })

  it("not before a revision is requested", () => {
    expect(
      canEditReview({ ...requested, revision_requested: false }, "me", {
        orgManager: false,
      }),
    ).toBe(false)
  })

  it("not someone else's review", () => {
    expect(canEditReview(requested, "other", { orgManager: true })).toBe(false)
  })

  it("lets an org manager edit the org's review", () => {
    const orgReview = {
      revision_requested: true,
      user_author: null,
      contractor_author: org,
    }
    expect(canEditReview(orgReview, "me", { orgManager: true })).toBe(true)
    expect(canEditReview(orgReview, "me", { orgManager: false })).toBe(false)
  })

  it("not when signed out", () => {
    expect(canEditReview(requested, undefined, { orgManager: true })).toBe(
      false,
    )
  })
})
