/**
 * The shop's order settings form turned into the requests that save it.
 * Pure: useSaveShopOrderSettings sends them, in this order.
 *
 * Each setting is a row (setting_type, message_content, enabled). A setting
 * at its default is stored as no row, so leaving the default deletes the
 * row if there is one.
 */

export interface OrderSettingsForm {
  offerMessage: string
  offerEnabled: boolean
  orderMessage: string
  orderEnabled: boolean
  requireAvailability: boolean
  stockTiming: "on_accepted" | "on_received" | "dont_subtract"
  allocationMode: "auto" | "manual" | "none"
  minOrderSize: string
  minOrderSizeEnabled: boolean
  maxOrderSize: string
  maxOrderSizeEnabled: boolean
  minOrderValue: string
  minOrderValueEnabled: boolean
  maxOrderValue: string
  maxOrderValueEnabled: boolean
}

export type OrderSettingOp =
  | {
      op: "upsert"
      settingType: string
      message_content: string
      enabled: boolean
    }
  | { op: "delete"; settingType: string }

/**
 * The upserts and deletes for the form, given the setting types that
 * exist now. A message left empty keeps its stored row.
 */
export function orderSettingsOps(
  form: OrderSettingsForm,
  existingTypes: readonly string[],
): OrderSettingOp[] {
  const ops: OrderSettingOp[] = []
  const has = (type: string) => existingTypes.includes(type)
  const setOrClear = (type: string, on: boolean, message_content: string) => {
    if (on)
      ops.push({
        op: "upsert",
        settingType: type,
        message_content,
        enabled: true,
      })
    else if (has(type)) ops.push({ op: "delete", settingType: type })
  }

  if (form.offerMessage.trim()) {
    ops.push({
      op: "upsert",
      settingType: "offer_message",
      message_content: form.offerMessage,
      enabled: form.offerEnabled,
    })
  }
  if (form.orderMessage.trim()) {
    ops.push({
      op: "upsert",
      settingType: "order_message",
      message_content: form.orderMessage,
      enabled: form.orderEnabled,
    })
  }
  setOrClear("require_availability", form.requireAvailability, "")
  setOrClear(
    "stock_subtraction_timing",
    form.stockTiming !== "on_accepted",
    form.stockTiming,
  )
  setOrClear(
    "allocation_mode",
    form.allocationMode !== "auto",
    form.allocationMode,
  )
  const limits: [string, string, boolean][] = [
    ["min_order_size", form.minOrderSize, form.minOrderSizeEnabled],
    ["max_order_size", form.maxOrderSize, form.maxOrderSizeEnabled],
    ["min_order_value", form.minOrderValue, form.minOrderValueEnabled],
    ["max_order_value", form.maxOrderValue, form.maxOrderValueEnabled],
  ]
  for (const [type, value, enabled] of limits) {
    setOrClear(type, enabled && !!value.trim(), value.trim())
  }
  return ops
}
