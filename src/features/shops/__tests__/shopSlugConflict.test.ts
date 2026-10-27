/**
 * A 409 from creating or renaming a shop carries the slug's availability
 * (reason and free suggestions) in error.details.
 */
import { describe, expect, it } from "vitest"
import { shopSlugConflictFromError } from "../shopSlugConflict"

const conflict = (details: unknown) => ({
  status: 409,
  data: { error: { code: "CONFLICT", message: "taken", details } },
})

describe("shopSlugConflictFromError", () => {
  it("reads the availability from a slug 409", () => {
    expect(
      shopSlugConflictFromError(
        conflict({
          slug: "acme",
          available: false,
          reason: "reserved_org",
          reserved_for: "ACME",
          message: "This URL is reserved for the organization ACME",
          suggestions: ["acme-2", 7, "acme-shop"],
        }),
      ),
    ).toEqual({
      slug: "acme",
      available: false,
      reason: "reserved_org",
      reserved_for: "ACME",
      message: "This URL is reserved for the organization ACME",
      suggestions: ["acme-2", "acme-shop"],
    })
  })

  it("drops a reason it doesn't know", () => {
    expect(
      shopSlugConflictFromError(
        conflict({ slug: "x-y", reason: "weird", suggestions: [] }),
      )?.reason,
    ).toBeUndefined()
  })

  it("ignores other errors", () => {
    expect(
      shopSlugConflictFromError(conflict({ order_id: "o1" })),
    ).toBeUndefined()
    expect(
      shopSlugConflictFromError({
        status: 400,
        data: { error: { code: "VALIDATION_ERROR", message: "bad" } },
      }),
    ).toBeUndefined()
    expect(shopSlugConflictFromError(new Error("network"))).toBeUndefined()
    expect(shopSlugConflictFromError(undefined)).toBeUndefined()
  })
})
