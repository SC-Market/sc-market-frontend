import { describe, it, expect } from "vitest"
import { orderSettingsOps, type OrderSettingsForm } from "../orderSettingsPlan"

const defaults: OrderSettingsForm = {
  offerMessage: "",
  offerEnabled: true,
  orderMessage: "",
  orderEnabled: true,
  requireAvailability: false,
  stockTiming: "on_accepted",
  allocationMode: "auto",
  minOrderSize: "",
  minOrderSizeEnabled: false,
  maxOrderSize: "",
  maxOrderSizeEnabled: false,
  minOrderValue: "",
  minOrderValueEnabled: false,
  maxOrderValue: "",
  maxOrderValueEnabled: false,
}

describe("orderSettingsOps", () => {
  it("defaults with nothing stored: no requests", () => {
    expect(orderSettingsOps(defaults, [])).toEqual([])
  })

  it("back to a default deletes the stored row", () => {
    expect(
      orderSettingsOps(defaults, [
        "require_availability",
        "stock_subtraction_timing",
        "allocation_mode",
        "min_order_size",
      ]),
    ).toEqual([
      { op: "delete", settingType: "require_availability" },
      { op: "delete", settingType: "stock_subtraction_timing" },
      { op: "delete", settingType: "allocation_mode" },
      { op: "delete", settingType: "min_order_size" },
    ])
  })

  it("non-defaults are upserted, in save order", () => {
    const form = {
      ...defaults,
      offerMessage: "Hi",
      offerEnabled: false,
      requireAvailability: true,
      stockTiming: "on_received" as const,
      allocationMode: "manual" as const,
      maxOrderValue: " 5000 ",
      maxOrderValueEnabled: true,
    }
    expect(orderSettingsOps(form, [])).toEqual([
      {
        op: "upsert",
        settingType: "offer_message",
        message_content: "Hi",
        enabled: false,
      },
      {
        op: "upsert",
        settingType: "require_availability",
        message_content: "",
        enabled: true,
      },
      {
        op: "upsert",
        settingType: "stock_subtraction_timing",
        message_content: "on_received",
        enabled: true,
      },
      {
        op: "upsert",
        settingType: "allocation_mode",
        message_content: "manual",
        enabled: true,
      },
      {
        op: "upsert",
        settingType: "max_order_value",
        message_content: "5000",
        enabled: true,
      },
    ])
  })

  it("an enabled limit with no value is cleared, an empty message is left alone", () => {
    expect(
      orderSettingsOps(
        { ...defaults, minOrderSizeEnabled: true, minOrderSize: "  " },
        ["min_order_size", "offer_message"],
      ),
    ).toEqual([{ op: "delete", settingType: "min_order_size" }])
  })
})
