import { describe, it, expect } from "vitest"
import { listingApiError } from "../listingFormErrors"

const apiError = (
  validationErrors?: { field: string; message: string }[],
  message = "Validation failed",
) => ({
  status: 400,
  data: { error: { code: "VALIDATION_ERROR", message, validationErrors } },
})

describe("listingApiError", () => {
  // Regression: the create form read data.message, which the V2 error shape
  // doesn't have, so every failure said "Failed to create listing".
  it("uses the API's first validation error, pointed at its field", () => {
    expect(
      listingApiError(
        apiError([
          { field: "base_price", message: "Base price must be greater than 0" },
        ]),
        "x",
      ),
    ).toEqual({
      field: "base_price",
      message: "Base price must be greater than 0",
    })
    expect(
      listingApiError(
        apiError([
          {
            field: "lots[0].quantity",
            message: "Quantity must be greater than 0",
          },
        ]),
        "x",
      ).field,
    ).toBe("quantity")
    expect(
      listingApiError(
        apiError([
          {
            field: "auction_details.end_time",
            message: "End time is required",
          },
        ]),
        "x",
      ).field,
    ).toBe("auction_end_time")
  })

  it("puts errors for fields the form doesn't show on the form", () => {
    expect(
      listingApiError(
        apiError([{ field: "lots[2].price", message: "Price is required" }]),
        "x",
      ),
    ).toEqual({
      field: "form",
      message: "Price is required",
    })
  })

  it("uses the API message, else the fallback", () => {
    expect(
      listingApiError(apiError(undefined, "Shop not found"), "fallback"),
    ).toEqual({ field: "form", message: "Shop not found" })
    expect(
      listingApiError({ status: "FETCH_ERROR", error: "offline" }, "fallback"),
    ).toEqual({ field: "form", message: "fallback" })
    expect(listingApiError(undefined, "fallback").message).toBe("fallback")
  })
})
